import { NextResponse } from "next/server";
import { google } from "googleapis";
import { sql } from "@/lib/db";

export async function POST(req: Request) {
  try {
    // 1. 表の打刻画面（iPad等）から送られてきたデータを受け取る
    const { pin, employeeName, type } = await req.json(); // type は "出勤" か "退勤"

    if (!pin || !employeeName || !type) {
      return NextResponse.json({ success: false, error: "入力項目が不足しています" }, { status: 400 });
    }

    // 2. 環境変数（裏側）を使ってNeon DBにアクセスし、該当店舗の「スプレッドシートID」を探す
    const result = await sql`
      SELECT spreadsheet_id, store_name 
      FROM company_settings 
      WHERE pin_code = ${pin} 
      LIMIT 1
    `;

    // もしPINコードがDBに無かったらエラーを返す
    if (result.length === 0) {
      return NextResponse.json({ success: false, error: "店舗が未登録か、PINが間違っています" }, { status: 404 });
    }

    // DBから無事見つかったら、スプレッドシートIDと店舗名を取り出す
    const { spreadsheet_id: spreadsheetId, store_name: storeName } = result[0];

    // 3. 環境変数を使ってGoogleロボット（サービスアカウント）を呼び出す
    const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    // Vercel環境で改行が崩れないようにするおまじない
    const privateKey = process.env.GOOGLE_SERVICE_ACCOUNT_KEY?.replace(/\\n/g, "\n");

    const auth = new google.auth.JWT({
      email: clientEmail,
      key: privateKey,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const sheets = google.sheets({ version: "v4", auth });

    // 4. 現在の時刻（日本時間）を取得する
    const now = new Date().toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" });

    // 5. Googleロボットにお願いして、スプレッドシートの末尾に打刻データを書き込んでもらう
    await sheets.spreadsheets.values.append({
      spreadsheetId: spreadsheetId, // DBから見つけたシートID
      range: "Sheet1!A:C",          // A列〜C列に書き込む
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [
          [now, employeeName, type] // [打刻日時, 山田太郎, 出勤] みたいな感じで1行追加
        ],
      },
    });

    // 6. 表の画面に「書き込み成功したよ！」と結果を報告する
    return NextResponse.json({
      success: true,
      message: `${storeName} で ${type} を記録しました！`,
    });

  } catch (error: any) {
    console.error("Clock-in Error:", error);
    return NextResponse.json({ success: false, error: "打刻処理中にエラーが発生しました" }, { status: 500 });
  }
}
