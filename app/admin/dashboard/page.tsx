"use client";
import { useState, useEffect } from "react";
import { SessionProvider, useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  return (
    <SessionProvider>
      <DashboardContent />
    </SessionProvider>
  );
}

function DashboardContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [storeName, setStoreName] = useState("");
  const [pin, setPin] = useState("");
  const [statusText, setStatusText] = useState("");
  const [sheetUrl, setSheetUrl] = useState("");

  // 💡 未ログインだったら、自動的にログインページに飛ばす！
  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/admin/login");
    }
  }, [status, router]);

  // 読み込み中はローディング表示
  if (status === "loading") {
    return <div style={{ padding: "40px", textAlign: "center" }}>読み込み中...</div>;
  }

  // 未ログイン状態のときは何も表示せず（リダイレクト中）、すぐ下へ
  if (!session) {
    return null;
  }

  const handleCreateSystem = async () => {
    if (!storeName || !pin) {
      setStatusText("店舗名とPINを入力してください！");
      return;
    }

    setStatusText("スプレッドシートを作成中...（数秒かかります）");
    setSheetUrl("");

    try {
      const res = await fetch("/api/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storeName, pin })
      });

      const data = await res.json();

      if (data.success) {
        setStatusText(`完了！ ${storeName} の勤怠システムを作成しました！`);
        setSheetUrl(data.spreadsheetUrl);
      } else {
        setStatusText(`エラー: ${data.error}`);
      }
    } catch (error) {
      setStatusText("通信エラーが発生しました");
    }
  };

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

      <p style={{ marginTop: "20px", fontWeight: "bold" }}>{statusText}</p>
      
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
