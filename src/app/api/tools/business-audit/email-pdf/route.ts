import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getUserById } from "@/lib/users";
import { getLatestAuditReportForUser } from "@/lib/auditReports";
import { renderAuditReportPdf } from "@/lib/tools/auditReportPdf";
import { sendAuditReportEmail } from "@/lib/email";

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const user = getUserById(session.user.id);
  if (!user) {
    return NextResponse.json({ error: "User not found." }, { status: 401 });
  }

  const record = getLatestAuditReportForUser(user.id, "business_audit");
  if (!record || record.status !== "ready" || !record.report) {
    return NextResponse.json({ error: "Your audit report isn't ready yet." }, { status: 400 });
  }

  const pdfBuffer = await renderAuditReportPdf(record.report);
  await sendAuditReportEmail(user.email, user.firstName, record.report.businessName, pdfBuffer);

  return NextResponse.json({ success: true });
}
