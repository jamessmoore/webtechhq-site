import { NextRequest, NextResponse } from "next/server";
import { getUserByVerificationToken, verifyUserEmail } from "@/lib/users";
import { isTokenExpired } from "@/lib/tokens";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;

  const user = getUserByVerificationToken(token);

  if (!user) {
    return NextResponse.redirect(
      new URL("/verify?error=invalid", _request.url),
    );
  }

  if (!user.verificationExpiresAt || isTokenExpired(user.verificationExpiresAt)) {
    return NextResponse.redirect(
      new URL("/verify?error=expired", _request.url),
    );
  }

  verifyUserEmail(user.id);

  return NextResponse.redirect(
    new URL("/verify?success=1", _request.url),
  );
}
