"use client";
import { useState } from "react";
import { SessionProvider, useSession, signOut } from "next-auth/react";

export default function DashboardPage() {
  return (
    <SessionProvider>
      <DashboardContent />
    </SessionProvider>
  );
}

function DashboardContent() {
  const { data: session } = useSession();
  const [storeName, setStoreName] = useState("");
  const [pin, setPin] = useState("");
  const [status, setStatus] = useState("");
  const [sheetUrl, setSheetUrl] = useState("");

  const handleCreateSystem = async () => {
    if (!storeName || !pin) {
      setStatus("店舗名とPINを入力してください！");
      return;
    }

    setStatus("スプレッドシートを作成中...（数秒かかります）");
    setSheetUrl("");

    try {
      const res = await fetch("/api/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storeName, pin })
      });

      const data = await res.json();

      if (data.success) {
        setStatus(`完了！ ${storeName} の勤怠システムを作成しました！`);
        setSheetUrl(data.spreadsheetUrl);
      } else {
        setStatus(`エラー: ${data.error}`);
      }
    } catch (error) {
      setStatus("通信エラーが発生しました");
    }
  };

  // ログインしていない場合は、ログイン画面へのリンクを表示する
  if (!session) {
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>
        <h2>管理者としてログインしてください</h2>
        <p style={{ margin: "20px 0" }}>このページを見るには、管理者アカウントでのログインが必要です。</p>
        <a 
          href="/admin/login" 
          style={{ 
            display: "inline-block", 
            padding: "10px 20px", 
            backgroundColor: "#0070f3", 
            color: "white", 
            textDecoration: "none", 
            borderRadius: "5px" 
          }}
        >
          ログイン画面へ移動する
        </a>
      </div>
    );
  }

  return (
    <div style={{ padding: "20px" }}>
      <h1>管理者ダッシュボード</h1>
      <p>ようこそ、{session.user?.name} さん</p>
      
      <div style={{ marginTop: "20px", border: "1px solid #ccc", padding: "20px" }}>
        <h2>新規店舗セットアップ</h2>
        <input 
          type="text" 
          placeholder="店舗名を入力" 
          value={storeName} 
          onChange={(e) => setStoreName(e.target.value)} 
          style={{ display: "block", marginBottom: "10px", padding: "8px", width: "100%", maxWidth: "300px" }}
        />
        <input 
          type="password" 
          placeholder="管理者用PIN（4桁）" 
          value={pin} 
          onChange={(e) => setPin(e.target.value)} 
          style={{ display: "block", marginBottom: "10px", padding: "8px", width: "100%", maxWidth: "300px" }}
        />
        <button onClick={handleCreateSystem} style={{ padding: "10px 20px", cursor: "pointer" }}>
          システムを初期化する
        </button>
      </div>

      <p style={{ marginTop: "20px", fontWeight: "bold" }}>{status}</p>
      
      {sheetUrl && (
        <div style={{ marginTop: "10px", padding: "10px", backgroundColor: "#e6ffe6", border: "1px solid #00cc00" }}>
          <p>👇 あなたのGoogleドライブに新しいファイルが作成されました！</p>
          <a href={sheetUrl} target="_blank" rel="noopener noreferrer" style={{ color: "blue", textDecoration: "underline" }}>
            作成されたスプレッドシートを開く
          </a>
        </div>
      )}
      
      <button onClick={() => signOut()} style={{ marginTop: "30px" }}>ログアウト</button>
    </div>
  );
}
    </div>
  );
}
