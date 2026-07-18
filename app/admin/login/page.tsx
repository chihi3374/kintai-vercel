'use client';
import { signIn, useSession, SessionProvider } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
export default function AdminLogin() {
  return (
    <SessionProvider>
      <AdminLoginContent />
    </SessionProvider>
  );
}
function AdminLoginContent() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/admin/dashboard');
    }
  }, [status, router]);

  const handleGoogleLogin = () => {
    signIn('google', { callbackUrl: '/admin/dashboard' });
  };
  return (
    <main className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-2 text-gray-800">管理者ログイン</h1>
        <p className="text-gray-500 text-sm text-center mb-6">
          Googleアカウントで安全にサインインします。
        </p>

        {status === 'loading' ? (
          <div className="text-center text-gray-500 animate-pulse">読み込み中...</div>
        ) : (
          <button
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-50 text-gray-700 font-bold py-3 px-4 rounded-lg border border-gray-300 shadow transition-colors"
          >
            {/* GoogleアイコンのSVG */}
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#EA4335"
                d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114-3.465 0-6.277-2.812-6.277-6.277s2.812-6.277 6.277-6.277c1.554 0 2.964.568 4.053 1.503l3.123-3.123C19.11 1.91 15.932 1 12.24 1 6.033 1 12.24s5.033 11.24 11.24 11.24c5.898 0 10.873-4.226 10.873-11.24 0-.741-.065-1.428-.187-1.955H12.24z"
              />
            </svg>
            Googleアカウントでログイン
          </button>
        )}

        <div className="mt-6 text-center">
          <a href="/" className="text-sm text-blue-500 hover:underline">
            ← 打刻画面に戻る
          </a>
        </div>
      </div>
    </main>
  );
}
