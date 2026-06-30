import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getUserByEmail, createUser } from "@/lib/users";
import { generateVerificationToken } from "@/lib/tokens";
import { sendVerificationEmail } from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { firstName, lastName, email, password, recaptchaToken } =
      body as {
        firstName: string;
        lastName: string;
        email: string;
        password: string;
        recaptchaToken: string;
      };

    // Basic field validation
    if (!firstName?.trim() || !lastName?.trim() || !email?.trim() || !password) {
      return NextResponse.json(
        { error: "All fields are required." },
        { status: 400 },
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters." },
        { status: 400 },
      );
    }

    // Verify reCAPTCHA
    const recaptchaSecret = process.env.RECAPTCHA_SECRET_KEY;
    if (recaptchaSecret) {
      const recaptchaRes = await fetch(
        "https://www.google.com/recaptcha/api/siteverify",
        {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: `secret=${recaptchaSecret}&response=${recaptchaToken}`,
        },
      );
      const recaptchaData = (await recaptchaRes.json()) as { success: boolean };
      if (!recaptchaData.success) {
        return NextResponse.json(
          { error: "reCAPTCHA verification failed. Please try again." },
          { status: 400 },
        );
      }
    }

    // Check for existing account
    const existing = getUserByEmail(email.toLowerCase().trim());
    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 409 },
      );
    }

    // Hash password + generate verification token
    const passwordHash = await bcrypt.hash(password, 12);
    const { token, expiresAt } = generateVerificationToken();

    // Create user
    const user = createUser({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.toLowerCase().trim(),
      passwordHash,
      emailVerified: false,
      verificationToken: token,
      verificationExpiresAt: expiresAt,
    });

    // Send verification email (non-blocking — don't fail signup if email fails)
    sendVerificationEmail(user.email, user.firstName, token).catch((err) => {
      console.error("Verification email failed:", err);
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Signup error:", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}
