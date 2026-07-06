import { NextRequest, NextResponse } from "next/server";
import { getUserByVerificationToken, verifyUserEmail } from "@/lib/users";
import { isTokenExpired } from "@/lib/tokens";

// Built from NEXTAUTH_URL rather than the incoming request URL: behind the
// Nginx reverse proxy, request.url resolves to the internal localhost:3000
// address next start binds to, not the public domain.
const BASE_URL = process.env.NEXTAUTH_URL ?? "http://localhost:3000";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;

  const user = getUserByVerificationToken(token);

  if (!user) {
    return NextResponse.redirect(new URL("/verify?error=invalid", BASE_URL));
  }

  if (!user.verificationExpiresAt || isTokenExpired(user.verificationExpiresAt)) {
    return NextResponse.redirect(new URL("/verify?error=expired", BASE_URL));
  }

  verifyUserEmail(user.id);

  return NextResponse.redirect(new URL("/verify?success=1", BASE_URL));
}
