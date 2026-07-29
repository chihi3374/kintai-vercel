import Providers from "./providers";

export const metadata = {
  title: "勤怠管理システム",
  description: "勤怠管理アプリ",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
