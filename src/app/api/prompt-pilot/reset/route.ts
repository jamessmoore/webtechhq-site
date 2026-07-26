import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import {
  deletePromptPilotSubmissionByClaimToken,
  deletePromptPilotSubmissionByUser,
} from "@/lib/tools/promptPilotSubmissions";
import { PROMPT_PILOT_CLAIM_COOKIE, clearClaimCookie, readClaimCookie } from "@/lib/tools/claimCookies";

// Backs the Reset button on the Prompt Pilot result screen
// (PromptPilotDisplay). Deletes the caller's own Prompt Pilot submission
// server-side so a reload afterward doesn't bring the prior result back via
// initialPrompt/alreadySubmitted - the client-side form/prompt state reset
// alone (PromptPilotFlow.handleReset) isn't enough for that. Scoped to this
// one tool's table only; doesn't touch the gold-standard test account's
// cross-tool reset (resetAllToolDataForUser / /api/tools/test-reset).
export async function POST(request: NextRequest) {
  const session = await auth();

  if (session?.user?.id) {
    deletePromptPilotSubmissionByUser(session.user.id);
    return NextResponse.json({ success: true });
  }

  // Anonymous visitor - identify their (unclaimed) submission the same way
  // /api/tools/claim-submission does, via the httpOnly claim cookie, never
  // an id supplied by the client. No cookie just means there's nothing on
  // file server-side yet, which is still a success (the client-side state
  // is what mattered in that case).
  const claimToken = readClaimCookie(request, PROMPT_PILOT_CLAIM_COOKIE);
  if (claimToken) {
    deletePromptPilotSubmissionByClaimToken(claimToken);
  }

  const response = NextResponse.json({ success: true });
  if (claimToken) {
    clearClaimCookie(response, PROMPT_PILOT_CLAIM_COOKIE);
  }
  return response;
}
