import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { sql } from "@/lib/db";

export async function GET() {
  try {
    // ===========================
    // ログイン確認
    // ===========================
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        {
          success: false,
          error: "ログインしてください",
        },
        { status: 401 }
      );
    }

    const adminEmail = session.user.email;


    // ===========================
    // 店舗情報取得
    // ===========================
    const result = await sql`
      SELECT
        store_name,
        spreadsheet_id,
        spreadsheet_url,
        store_token
      FROM company_settings
      WHERE admin_email = ${adminEmail}
      LIMIT 1
    `;


    if (result.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "店舗が登録されていません",
        },
        { status: 404 }
      );
    }


    const company = result[0];


    // ===========================
    // 返却
    // ===========================
    return NextResponse.json({
      success: true,
      company: {
        storeName: company.store_name,
        spreadsheetId: company.spreadsheet_id,
        spreadsheetUrl: company.spreadsheet_url,
        storeToken: company.store_token,
      },
    });


  } catch (error) {

    console.error("Company API Error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "店舗情報取得失敗",
      },
      {
        status: 500,
      }
    );
  }
}
