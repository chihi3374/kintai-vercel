import { NextResponse } from "next/server";
import { google } from "googleapis";
import { sql } from "@/lib/db";

export async function POST(req: Request) {
  try {
    // 1. ダッシュボードから送られてきたデータを受け取る
    const { storeName, pin } = await req.json();

    if (!storeName || !pin) {
      return NextResponse.json({ success: false, error: "店舗名とPINが必要です" }, { status: 400 });
    }

    // 2. 環境変数を使ってGoogleロボット（サービスアカウント）を呼び出す
    const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    // Vercel等で改行が崩れないようにするおまじない
    const privateKey = process.env.GOOGLE_SERVICE_ACCOUNT_KEY?.replace(/\\n/g, "\n");

    const auth = new google.auth.JWT({
      email: clientEmail,
      key: privateKey,
      scopes: [
        "https://www.googleapis.com/auth/spreadsheets",
        "https://www.googleapis.com/auth/drive" // 権限変更のためにDriveの権限も必要
      ],
    });

    const sheets = google.sheets({ version: "v4", auth });
    const drive = google.drive({ version: "v3", auth });

    // 3. 新しいスプレッドシートを作成する
    const sheet = await sheets.spreadsheets.create({
      requestBody: {
        properties: {
          title: `${storeName} タイムカード`, // 作成されるファイル名
        },
      },
    });

    const spreadsheetId = sheet.data.spreadsheetId;
    const spreadsheetUrl = sheet.data.spreadsheetUrl;

    // 4. 管理者（人間）がスプレッドシートを開けるように権限を付与する
    // ※ サービスアカウントが作ったファイルは初期状態では誰も見れないため
    if (spreadsheetId) {
      await drive.permissions.create({
        fileId: spreadsheetId,
        requestBody: {
          type: "anyone", // 誰でも
          role: "writer", // 編集可能（リンクを知っている人限定）
        },
      });
    }

    // 5. 環境変数を使ってNeonデータベースに「PINとシートID」を保存する
    await sql`
      INSERT INTO company_settings (store_name, pin_code, spreadsheet_id)
      VALUES (${storeName}, ${pin}, ${spreadsheetId})
    `;

    // 6. ダッシュボードに「成功したよ！URLはこれだよ！」と返す
    return NextResponse.json({
      success: true,
      spreadsheetUrl: spreadsheetUrl,
    });

  } catch (error: any) {
    console.error("Setup API Error:", error);
    return NextResponse.json({ success: false, error: "セットアップ中にエラーが発生しました" }, { status: 500 });
  }
}
