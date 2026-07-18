import { NextRequest, NextResponse } from "next/server";
import { getUserByEmail, createUser, isAccountCompleted, setVerificationToken } from "@/lib/users";
import { getSignupAttemptCount, recordSignupAttempt, MAX_SIGNUP_ATTEMPTS } from "@/lib/signupAttempts";
import {
  getSignupIpAttemptCount,
  recordSignupIpAttempt,
  MAX_SIGNUP_IP_ATTEMPTS,
} from "@/lib/signupIpAttempts";
import { getClientIp } from "@/lib/requestIp";
import { generateVerificationToken } from "@/lib/tokens";
import { sendVerificationEmail } from "@/lib/email";
import { verifyRecaptcha } from "@/lib/recaptcha";
import { isValidEmailFormat } from "@/lib/emailFormat";

// Shown once a source IP has exhausted its signup-endpoint attempts (see
// signupIpAttempts.ts) - distinct from and takes priority over the
// per-email "already exists" response below, since the whole point is to
// stop that response from being used to enumerate registered emails.
const IP_RATE_LIMIT_MESSAGE = "Further retries are not allowed. Please contact us for assistance.";

// Defense in depth against a long user-supplied name: doesn't by itself
// bound regex match time in the admin users search (see
// `safeRegexTest` in `src/lib/adminUsersView.ts` for the actual fix), but
// there's no legitimate reason a name needs to be longer than this, and it
// shrinks the space of possible catastrophic-backtracking haystacks.
const MAX_NAME_LENGTH = 100;

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

    if (name.trim().length > MAX_NAME_LENGTH) {
      return NextResponse.json(
        { error: `Name must be ${MAX_NAME_LENGTH} characters or fewer.` },
        { status: 400 },
      );
    }

    if (!isValidEmailFormat(email.trim())) {
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

    // Per-source-IP cap, checked before anything below reveals whether this
    // (or any) email already has an account - a per-email cap alone doesn't
    // stop enumeration, since each candidate email only needs one attempt.
    // Counts every attempt that reaches this point (new signup, resend, or
    // an "already exists" block), not just ones that send an email.
    const clientIp = getClientIp(request);
    if (getSignupIpAttemptCount(clientIp) >= MAX_SIGNUP_IP_ATTEMPTS) {
      return NextResponse.json(
        { error: IP_RATE_LIMIT_MESSAGE, ipBlocked: true },
        { status: 429 },
      );
    }
    recordSignupIpAttempt(clientIp);

    const normalizedEmail = email.toLowerCase().trim();
    const existing = getUserByEmail(normalizedEmail);

    // A completed account (password set or Google-linked) is always also
    // verified in real usage - completing signup requires having gone
    // through the verified-login flow first. Checking both here (rather
    // than emailVerified alone) also blocks the rarer edge case of an
    // account that verified its email but never came back to set a
    // password: either way, this address already has a real account and
    // signing up again shouldn't touch it or leak which case it was.
    if (existing && (existing.emailVerified || isAccountCompleted(existing))) {
      return NextResponse.json(
        { error: "An account with this email already exists. Try signing in instead." },
        { status: 409 },
      );
    }

    if (existing) {
      // Exists, but never verified and never completed (the lightweight
      // Opportunity Finder request form only collects name + email up
      // front). Don't create a duplicate account - resend the verification
      // email to this same record instead, subject to the same per-email
      // request cap as new signups so this can't be used to spam an
      // address with verification emails.
      if (getSignupAttemptCount(normalizedEmail) >= MAX_SIGNUP_ATTEMPTS) {
        return NextResponse.json(
          {
            error:
              "You've reached the maximum number of requests for this email. Please contact us if you need help completing your account.",
          },
          { status: 429 },
        );
      }
      recordSignupAttempt(normalizedEmail);

      const { token, expiresAt } = generateVerificationToken();
      setVerificationToken(existing.id, token, expiresAt);

      sendVerificationEmail(existing.email, existing.firstName, token).catch((err) => {
        console.error("Verification email resend failed:", err);
      });

      // Deliberately identical response shape to the brand-new-signup path
      // below: an unauthenticated caller must not be able to tell "we just
      // created your account" apart from "we found your existing,
      // unverified signup and resent the link" - that distinction, layered
      // on top of the already-accepted 409 reveal for verified/completed
      // accounts, would let anyone fully enumerate an email's account
      // status just by submitting the signup form.
      return NextResponse.json({ success: true });
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
