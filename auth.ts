import NextAuth from "next-auth";
import Line from "next-auth/providers/line";
import { getUserIdByLineId, upsertUserByLineId } from "@/lib/db/users";

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  providers: [
    Line({
      clientId: process.env.LINE_CLIENT_ID,
      clientSecret: process.env.LINE_CLIENT_SECRET,
    }),
  ],
  pages: {
    signIn: "/",
  },
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account?.provider === "line" && account.providerAccountId) {
        const lineUserId = account.providerAccountId;
        const displayName =
          typeof profile?.name === "string" ? profile.name : null;

        token.lineUserId = lineUserId;
        token.displayName = displayName ?? undefined;

        const userId =
          (await upsertUserByLineId(lineUserId, displayName)) ??
          (await getUserIdByLineId(lineUserId));

        if (userId) {
          token.userId = userId;
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        if (token.userId) {
          session.user.id = token.userId;
        }
        if (token.lineUserId) {
          session.user.lineUserId = token.lineUserId;
        }
        if (token.displayName) {
          session.user.displayName = token.displayName;
        }
      }

      return session;
    },
  },
});
