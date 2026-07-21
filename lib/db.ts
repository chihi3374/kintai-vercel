import { neon } from "@neondatabase/serverless";

if (!process.env.DATABASE_URL) {
  throw new Error("環境変数 DATABASE_URL が設定されていません。");
}

// データベース接続オブジェクトをエクスポート
export const sql = neon(process.env.DATABASE_URL);