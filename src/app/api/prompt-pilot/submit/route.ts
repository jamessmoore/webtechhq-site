import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getUserById } from "@/lib/users";
import {
  createPromptPilotSubmission,
  getPromptPilotSubmissionByUser,
} from "@/lib/tools/promptPilotSubmissions";
import { renderPromptPilotTemplate } from "@/lib/tools/promptPilotTemplates";
import type {
  PromptPilotStartingPoint,
  PromptPilotWhy,
  PromptPilotTimeBudget,
} from "@/lib/types";

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const user = getUserById(session.user.id);
  if (!user) {
    return NextResponse.json({ error: "User not found." }, { status: 401 });
  }
  if (!user.emailVerified) {
    return NextResponse.json(
      { error: "Please verify your email before submitting." },
      { status: 403 },
    );
  }

  // One submission per user, same pattern as the Opportunity Finder.
  const existing = getPromptPilotSubmissionByUser(user.id);
  if (existing) {
    return NextResponse.json(
      { error: "You already have a Prompt Pilot result on file." },
      { status: 409 },
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

  try {
    const learningGoal = body.learningGoal.trim();
    const renderedPrompt = renderPromptPilotTemplate({
      learningGoal,
      startingPoint: body.startingPoint,
      why: body.why,
      timeBudget: body.timeBudget,
    });

    const submission = createPromptPilotSubmission({
      userId: user.id,
      learningGoal,
      startingPoint: body.startingPoint,
      why: body.why,
      timeBudget: body.timeBudget,
      renderedPrompt: renderedPrompt ?? undefined,
    });

    return NextResponse.json({
      success: true,
      id: submission.id,
      renderedPrompt,
      why: body.why ?? null,
    });
  } catch (err: unknown) {
    if (err instanceof Error && err.message.includes("UNIQUE constraint failed")) {
      return NextResponse.json(
        { error: "You already have a Prompt Pilot result on file." },
        { status: 409 },
      );
    }
    throw err;
  }
}
