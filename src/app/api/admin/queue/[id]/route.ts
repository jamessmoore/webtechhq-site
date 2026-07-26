import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import {
  getMoveForwardRequestById,
  updateMoveForwardRequestStatus,
} from "@/lib/moveForwardRequests";
import type { MoveForwardStatus } from "@/lib/types";

const VALID_STATUSES: MoveForwardStatus[] = ["waiting", "contacted", "converted"];

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
  const existing = getMoveForwardRequestById(id);
  if (!existing) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  const body = (await request.json()) as { status?: string };
  if (!body.status || !VALID_STATUSES.includes(body.status as MoveForwardStatus)) {
    return NextResponse.json({ error: "Invalid status." }, { status: 400 });
  }

  updateMoveForwardRequestStatus(id, body.status as MoveForwardStatus);

  return NextResponse.json({ success: true });
}
