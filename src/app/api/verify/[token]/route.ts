import { NextRequest, NextResponse } from "next/server";
import { AuthError } from "next-auth";
import { signIn } from "@/auth";
import { getUserByVerificationToken, verifyUserEmail, setLoginToken } from "@/lib/users";
import { isTokenExpired, generateLoginToken } from "@/lib/tokens";

// Built from NEXTAUTH_URL rather than the incoming request URL: behind the
// Nginx reverse proxy, request.url resolves to the internal localhost:3000
// address next start binds to, not the public domain.
const BASE_URL = process.env.NEXTAUTH_URL ?? "http://localhost:3000";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;
  const next = request.nextUrl.searchParams.get("next");
  const redirectTo = next && next.startsWith("/") ? next : "/tools/opportunity-finder";

  const user = getUserByVerificationToken(token);

  if (!user) {
    return NextResponse.redirect(new URL("/verify?error=invalid", BASE_URL));
  }

  if (!user.verificationExpiresAt || isTokenExpired(user.verificationExpiresAt)) {
    return NextResponse.redirect(new URL("/verify?error=expired", BASE_URL));
  }

  verifyUserEmail(user.id);

  // Auto-login straight into the Opportunity Finder questionnaire (or
  // wherever the verification link points, e.g. finish-signup) - this
  // account has no password yet, so a normal credentials sign-in isn't
  // possible until they finish creating it.
  const { token: loginToken, expiresAt: loginExpiresAt } = generateLoginToken();
  setLoginToken(user.id, loginToken, loginExpiresAt);

  try {
    await signIn("verified-login", {
      token: loginToken,
      redirectTo,
    });
  } catch (err) {
    // signIn() throws a NEXT_REDIRECT internally on success - rethrow so
    // Next.js can turn it into the actual redirect response.
    if (err instanceof Error && err.message === "NEXT_REDIRECT") throw err;
    if (err instanceof AuthError) {
      return NextResponse.redirect(new URL("/verify?error=invalid", BASE_URL));
    }
    throw err;
  }

  return NextResponse.redirect(new URL("/verify?success=1", BASE_URL));
}
