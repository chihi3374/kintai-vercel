"use client";

import { useEffect, useState } from "react";
import { SessionProvider, useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

type Company = {
  id: number;
  store_name: string;
  spreadsheet_id: string;
  spreadsheet_url: string;
};

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

  const [loading, setLoading] = useState(true);
  const [company, setCompany] = useState<Company | null>(null);

  const [storeName, setStoreName] = useState("");
  const [statusText, setStatusText] = useState("");

  // ログイン確認
  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/admin/login");
    }
  }, [status, router]);

  // 店舗取得
  useEffect(() => {
    if (status === "authenticated") {
      loadCompany();
    }
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

  async function createCompany() {
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

      await loadCompany();

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
    <div
      style={{
        maxWidth: 700,
        margin: "40px auto",
        padding: 20,
      }}
    >
      <h1>管理者ダッシュボード</h1>

      <p>
        ようこそ {session.user?.name} さん
      </p>

      <hr />

      {!company ? (
        <>
          <h2>初回セットアップ</h2>

          <p>
            最初に店舗を作成してください。
          </p>

          <input
            value={storeName}
            onChange={(e) => setStoreName(e.target.value)}
            placeholder="店舗名"
            style={{
              width: 300,
              padding: 10,
            }}
          />

          <br />
          <br />

          <button
            onClick={createCompany}
            style={{
              padding: "10px 20px",
            }}
          >
            店舗を作成
          </button>
        </>
      ) : (
        <>
          <h2>{company.store_name}</h2>

          <p>
            店舗のセットアップは完了しています。
          </p>

          <a
            href={company.spreadsheet_url}
            target="_blank"
            rel="noopener noreferrer"
          >
            <button
              style={{
                padding: "10px 20px",
              }}
            >
              スプレッドシートを開く
            </button>
          </a>

          <br />
          <br />

          {/* 次回追加 */}
          <button
            disabled
            style={{
              padding: "10px 20px",
            }}
          >
            従業員管理（準備中）
          </button>
        </>
      )}

      <br />
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
