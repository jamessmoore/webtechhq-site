import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import {
  getSubmissionById,
  updateSubmissionStatus,
  updateSubmissionNotes,
} from "@/lib/submissions";
import type { ApprovalStatus } from "@/lib/types";

function isAdmin(email: string | null | undefined): boolean {
  return !!email && email === process.env.ADMIN_EMAIL;
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!isAdmin(session?.user?.email)) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const { id } = await params;
  const submission = getSubmissionById(id);
  if (!submission) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  const body = (await request.json()) as {
    status?: ApprovalStatus;
    notes?: string;
  };

  if (body.status !== undefined) {
    updateSubmissionStatus(id, body.status, session!.user.email!);
  }
  if (body.notes !== undefined) {
    updateSubmissionNotes(id, body.notes);
  }

  return NextResponse.json({ success: true });
}
