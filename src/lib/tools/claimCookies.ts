import type { NextRequest, NextResponse } from "next/server";

// Cookie names for the two anonymous-submit-then-claim flows. Scoped per
// tool (rather than one shared cookie) so a visitor who tries both tools
// anonymously in the same browser session before saving either result still
// has two independent, unambiguous pending claims.
export const PROMPT_PILOT_CLAIM_COOKIE = "pp_claim_token";
export const OPPORTUNITY_FINDER_CLAIM_COOKIE = "of_claim_token";

// How long an anonymous result stays claimable from the browser that
// generated it. Short-lived by design (this is a "save it before you forget"
// nudge, not a long-term draft), but comfortably shorter than the 30-day
// anonymous-submission retention window in
// scripts/cleanup-anonymous-submissions.js, so a claim attempt near this
// cookie's own expiry still has a real row in the database to find.
const CLAIM_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days

function cookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    // Secure cookies are dropped over plain http, which local dev runs on -
    // only require it in production.
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge,
  };
}

/** Set on a successful anonymous submit; read back (never trusted from the client) by the claim endpoint. */
export function setClaimCookie(response: NextResponse, name: string, token: string): void {
  response.cookies.set(name, token, cookieOptions(CLAIM_COOKIE_MAX_AGE_SECONDS));
}

/** Cleared once a submission has been claimed, so the same browser can't replay the claim. */
export function clearClaimCookie(response: NextResponse, name: string): void {
  response.cookies.set(name, "", cookieOptions(0));
}

export function readClaimCookie(request: NextRequest, name: string): string | undefined {
  return request.cookies.get(name)?.value;
}
