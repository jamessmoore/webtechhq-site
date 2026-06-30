import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import {
  getUserByEmail,
  createUser,
  linkGoogleAccount,
  getUserPasswordHash,
} from "@/lib/users";
import { verifyRecaptcha } from "@/lib/recaptcha";

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
          name: `${user.firstName} ${user.lastName}`,
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
