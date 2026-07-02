import { NextRequest, NextResponse } from "next/server";
import { getUserByEmail, setPasswordResetToken } from "@/lib/users";
import { generateResetToken } from "@/lib/tokens";
import { sendPasswordResetEmail, sendGoogleAccountNoticeEmail } from "@/lib/email";
import { verifyRecaptcha } from "@/lib/recaptcha";

// Always returns a generic success response so this endpoint can't be used
// to enumerate which email addresses have an account.
const GENERIC_RESPONSE = NextResponse.json({ success: true });

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

    return GENERIC_RESPONSE;
  } catch (err) {
    console.error("Forgot password error:", err);
    return GENERIC_RESPONSE;
  }
}
