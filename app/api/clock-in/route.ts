import { NextResponse } from "next/server";
import { google } from "googleapis";
import { sql } from "@/lib/db";

export async function POST(req: Request) {
  try {

    // ===========================
    // 打刻データ取得
    // ===========================
    const { storeToken, employeeName, type } = await req.json();


    if (!storeToken || !employeeName || !type) {
      return NextResponse.json(
        {
          success: false,
          error: "入力項目が不足しています",
        },
        {
          status: 400,
        }
      );
    }



    // ===========================
    // 店舗検索
    // ===========================
    const result = await sql`
      SELECT 
        spreadsheet_id,
        store_name
      FROM company_settings
      WHERE store_token = ${storeToken}
      LIMIT 1
    `;



    if (result.length === 0) {

      return NextResponse.json(
        {
          success: false,
          error: "店舗情報が見つかりません",
        },
        {
          status: 404,
        }
      );

    }



    const {
      spreadsheet_id: spreadsheetId,
      store_name: storeName,

    } = result[0];




    // ===========================
    // Google Sheets認証
    // ===========================

    const clientEmail =
      process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;


    const privateKey =
      process.env.GOOGLE_SERVICE_ACCOUNT_KEY
      ?.replace(/\\n/g, "\n");



    if (!clientEmail || !privateKey) {

      throw new Error(
        "Google Service Account設定エラー"
      );

    }



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
    // 日本時間取得
    // ===========================

    const now = new Date().toLocaleString(
      "ja-JP",
      {
        timeZone: "Asia/Tokyo",
      }
    );





    // ===========================
    // 勤怠シートへ追加
    // ===========================

    await sheets.spreadsheets.values.append({

      spreadsheetId,

      range: "勤怠!A:F",

      valueInputOption: "USER_ENTERED",

      requestBody: {

        values: [

          [
            now,
            "",
            employeeName,
            type === "出勤" ? now : "",
            type === "退勤" ? now : "",
            ""
          ]

        ],

      },

    });





    return NextResponse.json({

      success: true,

      message:
        `${storeName}で${type}を記録しました`,

    });



  } catch (error: any) {


    console.error(
      "Clock-in Error:",
      error
    );


    return NextResponse.json(

      {
        success: false,
        error: "打刻処理中にエラーが発生しました",
      },

      {
        status: 500,
      }

    );

  }
}
