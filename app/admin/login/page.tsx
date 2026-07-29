"use client";

import { signIn, useSession } from "next-auth/react";

export default function AdminLogin() {
  return <AdminLoginContent />;
}

function AdminLoginContent() {
  const { status } = useSession();

  const handleGoogleLogin = () => {
    signIn("google", {
      callbackUrl: "/admin/dashboard",
    });
  };

  return (
    <main className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">

        <h1 className="text-2xl font-bold text-center mb-2">
          管理者ログイン
        </h1>

        <p className="text-gray-500 text-sm text-center mb-6">
          Googleアカウントで安全にサインインします。
        </p>

        {status === "loading" ? (
          <div>
            読み込み中...
          </div>
        ) : (
          <button
            onClick={handleGoogleLogin}
            className="w-full py-3 px-4 rounded-lg border"
          >
            Googleアカウントでログイン
          </button>
        )}

      </div>
    </main>
  );
}
