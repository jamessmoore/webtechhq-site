import type { Metadata } from "next";
import { redirect } from "next/navigation";
import AiOpportunityFinderFlow from "@/components/tools/AiOpportunityFinderFlow";
import { auth } from "@/auth";
import { getUserById } from "@/lib/users";
import { getSubmissionsByUser } from "@/lib/submissions";

export const metadata: Metadata = { title: "AI Opportunity Finder | Moore Solutions" };

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
      <AiOpportunityFinderFlow
        firstName={user.firstName}
        email={user.email}
        emailVerified={user.emailVerified}
        alreadySubmitted={alreadySubmitted}
        initialPrompt={initialPrompt}
      />
    </div>
  );
}
