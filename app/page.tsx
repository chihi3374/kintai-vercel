"use client";

import { useState } from "react";
import Link from "next/link";

export default function Home() {
  const [employeeName, setEmployeeName] = useState("");
  const [statusMessage, setStatusMessage] = useState("");

  // ボタンが押された時の処理（今はダミーです）
  const handlePunch = async (action: string) => {
    if (!employeeName) {
      setStatusMessage("⚠️ 名前を入力してください！");
      return;
    }

    setStatusMessage(`${employeeName}さん、${action}を記録中...`);

    // ※次回、ここにスプレッドシートへ書き込むAPIを呼び出す処理を書きます！
    setTimeout(() => {
      setStatusMessage(`✅ ${employeeName}さんの「${action}」を記録しました！`);
    }, 1000);
  };

  return (
    <div style={{ padding: "20px", maxWidth: "400px", margin: "0 auto", textAlign: "center", fontFamily: "sans-serif" }}>
      <h1>🕒 勤怠システム</h1>
      <p style={{ color: "#666", marginBottom: "30px" }}>今日も一日お疲れ様です！</p>

      <div style={{ marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="あなたの名前を入力"
          value={employeeName}
          onChange={(e) => setEmployeeName(e.target.value)}
          style={{ 
            padding: "12px", 
            width: "100%", 
            fontSize: "16px", 
            borderRadius: "8px", 
            border: "1px solid #ccc",
            boxSizing: "border-box"
          }}
        />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
        <button onClick={() => handlePunch("出勤")} style={buttonStyle("#4CAF50")}>出勤</button>
        <button onClick={() => handlePunch("退勤")} style={buttonStyle("#F44336")}>退勤</button>
        <button onClick={() => handlePunch("休憩開始")} style={buttonStyle("#FF9800")}>休憩開始</button>
        <button onClick={() => handlePunch("休憩終了")} style={buttonStyle("#2196F3")}>休憩終了</button>
      </div>

      <p style={{ marginTop: "20px", fontWeight: "bold", minHeight: "24px", color: "#333" }}>
        {statusMessage}
      </p>
      
      {/* 管理者画面へのリンク */}
      <div style={{ marginTop: "50px", fontSize: "14px" }}>
        <Link href="/admin/dashboard" style={{ color: "#999", textDecoration: "underline" }}>
          管理者設定はこちら
        </Link>
      </div>
    </div>
  );
}

// ボタンのデザインを使い回すための設定
const buttonStyle = (color: string) => ({
  padding: "15px",
  fontSize: "18px",
  color: "white",
  backgroundColor: color,
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
  fontWeight: "bold" as const,
});