import { NextResponse } from "next/server";
import { google } from "googleapis";
import { sql } from "@/lib/db";


// ===========================
// Google Sheets
// ===========================
async function getSheets() {

  const auth = new google.auth.JWT({

    email:
      process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,

    key:
      process.env.GOOGLE_SERVICE_ACCOUNT_KEY
      ?.replace(/\\n/g, "\n"),

    scopes:[
      "https://www.googleapis.com/auth/spreadsheets"
    ]

  });


  return google.sheets({
    version:"v4",
    auth
  });

}



// ===========================
// Spreadsheet取得
// ===========================
async function getSpreadsheetId(
  storeToken:string
){

  const result = await sql`

    SELECT spreadsheet_id

    FROM company_settings

    WHERE store_token = ${storeToken}

    LIMIT 1

  `;


  if(result.length === 0){

    throw new Error(
      "店舗が見つかりません"
    );

  }


  return result[0].spreadsheet_id;

}



// ===========================
// POST 給与計算
// ===========================
export async function POST(
  req:Request
){

  try{


    const {

      storeToken,

      startDate,

      endDate

    } = await req.json();



    if(
      !storeToken ||
      !startDate ||
      !endDate
    ){

      return NextResponse.json({

        success:false,

        error:"入力不足です"

      },
      {
        status:400
      });

    }




    const spreadsheetId =
      await getSpreadsheetId(
        storeToken
      );



    const sheets =
      await getSheets();





    // ===========================
    // 従業員取得
    // ===========================

    const employeeData =
      await sheets.spreadsheets.values.get({

        spreadsheetId,

        range:"従業員!A:D"

      });



    const employeeRows =
      employeeData.data.values ?? [];



    const employees =
      employeeRows
      .slice(1)
      .filter(row=>row[2] !== "削除")
      .map(row=>({

        id:row[0],

        name:row[1],

        hourly:Number(row[3] ?? 0)

      }));





    // ===========================
    // 勤怠取得
    // ===========================

    const attendanceData =
      await sheets.spreadsheets.values.get({

        spreadsheetId,

        range:"勤怠!A:F"

      });



    const attendanceRows =
      attendanceData.data.values ?? [];





    // ===========================
    // 集計
    // ===========================

    const result =
      employees.map(employee=>{


        let hours = 0;



        attendanceRows
        .slice(1)
        .forEach(row=>{


          const date = row[0];

          const employeeId =
            row[1];

          const workHours =
            Number(row[5] ?? 0);




          if(

            String(employeeId)
            ===
            String(employee.id)

            &&

            date >= startDate

            &&

            date <= endDate

          ){

            hours += workHours;

          }


        });



        hours =
          Math.round(hours * 100)
          /
          100;



        return {

          id:employee.id,

          name:employee.name,

          hourly:employee.hourly,

          hours,

          salary:
            Math.floor(
              hours *
              employee.hourly
            )

        };


      });





    return NextResponse.json({

      success:true,

      results:result

    });



  }catch(error){


    console.error(error);


    return NextResponse.json({

      success:false,

      error:"給与計算失敗"

    },
    {
      status:500
    });


  }

}
