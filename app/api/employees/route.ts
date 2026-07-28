import { NextResponse } from "next/server";
import { google } from "googleapis";
import { sql } from "@/lib/db";

export async function GET(req: Request) {
  try {
    // ===========================
    // storeToken取得
    // ===========================
    const { searchParams } = new URL(req.url);
    const storeToken = searchParams.get("storeToken");

    if (!storeToken) {
      return NextResponse.json(
        {
          success: false,
          error: "storeTokenがありません",
        },
        { status: 400 }
      );
    }

    // ===========================
    // 店舗情報取得
    // ===========================
    const result = await sql`
      SELECT spreadsheet_id
      FROM company_settings
      WHERE store_token = ${storeToken}
      LIMIT 1
    `;

    if (result.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "店舗が見つかりません",
        },
        { status: 404 }
      );
    }

    const spreadsheetId = result[0].spreadsheet_id;

    // ===========================
    // Google認証
    // ===========================
    const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const privateKey =
      process.env.GOOGLE_SERVICE_ACCOUNT_KEY?.replace(/\\n/g, "\n");

    const auth = new google.auth.JWT({
      email: clientEmail,
      key: privateKey,
      scopes: [
        "https://www.googleapis.com/auth/spreadsheets",
      ],
    });

    const sheets = google.sheets({
      version: "v4",
      auth,
    });

    // ===========================
    // 従業員シート取得
    // ===========================
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: "従業員!A2:C",
    });

    const rows = response.data.values ?? [];

    // ===========================
    // JSON整形
    // ===========================
    const employees = rows
      .filter((row) => row[2] === "在籍")
      .map((row) => ({
        id: row[0],
        name: row[1],
      }));

    return NextResponse.json({
      success: true,
      employees,
    });

  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        error: "従業員取得に失敗しました",
      },
      { status: 500 }
    );
  }
}
