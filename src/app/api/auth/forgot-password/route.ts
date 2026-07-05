import { NextRequest, NextResponse } from "next/server";
import { getUserByEmail, setPasswordResetToken } from "@/lib/users";
import { generateResetToken } from "@/lib/tokens";
import { sendPasswordResetEmail, sendGoogleAccountNoticeEmail } from "@/lib/email";
import { verifyRecaptcha } from "@/lib/recaptcha";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, recaptchaToken } = body as {
      email: string;
      recaptchaToken: string;
    };

    if (!email?.trim()) {
      return NextResponse.json({ error: "Email is required." }, { status: 400 });
    }

    if (!(await verifyRecaptcha(recaptchaToken))) {
      return NextResponse.json(
        { error: "reCAPTCHA verification failed. Please try again." },
        { status: 400 },
      );
    }

    const user = getUserByEmail(email.toLowerCase().trim());
    if (user) {
      if (user.passwordHash) {
        const { token, expiresAt } = generateResetToken();
        setPasswordResetToken(user.id, token, expiresAt);
        sendPasswordResetEmail(user.email, user.firstName, token).catch((err) => {
          console.error("Password reset email failed:", err);
        });
      } else {
        sendGoogleAccountNoticeEmail(user.email, user.firstName).catch((err) => {
          console.error("Google account notice email failed:", err);
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Forgot password error:", err);
    return NextResponse.json({ success: true });
  }
}
