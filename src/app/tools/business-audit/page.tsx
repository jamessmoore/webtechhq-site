import type { Metadata } from "next";
import { redirect } from "next/navigation";
import BusinessAuditFlow from "@/components/tools/BusinessAuditFlow";
import { auth } from "@/auth";
import { getUserById } from "@/lib/users";
import { getSubmissionsByUser } from "@/lib/submissions";
import { hasPurchased } from "@/lib/purchases";
import { getProduct } from "@/lib/products";

export const metadata: Metadata = { title: "Business Audit | Moore Solutions" };

export default async function BusinessAuditPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/signup");

  const user = getUserById(session.user.id);
  if (!user) redirect("/signup");

  const product = getProduct("business_audit");
  if (!product) redirect("/tools");

  const hasSubmission = getSubmissionsByUser(user.id).length > 0;
  const alreadyPurchased = hasPurchased(user.id, product.id);

  return (
    <div style={{ maxWidth: 760, margin: "0 auto", padding: "clamp(24px,4vw,34px) clamp(18px,4vw,44px) 80px" }}>
      <BusinessAuditFlow product={product} hasSubmission={hasSubmission} alreadyPurchased={alreadyPurchased} />
    </div>
  );
}
