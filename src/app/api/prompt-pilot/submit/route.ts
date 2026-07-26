import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getUserById } from "@/lib/users";
import {
  createPromptPilotSubmission,
  upsertPromptPilotSubmission,
} from "@/lib/tools/promptPilotSubmissions";
import { renderPromptPilotTemplate } from "@/lib/tools/promptPilotTemplates";
import { PROMPT_PILOT_CLAIM_COOKIE, setClaimCookie } from "@/lib/tools/claimCookies";
import type {
  PromptPilotStartingPoint,
  PromptPilotWhy,
  PromptPilotTimeBudget,
} from "@/lib/types";

export async function POST(request: NextRequest) {
  // Prompt Pilot no longer requires an account up front - an unauthenticated
  // visitor gets a submission created anonymously (userId left null), and is
  // offered a way to save/claim it once the result renders. A session, when
  // present, behaves exactly as before.
  // A session whose JWT points at a user id that no longer exists (e.g. a
  // stale session after a DB reset) is treated the same as no session at
  // all - fall through to the anonymous flow, matching page.tsx.
  const session = await auth();
  const user = session?.user?.id ? getUserById(session.user.id) : null;

  if (user && !user.emailVerified) {
    return NextResponse.json(
      { error: "Please verify your email before submitting." },
      { status: 403 },
    );
  }

  const body = (await request.json()) as {
    learningGoal?: string;
    startingPoint?: PromptPilotStartingPoint;
    why?: PromptPilotWhy;
    timeBudget?: PromptPilotTimeBudget;
    recaptchaToken?: string;
  };

  // Verify reCAPTCHA if configured
  const recaptchaSecret = process.env.RECAPTCHA_SECRET_KEY;
  if (recaptchaSecret) {
    const recaptchaRes = await fetch(
      "https://www.google.com/recaptcha/api/siteverify",
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `secret=${recaptchaSecret}&response=${body.recaptchaToken ?? ""}`,
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

  if (!body.learningGoal?.trim()) {
    return NextResponse.json(
      { error: "Please tell us what you want to learn about AI." },
      { status: 400 },
    );
  }

  const learningGoal = body.learningGoal.trim();
  const renderedPrompt = renderPromptPilotTemplate({
    learningGoal,
    startingPoint: body.startingPoint,
    why: body.why,
    timeBudget: body.timeBudget,
  });

  // renderPromptPilotTemplate() only returns null when the
  // prompt_pilot_template table has no matching/fallback row - a
  // production data-seeding gap, not something to silently paper over as
  // a fake "success". Surface it as a real error instead of persisting a
  // submission with no rendered prompt (which the client would otherwise
  // have no sane way to distinguish from an already-on-file result).
  if (renderedPrompt === null) {
    return NextResponse.json(
      { error: "Something went wrong generating your prompt. Please try again shortly." },
      { status: 500 },
    );
  }

  const claimToken = user ? undefined : randomUUID();

  // One submission per signed-in user, but resubmitting overwrites the
  // existing row (upsert) rather than being blocked - anonymous visitors
  // always get their own new row, since each gets its own claim token and
  // the unique index excludes NULL user_id.
  const submission = user
    ? upsertPromptPilotSubmission({
        userId: user.id,
        learningGoal,
        startingPoint: body.startingPoint,
        why: body.why,
        timeBudget: body.timeBudget,
        renderedPrompt,
      })
    : createPromptPilotSubmission({
        learningGoal,
        startingPoint: body.startingPoint,
        why: body.why,
        timeBudget: body.timeBudget,
        renderedPrompt,
        claimToken,
      });

  const response = NextResponse.json({
    success: true,
    id: submission.id,
    renderedPrompt,
    why: body.why ?? null,
  });

  if (claimToken) {
    setClaimCookie(response, PROMPT_PILOT_CLAIM_COOKIE, claimToken);
  }

  return response;
}
