import type { Metadata } from "next";
import { redirect } from "next/navigation";
import BusinessAuditFlow from "@/components/tools/BusinessAuditFlow";
import { auth } from "@/auth";
import { getUserById, isAccountCompleted } from "@/lib/users";
import { getSubmissionsByUser } from "@/lib/submissions";
import { hasPurchased } from "@/lib/purchases";
import { getProduct } from "@/lib/products";
import { getLatestAuditReportForUser } from "@/lib/auditReports";
import { isGoldStandardTestAccount } from "@/lib/testAccount";
import { getMoveForwardRequestByUser } from "@/lib/moveForwardRequests";

export const metadata: Metadata = { title: "Business Audit | Moore Solutions" };

export default async function BusinessAuditPage() {
  const session = await auth();
  const user = session?.user?.id ? getUserById(session.user.id) : null;
  // No hard redirect for a missing/invalid session: an anonymous visitor
  // (or a stale session pointing at a deleted user) should still reach
  // BusinessAuditFlow so its own "Finish the Opportunity Finder first" gate
  // screen renders. hasSubmission is false below for that case, which stops
  // the flow at that gate before anything user-specific is ever read.

  const product = getProduct("business_audit");
  if (!product) redirect("/tools");

  const hasSubmission = user ? getSubmissionsByUser(user.id).length > 0 : false;
  const alreadyPurchased = user ? hasPurchased(user.id, product.id) : false;
  const reportRecord = user && alreadyPurchased ? getLatestAuditReportForUser(user.id, product.id) : null;
  const isTestAccount = user ? isGoldStandardTestAccount(user.email) : false;
  const moveForwardStatus = user && alreadyPurchased ? getMoveForwardRequestByUser(user.id)?.status ?? null : null;

  return (
    <div style={{ maxWidth: 760, margin: "0 auto", padding: "clamp(24px,4vw,34px) clamp(18px,4vw,44px) 80px" }}>
      <BusinessAuditFlow
        product={product}
        hasSubmission={hasSubmission}
        accountCompleted={user ? isAccountCompleted(user) : false}
        alreadyPurchased={alreadyPurchased}
        initialReportStatus={reportRecord?.status ?? null}
        initialReport={reportRecord?.report ?? null}
        isTestAccount={isTestAccount}
        initialMoveForwardStatus={moveForwardStatus}
      />
    </div>
  );
}
