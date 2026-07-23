import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { sql } from "@/lib/db";

export async function GET() {
  try {
    // ログイン確認
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

    // DB検索
    const result = await sql`
      SELECT
        id,
        store_name,
        spreadsheet_id
        spreadsheet_url
      FROM company_settings
      WHERE admin_email = ${session.user.email}
      LIMIT 1
    `;

    // 店舗未作成
    if (result.length === 0) {
      return NextResponse.json({
        success: true,
        hasCompany: false,
      });
    }

    // 店舗あり
    return NextResponse.json({
      success: true,
      hasCompany: true,
      company: result[0],
    });

  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        error: "取得に失敗しました",
      },
      { status: 500 }
    );
  }
}
