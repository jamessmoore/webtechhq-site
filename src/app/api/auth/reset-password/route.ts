import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getUserByResetToken, resetUserPassword } from "@/lib/users";
import { isTokenExpired } from "@/lib/tokens";
import { verifyRecaptcha } from "@/lib/recaptcha";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, password, recaptchaToken } = body as {
      token: string;
      password: string;
      recaptchaToken: string;
    };

    if (!token || !password) {
      return NextResponse.json(
        { error: "Token and new password are required." },
        { status: 400 },
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters." },
        { status: 400 },
      );
    }

    if (!(await verifyRecaptcha(recaptchaToken))) {
      return NextResponse.json(
        { error: "reCAPTCHA verification failed. Please try again." },
        { status: 400 },
      );
    }

    const user = getUserByResetToken(token);
    if (!user) {
      return NextResponse.json(
        { error: "This reset link is invalid. Please request a new one." },
        { status: 400 },
      );
    }

    if (!user.resetExpiresAt || isTokenExpired(user.resetExpiresAt)) {
      return NextResponse.json(
        { error: "This reset link has expired. Please request a new one." },
        { status: 400 },
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);
    resetUserPassword(user.id, passwordHash);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Reset password error:", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}
