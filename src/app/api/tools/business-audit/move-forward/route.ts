import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getUserById } from "@/lib/users";
import { hasPurchased } from "@/lib/purchases";
import { getLatestAuditReportForUser } from "@/lib/auditReports";
import { getMoveForwardRequestByUser, createMoveForwardRequest } from "@/lib/moveForwardRequests";
import { sendSlackNotification } from "@/lib/slack";

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const user = getUserById(session.user.id);
  if (!user) {
    return NextResponse.json({ error: "User not found." }, { status: 401 });
  }

  if (!hasPurchased(user.id, "business_audit")) {
    return NextResponse.json({ error: "Purchase a Business Audit first." }, { status: 403 });
  }

  const report = getLatestAuditReportForUser(user.id, "business_audit");
  if (!report || report.status !== "ready") {
    return NextResponse.json({ error: "Your audit isn't ready yet." }, { status: 409 });
  }

  // Idempotent: a repeat click just returns the existing request rather than
  // erroring or duplicating it, and only pings Slack the first time.
  const alreadyExisted = Boolean(getMoveForwardRequestByUser(user.id));
  const moveForwardRequest = createMoveForwardRequest(user.id);

  if (!alreadyExisted) {
    sendSlackNotification(
      `Move forward request: ${user.firstName} <${user.email}> wants to move forward from their Business Audit.`,
    ).catch((err) => {
      console.error("Slack notification failed:", err);
    });
  }

  return NextResponse.json({ status: moveForwardRequest.status });
}
