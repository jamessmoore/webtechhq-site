import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getUserById } from "@/lib/users";
import { createSubmission, getSubmissionsByUser } from "@/lib/submissions";
import { renderPromptTemplate } from "@/lib/tools/promptTemplates";
import { sendPromptEmail } from "@/lib/email";
import type {
  TeamSize,
  RepetitiveAnswer,
  ComplianceAnswer,
  DataAnswer,
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

  // One submission per user
  const existing = getSubmissionsByUser(user.id);
  if (existing.length > 0) {
    return NextResponse.json(
      { error: "You already have a submission on file." },
      { status: 409 },
    );
  }

  const body = (await request.json()) as {
    businessType?: string;
    teamSize?: TeamSize;
    layer1Problem?: string;
    layer1Elimination?: string;
    layer2Hours?: number;
    layer2Salary?: string;
    layer3Repetitive?: RepetitiveAnswer;
    layer3Compliance?: ComplianceAnswer;
    layer3ComplianceDetail?: string;
    layer3Data?: DataAnswer;
    additionalNotes?: string;
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

  // Require the core fields
  if (!body.businessType?.trim()) {
    return NextResponse.json(
      { error: "Business type is required." },
      { status: 400 },
    );
  }
  if (!body.layer1Problem?.trim()) {
    return NextResponse.json(
      { error: "Please describe your biggest problem." },
      { status: 400 },
    );
  }

  try {
    const renderedPrompt = renderPromptTemplate({
      repetitive: body.layer3Repetitive,
      compliance: body.layer3Compliance,
      data: body.layer3Data,
      vars: {
        businessType: body.businessType?.trim(),
        teamSize: body.teamSize,
        layer1Problem: body.layer1Problem?.trim(),
        layer1Elimination: body.layer1Elimination?.trim(),
        layer2Hours: body.layer2Hours,
        layer2Salary: body.layer2Salary,
        complianceDetail: body.layer3ComplianceDetail?.trim(),
        additionalNotes: body.additionalNotes?.trim(),
      },
    });

    const submission = createSubmission({
      userId: user.id,
      businessType: body.businessType?.trim(),
      teamSize: body.teamSize,
      layer1Problem: body.layer1Problem?.trim(),
      layer1Elimination: body.layer1Elimination?.trim(),
      layer2Hours: body.layer2Hours,
      layer2Salary: body.layer2Salary,
      layer3Repetitive: body.layer3Repetitive,
      layer3Compliance: body.layer3Compliance,
      layer3ComplianceDetail: body.layer3ComplianceDetail?.trim(),
      layer3Data: body.layer3Data,
      additionalNotes: body.additionalNotes?.trim(),
      renderedPrompt: renderedPrompt ?? undefined,
    });

    if (renderedPrompt) {
      // Non-blocking — don't fail the submission if email delivery fails.
      sendPromptEmail(user.email, user.firstName).catch((err) => {
        console.error("Prompt email failed:", err);
      });
    }

    return NextResponse.json({ success: true, id: submission.id, renderedPrompt });
  } catch (err: unknown) {
    if (err instanceof Error && err.message.includes("UNIQUE constraint failed")) {
      return NextResponse.json(
        { error: "You already have a submission on file." },
        { status: 409 },
      );
    }
    throw err;
  }
}
