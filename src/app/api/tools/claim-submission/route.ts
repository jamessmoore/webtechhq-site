import { NextRequest, NextResponse } from "next/server";
import { getUserByEmail, createUser, isAccountCompleted, setVerificationToken } from "@/lib/users";
import {
  getSignupAttemptCount,
  recordSignupAttempt,
  MAX_SIGNUP_ATTEMPTS,
} from "@/lib/signupAttempts";
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
import {
  PROMPT_PILOT_CLAIM_COOKIE,
  OPPORTUNITY_FINDER_CLAIM_COOKIE,
  clearClaimCookie,
  readClaimCookie,
} from "@/lib/tools/claimCookies";
import { claimSubmission, getSubmissionByClaimToken } from "@/lib/submissions";
import {
  claimPromptPilotSubmission,
  getPromptPilotSubmissionByClaimToken,
} from "@/lib/tools/promptPilotSubmissions";

// Mirrors the message/behavior of /api/auth/signup's IP block - same shared
// rate-limit tables, since "save my anonymous result" and "sign up" both
// ultimately create-or-touch an account and should count against the same
// per-IP/per-email budget rather than each getting their own separate one.
const IP_RATE_LIMIT_MESSAGE = "Further retries are not allowed. Please contact us for assistance.";

const MAX_NAME_LENGTH = 100;

type ClaimTool = "prompt-pilot" | "opportunity-finder";

const TOOL_CONFIG: Record<ClaimTool, { cookie: string; redirectTo: string }> = {
  "prompt-pilot": { cookie: PROMPT_PILOT_CLAIM_COOKIE, redirectTo: "/tools/prompt-pilot" },
  "opportunity-finder": { cookie: OPPORTUNITY_FINDER_CLAIM_COOKIE, redirectTo: "/tools/opportunity-finder" },
};

function isClaimTool(value: unknown): value is ClaimTool {
  return value === "prompt-pilot" || value === "opportunity-finder";
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, recaptchaToken, tool } = body as {
      name: string;
      email: string;
      recaptchaToken: string;
      tool: string;
    };

    if (!isClaimTool(tool)) {
      return NextResponse.json({ error: "Unknown tool." }, { status: 400 });
    }
    const config = TOOL_CONFIG[tool];

    // The claim token always comes from this browser's own httpOnly cookie,
    // set when the anonymous submission was created - never from the
    // request body, so a client can't forge a claim for someone else's
    // result by guessing/supplying a token directly.
    const claimToken = readClaimCookie(request, config.cookie);
    if (!claimToken) {
      return NextResponse.json(
        {
          error:
            "We couldn't find a result to save from this browser. Please try the tool again.",
        },
        { status: 400 },
      );
    }

    // Confirm the token still points at a real, unclaimed submission before
    // doing anything else (rate limiting, account creation) - a stale or
    // replayed claim shouldn't cost a real user their rate-limit budget or
    // leave behind an orphaned unverified account.
    const pendingSubmission =
      tool === "prompt-pilot"
        ? getPromptPilotSubmissionByClaimToken(claimToken)
        : getSubmissionByClaimToken(claimToken);
    if (!pendingSubmission) {
      return NextResponse.json(
        { error: "That result is no longer available to save. Please try the tool again." },
        { status: 400 },
      );
    }

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

    if (!(await verifyRecaptcha(recaptchaToken))) {
      return NextResponse.json(
        { error: "reCAPTCHA verification failed. Please try again." },
        { status: 400 },
      );
    }

    // Same per-IP cap (and same table) as /api/auth/signup, checked before
    // anything below reveals whether this email already has an account.
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

    // A completed (or already-verified) account can't be silently attached
    // to someone else's anonymous result - same enumeration-safe framing as
    // /api/auth/signup: this response shape doesn't reveal anything a
    // regular sign-in attempt wouldn't already.
    if (existing && (existing.emailVerified || isAccountCompleted(existing))) {
      return NextResponse.json(
        { error: "An account with this email already exists. Try signing in instead." },
        { status: 409 },
      );
    }

    if (existing && getSignupAttemptCount(normalizedEmail) >= MAX_SIGNUP_ATTEMPTS) {
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

    let userId: string;
    let firstName: string;
    if (existing) {
      setVerificationToken(existing.id, token, expiresAt);
      userId = existing.id;
      firstName = existing.firstName;
    } else {
      const user = createUser({
        firstName: name.trim(),
        email: normalizedEmail,
        emailVerified: false,
        verificationToken: token,
        verificationExpiresAt: expiresAt,
      });
      userId = user.id;
      firstName = user.firstName;
    }

    try {
      const claimed =
        tool === "prompt-pilot"
          ? claimPromptPilotSubmission(claimToken, userId)
          : claimSubmission(claimToken, userId);
      if (!claimed) {
        // Claimed by a concurrent request between the pre-check above and
        // now - vanishingly unlikely, but fail closed rather than send a
        // verification email for a result that's no longer there to save.
        return NextResponse.json(
          { error: "That result is no longer available to save. Please try the tool again." },
          { status: 400 },
        );
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.message.includes("UNIQUE constraint failed")) {
        return NextResponse.json(
          { error: "This account already has a result on file for this tool." },
          { status: 409 },
        );
      }
      throw err;
    }

    const sendPromise = sendVerificationEmail(normalizedEmail, firstName, token, config.redirectTo);
    sendPromise.catch((err) => {
      console.error("Verification email failed:", err);
    });

    const response = NextResponse.json({ success: true });
    clearClaimCookie(response, config.cookie);
    return response;
  } catch (err) {
    console.error("Claim submission error:", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}
