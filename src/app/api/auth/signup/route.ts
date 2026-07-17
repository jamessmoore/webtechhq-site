import { NextRequest, NextResponse } from "next/server";
import { getUserByEmail, createUser, deleteUser, isAccountCompleted } from "@/lib/users";
import { getSignupAttemptCount, recordSignupAttempt, MAX_SIGNUP_ATTEMPTS } from "@/lib/signupAttempts";
import { generateVerificationToken } from "@/lib/tokens";
import { sendVerificationEmail } from "@/lib/email";
import { verifyRecaptcha } from "@/lib/recaptcha";

// Standard local@domain.tld format check (the same character classes used by
// the HTML5 <input type="email"> spec). Not RFC 5322-exhaustive, but the
// domain half is restricted to DNS-label characters (letters, digits,
// hyphens, dots) only - no "@", "?", "=", "&", whitespace, or control
// characters - which rules out header/query-style mailto injection strings
// before they're stored and later rendered as a raw `mailto:` href elsewhere
// in the app.
const EMAIL_FORMAT_REGEX =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, recaptchaToken } = body as {
      name: string;
      email: string;
      recaptchaToken: string;
    };

    // Basic field validation - the Opportunity Finder request only needs a
    // name (whatever they give us, first/full/whatever) and a valid email.
    if (!name?.trim() || !email?.trim()) {
      return NextResponse.json(
        { error: "Name and email are required." },
        { status: 400 },
      );
    }

    if (!EMAIL_FORMAT_REGEX.test(email.trim())) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400 },
      );
    }

    // Verify reCAPTCHA
    if (!(await verifyRecaptcha(recaptchaToken))) {
      return NextResponse.json(
        { error: "reCAPTCHA verification failed. Please try again." },
        { status: 400 },
      );
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existing = getUserByEmail(normalizedEmail);

    if (existing && isAccountCompleted(existing)) {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 409 },
      );
    }

    if (existing) {
      // Incomplete account (never finished signup with a password). Reusing
      // the email resets it, unless they've already burned through the
      // request cap for this address.
      if (getSignupAttemptCount(normalizedEmail) >= MAX_SIGNUP_ATTEMPTS) {
        return NextResponse.json(
          {
            error:
              "You've reached the maximum number of requests for this email. Please contact us if you need help completing your account.",
          },
          { status: 429 },
        );
      }
      deleteUser(existing.id);
    }

    recordSignupAttempt(normalizedEmail);

    const { token, expiresAt } = generateVerificationToken();

    const user = createUser({
      firstName: name.trim(),
      email: normalizedEmail,
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
