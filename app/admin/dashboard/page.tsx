"use client";

import { useEffect, useState } from "react";
import {
  SessionProvider,
  useSession,
  signOut,
} from "next-auth/react";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  return (
    <SessionProvider>
      <DashboardContent />
    </SessionProvider>
  );
}

type Company = {
  id: number;
  store_name: string;
  spreadsheet_id: string;
};

function DashboardContent() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);

  const [storeName, setStoreName] = useState("");

  const [statusText, setStatusText] = useState("");

  // ログイン確認
  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/admin/login");
    }
  }, [status, router]);

  // 店舗情報取得
  useEffect(() => {
    if (status !== "authenticated") return;

    loadCompany();
  }, [status]);

  async function loadCompany() {
    setLoading(true);

    try {
      const res = await fetch("/api/company");
      const data = await res.json();

      if (data.success && data.hasCompany) {
        setCompany(data.company);
      } else {
        setCompany(null);
      }
    } catch {
      setStatusText("会社情報の取得に失敗しました");
    }

    setLoading(false);
  }

  async function handleCreateCompany() {
    if (!storeName.trim()) {
      setStatusText("店舗名を入力してください");
      return;
    }

    setStatusText("店舗を作成しています...");

    try {
      const res = await fetch("/api/setup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          storeName,
        }),
      });

      const data = await res.json();

      if (!data.success) {
        setStatusText(data.error);
        return;
      }

      setStatusText("店舗を作成しました");

      // 再取得
      loadCompany();

    } catch {
      setStatusText("通信エラー");
    }
  }

  if (status === "loading" || loading) {
    return (
      <div style={{ padding: 40 }}>
        読み込み中...
      </div>
    );
  }

  if (!session) return null;

  return (
    <div style={{ padding: 30 }}>

      <h1>管理者ダッシュボード</h1>

      <p>
        ようこそ {session.user?.name}
      </p>

      <hr />

      {/* 初回セットアップ */}

      {!company && (
        <>

          <h2>初回セットアップ</h2>

          <input
            value={storeName}
            onChange={(e)=>setStoreName(e.target.value)}
            placeholder="店舗名"
          />

          <br />
          <br />

          <button
            onClick={handleCreateCompany}
          >
            店舗を作成
          </button>

        </>
      )}

      {/* 通常画面 */}

      {company && (
        <>

          <h2>{company.store_name}</h2>

          <p>
            店舗の作成は完了しています。
          </p>

          <button>
            スプレッドシートを開く
          </button>

        </>
      )}

      <br />

      <p>{statusText}</p>

      <hr />

      <button
        onClick={() =>
          signOut({
            callbackUrl: "/admin/login",
          })
        }
      >
        ログアウト
      </button>

    </div>
  );
}
