import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import {
  getUserByEmail,
  createUser,
  linkGoogleAccount,
  getUserPasswordHash,
  getUserByLoginToken,
  clearLoginToken,
} from "@/lib/users";
import { verifyRecaptcha } from "@/lib/recaptcha";
import { isTokenExpired } from "@/lib/tokens";
import { sendSlackNotification } from "@/lib/slack";

function fullName(firstName: string, lastName?: string): string {
  return lastName ? `${firstName} ${lastName}` : firstName;
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  session: { strategy: "jwt" },
  trustHost: true,
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    Credentials({
      credentials: {
        email: {},
        password: {},
        recaptchaToken: {},
      },
      authorize: async (credentials) => {
        const email = credentials?.email as string;
        const password = credentials?.password as string;
        const recaptchaToken = credentials?.recaptchaToken as string;
        if (!email || !password) return null;

        if (!(await verifyRecaptcha(recaptchaToken))) {
          throw new Error("RECAPTCHA_FAILED");
        }

        const user = getUserByEmail(email);
        if (!user) return null;
        if (!user.emailVerified) throw new Error("EMAIL_NOT_VERIFIED");

        const hash = getUserPasswordHash(email);
        if (!hash) return null;

        const valid = await bcrypt.compare(password, hash);
        if (!valid) return null;

        return {
          id: user.id,
          email: user.email,
          name: fullName(user.firstName, user.lastName),
        };
      },
    }),
    // Auto-login used only right after email verification, to establish a
    // real session for accounts that don't have a password yet (the
    // lightweight Opportunity Finder request flow). The token is a
    // single-use, 10-minute-expiry secret generated server-side and never
    // exposed to the browser - see /api/verify/[token]/route.ts.
    Credentials({
      id: "verified-login",
      credentials: { token: {} },
      authorize: async (credentials) => {
        const token = credentials?.token as string;
        if (!token) return null;

        const user = getUserByLoginToken(token);
        if (!user || !user.loginTokenExpiresAt || isTokenExpired(user.loginTokenExpiresAt)) {
          return null;
        }
        clearLoginToken(user.id);

        return {
          id: user.id,
          email: user.email,
          name: fullName(user.firstName, user.lastName),
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        const email = user.email!;
        const googleId = account.providerAccountId;
        const gProfile = profile as
          | { given_name?: string; family_name?: string }
          | undefined;

        let dbUser = getUserByEmail(email);
        if (!dbUser) {
          const nameParts = (user.name ?? "").split(" ");
          dbUser = createUser({
            firstName: gProfile?.given_name ?? nameParts[0] ?? "",
            lastName:
              gProfile?.family_name ?? nameParts.slice(1).join(" ") ?? "",
            email,
            googleId,
            emailVerified: true,
          });
          sendSlackNotification(`New signup: ${fullName(dbUser.firstName, dbUser.lastName)} <${email}>`).catch(
            (err) => {
              console.error("Slack notification failed:", err);
            },
          );
        } else if (!dbUser.googleId) {
          linkGoogleAccount(dbUser.id, googleId);
        }
        user.id = dbUser.id;
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user?.id) token.id = user.id;
      return token;
    },
    async session({ session, token }) {
      if (token.id) session.user.id = token.id as string;
      return session;
    },
  },
  pages: {
    signIn: "/signin",
    newUser: "/signup",
    error: "/signin",
  },
});
