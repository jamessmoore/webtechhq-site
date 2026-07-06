import type { Metadata } from "next";
import { redirect } from "next/navigation";
import OpportunityFinderFlow from "@/components/tools/OpportunityFinderFlow";
import { auth } from "@/auth";
import { getUserById, isAccountCompleted } from "@/lib/users";
import { getSubmissionsByUser } from "@/lib/submissions";

export const metadata: Metadata = { title: "Opportunity Finder | Moore Solutions" };

export default async function ToolsQuestionnairePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/signup");

  const user = getUserById(session.user.id);
  if (!user) redirect("/signup");

  const submissions = getSubmissionsByUser(user.id);
  const alreadySubmitted = submissions.length > 0;
  const initialPrompt = submissions[0]?.renderedPrompt ?? null;

  return (
    <div style={{ maxWidth: 760, margin: "0 auto", padding: "clamp(24px,4vw,34px) clamp(18px,4vw,44px) 80px" }}>
      <OpportunityFinderFlow
        firstName={user.firstName}
        email={user.email}
        emailVerified={user.emailVerified}
        alreadySubmitted={alreadySubmitted}
        initialPrompt={initialPrompt}
        accountCompleted={isAccountCompleted(user)}
      />
    </div>
  );
}
