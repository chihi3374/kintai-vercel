import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

console.log("DEBUG: CLIENT_ID:", process.env.GOOGLE_CLIENT_ID);
console.log(
  "DEBUG: CLIENT_SECRET:",
  process.env.GOOGLE_CLIENT_SECRET ? "読み込み成功" : "読み込み失敗！"
);

export const authOptions: NextAuthOptions = {
  debug: true,

  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      authorization: {
        params: {
          scope:
            "openid email profile https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/spreadsheets",
          prompt: "select_account",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
  ],

  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token;
      }
      return token;
    },

    async session({ session, token }) {
      (session as any).accessToken = token.accessToken;
      return session;
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
