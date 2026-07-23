import { NextResponse } from "next/server";
import { google } from "googleapis";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { sql } from "@/lib/db";

export async function POST(req: Request) {
  try {
    // ===========================
    // ログイン確認
    // ===========================
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: "ログインしてください" },
        { status: 401 }
      );
    }

    const adminEmail = session.user.email;

    // ===========================
    // リクエスト取得
    // ===========================
    const { storeName } = await req.json();

    if (!storeName) {
      return NextResponse.json(
        { success: false, error: "店舗名を入力してください" },
        { status: 400 }
      );
    }

    // ===========================
    // 既に店舗があるか確認
    // ===========================
    const exists = await sql`
      SELECT id
      FROM company_settings
      WHERE admin_email = ${adminEmail}
      LIMIT 1
    `;

    if (exists.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: "すでに店舗が登録されています",
        },
        { status: 400 }
      );
    }

    // ===========================
    // Google認証
    // ===========================
    const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const privateKey =
      process.env.GOOGLE_SERVICE_ACCOUNT_KEY?.replace(/\\n/g, "\n");

    if (!clientEmail || !privateKey) {
      throw new Error("Google Service Account が設定されていません");
    }

    const auth = new google.auth.JWT({
      email: clientEmail,
      key: privateKey,
      scopes: [
        "https://www.googleapis.com/auth/spreadsheets",
        "https://www.googleapis.com/auth/drive",
      ],
    });

    const sheets = google.sheets({
      version: "v4",
      auth,
    });

    // ===========================
    // Spreadsheet作成
    // ===========================
    const sheet = await sheets.spreadsheets.create({
      requestBody: {
        properties: {
          title: `${storeName} 勤怠管理`,
        },
      },
    });

    const spreadsheetId = sheet.data.spreadsheetId!;
    const spreadsheetUrl = sheet.data.spreadsheetUrl!;

    // ===========================
    // シート追加
    // ===========================
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: [
          {
            addSheet: {
              properties: {
                title: "従業員",
              },
            },
          },
          {
            addSheet: {
              properties: {
                title: "勤怠",
              },
            },
          },
        ],
      },
    });

    // ===========================
    // ヘッダー追加
    // ===========================
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: "従業員!A1:C1",
      valueInputOption: "RAW",
      requestBody: {
        values: [["ID", "氏名", "在籍"]],
      },
    });

    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: "勤怠!A1:F1",
      valueInputOption: "RAW",
      requestBody: {
        values: [["日付", "従業員ID", "氏名", "出勤", "退勤", "勤務時間"]],
      },
    });

    // ===========================
    // DB保存
    // ===========================
    await sql`
      INSERT INTO company_settings
      (
        store_name,
        admin_email,
        spreadsheet_id
        spreadsheet_url
      )
      VALUES
      (
        ${storeName},
        ${adminEmail},
        ${spreadsheetId}
        ${spreadsheetUrl}
      )
    `;

    return NextResponse.json({
      success: true,
      spreadsheetUrl,
    });
  } catch (err) {
    console.error(err);

    return NextResponse.json(
      {
        success: false,
        error: "セットアップに失敗しました",
      },
      { status: 500 }
    );
  }
}
