import { NextRequest, NextResponse } from "next/server";
import { getUserByEmail, setVerificationToken } from "@/lib/users";
import { generateVerificationToken } from "@/lib/tokens";
import { sendVerificationEmail } from "@/lib/email";
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
    if (user && !user.emailVerified && user.passwordHash) {
      const { token, expiresAt } = generateVerificationToken();
      setVerificationToken(user.id, token, expiresAt);
      sendVerificationEmail(user.email, user.firstName, token).catch((err) => {
        console.error("Resend verification email failed:", err);
      });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Resend verification error:", err);
    return NextResponse.json({ success: true });
  }
}
