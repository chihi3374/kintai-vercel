import { NextResponse } from "next/server";
import { google } from "googleapis";
import { sql } from "@/lib/db";


// ===========================
// Google Sheets取得
// ===========================
async function getSheets(spreadsheetId: string) {
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

  return google.sheets({
    version: "v4",
    auth,
  });
}


// ===========================
// 店舗取得
// ===========================
async function getSpreadsheetId(storeToken: string) {

  const result = await sql`
    SELECT spreadsheet_id
    FROM company_settings
    WHERE store_token = ${storeToken}
    LIMIT 1
  `;


  if (result.length === 0) {
    throw new Error("店舗が見つかりません");
  }


  return result[0].spreadsheet_id;
}



// ===========================
// GET 従業員一覧
// ===========================
export async function GET(req: Request) {

  try {

    const { searchParams } = new URL(req.url);

    const storeToken =
      searchParams.get("storeToken");


    if (!storeToken) {
      return NextResponse.json(
        {
          success:false,
          error:"storeTokenがありません"
        },
        {
          status:400
        }
      );
    }


    const spreadsheetId =
      await getSpreadsheetId(storeToken);


    const sheets =
      await getSheets(spreadsheetId);


    const response =
      await sheets.spreadsheets.values.get({
        spreadsheetId,
        range:"従業員!A2:D",
      });


    const rows =
      response.data.values ?? [];


    const employees =
      rows
      .filter(row => row[2] !== "削除")
      .map(row => ({
        id: row[0],
        name: row[1],
        status: row[2],
        hourly: Number(row[3] ?? 0),
      }));


    return NextResponse.json({
      success:true,
      employees
    });



  } catch(error){

    console.error(error);

    return NextResponse.json(
      {
        success:false,
        error:"従業員取得失敗"
      },
      {
        status:500
      }
    );
  }
}



// ===========================
// POST 従業員追加
// ===========================
export async function POST(req:Request){

  try{

    const body = await req.json();

    const {
      storeToken,
      name,
      hourly
    } = body;


    if(!storeToken || !name || !hourly){

      return NextResponse.json(
        {
          success:false,
          error:"入力不足"
        },
        {
          status:400
        }
      );
    }



    const spreadsheetId =
      await getSpreadsheetId(storeToken);



    const sheets =
      await getSheets(spreadsheetId);



    const id =
      crypto.randomUUID();



    await sheets.spreadsheets.values.append({

      spreadsheetId,

      range:"従業員!A:D",

      valueInputOption:"USER_ENTERED",

      requestBody:{
        values:[
          [
            id,
            name,
            "在籍",
            Number(hourly)
          ]
        ]
      }

    });



    return NextResponse.json({
      success:true,
      id
    });



  }catch(error){

    console.error(error);

    return NextResponse.json(
      {
        success:false,
        error:"従業員追加失敗"
      },
      {
        status:500
      }
    );

  }

}



// ===========================
// PUT 編集
// ===========================
export async function PUT(req:Request){

  try{

    const {
      storeToken,
      id,
      name,
      status,
      hourly
    } = await req.json();



    const spreadsheetId =
      await getSpreadsheetId(storeToken);



    const sheets =
      await getSheets(spreadsheetId);



    const response =
      await sheets.spreadsheets.values.get({

        spreadsheetId,

        range:"従業員!A:D"

      });



    const rows =
      response.data.values ?? [];



    const index =
      rows.findIndex(
        row => row[0] === id
      );



    if(index === -1){

      throw new Error("従業員なし");

    }



    await sheets.spreadsheets.values.update({

      spreadsheetId,

      range:`従業員!A${index+1}:D${index+1}`,

      valueInputOption:"USER_ENTERED",

      requestBody:{
        values:[
          [
            id,
            name ?? rows[index][1],
            status ?? rows[index][2],
            hourly ?? rows[index][3] ?? 0
          ]
        ]
      }

    });



    return NextResponse.json({
      success:true
    });


  }catch(error){

    console.error(error);

    return NextResponse.json(
      {
        success:false,
        error:"編集失敗"
      },
      {
        status:500
      }
    );

  }

}



// ===========================
// DELETE 削除
// ===========================
export async function DELETE(req:Request){

  try{

    const {
      storeToken,
      id
    } = await req.json();



    const spreadsheetId =
      await getSpreadsheetId(storeToken);



    const sheets =
      await getSheets(spreadsheetId);



    const response =
      await sheets.spreadsheets.values.get({

        spreadsheetId,

        range:"従業員!A:D"

      });



    const rows =
      response.data.values ?? [];



    const index =
      rows.findIndex(
        row => row[0] === id
      );



    if(index === -1){

      throw new Error("従業員なし");

    }



    await sheets.spreadsheets.values.update({

      spreadsheetId,

      range:`従業員!C${index+1}`,

      valueInputOption:"USER_ENTERED",

      requestBody:{
        values:[
          [
            "削除"
          ]
        ]
      }

    });



    return NextResponse.json({
      success:true
    });



  }catch(error){

    console.error(error);


    return NextResponse.json(
      {
        success:false,
        error:"削除失敗"
      },
      {
        status:500
      }
    );

  }

}
