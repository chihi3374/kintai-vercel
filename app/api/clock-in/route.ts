import { NextResponse } from "next/server";
import { google } from "googleapis";
import { sql } from "@/lib/db";

export async function POST(req: Request) {
  try {

    // ===========================
    // 1. データ取得
    // ===========================
    const {
      storeToken,
      employeeId,
      employeeName,
      type,
    } = await req.json();


    if (!storeToken || !employeeId || !employeeName || !type) {
      return NextResponse.json(
        {
          success: false,
          error: "入力不足です"
        },
        { status:400 }
      );
    }


    // ===========================
    // 2. 店舗取得
    // ===========================
    const result = await sql`
      SELECT spreadsheet_id, store_name
      FROM company_settings
      WHERE store_token = ${storeToken}
      LIMIT 1
    `;


    if(result.length === 0){
      return NextResponse.json(
        {
          success:false,
          error:"店舗が見つかりません"
        },
        {status:404}
      );
    }


    const {
      spreadsheet_id: spreadsheetId,
      store_name: storeName
    } = result[0];



    // ===========================
    // 3. Google認証
    // ===========================

    const clientEmail =
      process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;

    const privateKey =
      process.env.GOOGLE_SERVICE_ACCOUNT_KEY
      ?.replace(/\\n/g,"\n");


    const auth = new google.auth.JWT({
      email:clientEmail,
      key:privateKey,
      scopes:[
        "https://www.googleapis.com/auth/spreadsheets"
      ]
    });


    const sheets = google.sheets({
      version:"v4",
      auth
    });



    // ===========================
    // 4. 現在時刻
    // ===========================

    const now = new Date();

    const date =
      now.toLocaleDateString(
        "ja-JP",
        {
          timeZone:"Asia/Tokyo"
        }
      );

    const time =
      now.toLocaleTimeString(
        "ja-JP",
        {
          timeZone:"Asia/Tokyo",
          hour:"2-digit",
          minute:"2-digit"
        }
      );



    // ===========================
    // 5. 出勤処理
    // ===========================

    if(type === "clock_in"){

      await sheets.spreadsheets.values.append({

        spreadsheetId,

        range:"勤怠!A:F",

        valueInputOption:"USER_ENTERED",

        requestBody:{
          values:[
            [
              date,
              employeeId,
              employeeName,
              time,
              "",
              ""
            ]
          ]
        }

      });


    }



    // ===========================
    // 6. 退勤処理
    // ===========================

    if(type === "clock_out"){


      // 勤怠データ取得

      const data =
        await sheets.spreadsheets.values.get({

          spreadsheetId,

          range:"勤怠!A:F"

        });



      const rows = data.data.values || [];


      let targetRow = -1;
      let startTime = "";



      // 今日の未退勤データ検索

      rows.forEach((row,index)=>{

        if(
          row[0] === date &&
          String(row[1]) === String(employeeId) &&
          row[4] === ""
        ){

          targetRow = index + 1;
          startTime = row[3];

        }

      });



      if(targetRow === -1){

        return NextResponse.json({
          success:false,
          error:"出勤データがありません"
        });

      }



      // 勤務時間計算

      const start =
        new Date(`${date} ${startTime}`);

      const end =
        new Date(`${date} ${time}`);


      let hours =
        (end.getTime()-start.getTime())
        /1000/60/60;


      // 小数2桁
      hours =
        Math.round(hours*100)/100;



      // E,F更新

      await sheets.spreadsheets.values.update({

        spreadsheetId,

        range:`勤怠!E${targetRow}:F${targetRow}`,

        valueInputOption:"USER_ENTERED",

        requestBody:{
          values:[
            [
              time,
              hours
            ]
          ]
        }

      });


    }



    return NextResponse.json({

      success:true,

      message:
      `${storeName} ${type} 完了`

    });



  } catch(error:any){

    console.error(error);

    return NextResponse.json(
      {
        success:false,
        error:"打刻処理エラー"
      },
      {
        status:500
      }
    );

  }
}
