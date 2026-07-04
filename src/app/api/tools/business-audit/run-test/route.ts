import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getUserById } from "@/lib/users";
import { getSubmissionsByUser } from "@/lib/submissions";
import { ensureComplimentaryPurchase } from "@/lib/purchases";
import { getProduct } from "@/lib/products";
import { createPendingAuditReport, markAuditReportReady, markAuditReportFailed } from "@/lib/auditReports";
import { generateAuditReport } from "@/lib/tools/auditReportGenerator";
import { isGoldStandardTestAccount } from "@/lib/testAccount";

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id || !isGoldStandardTestAccount(session.user.email)) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const user = getUserById(session.user.id);
  if (!user) {
    return NextResponse.json({ error: "User not found." }, { status: 401 });
  }

  const product = getProduct("business_audit");
  if (!product) {
    return NextResponse.json({ error: "Product not found." }, { status: 404 });
  }

  const submission = getSubmissionsByUser(user.id)[0];
  if (!submission) {
    return NextResponse.json({ error: "Finish the Opportunity Finder first." }, { status: 409 });
  }

  const body = (await request.json().catch(() => ({}))) as { businessName?: string };

  const purchase = ensureComplimentaryPurchase({
    userId: user.id,
    productId: product.id,
    currency: product.currency,
    businessName: body.businessName?.trim() || undefined,
  });

  const reportRecord = createPendingAuditReport({
    purchaseId: purchase.id,
    userId: user.id,
    productId: product.id,
  });

  generateAuditReport({
    submission,
    businessName: purchase.businessName ?? user.firstName,
    ownerFirstName: user.firstName,
  })
    .then((report) => markAuditReportReady(reportRecord.id, report))
    .catch((err) => {
      markAuditReportFailed(reportRecord.id, String(err));
    });

  return NextResponse.json({ success: true });
}
