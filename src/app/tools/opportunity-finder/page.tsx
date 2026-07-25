import type { Metadata } from "next";
import OpportunityFinderFlow from "@/components/tools/OpportunityFinderFlow";
import { auth } from "@/auth";
import { getUserById, isAccountCompleted } from "@/lib/users";
import { getSubmissionsByUser } from "@/lib/submissions";

// This is now the Opportunity Finder landing page as well as the tool
// itself - no separate marketing page exists anymore. Overrides the /tools
// layout's blanket `robots: { index: false, follow: false }` (see
// src/app/tools/layout.tsx) since this specific route is meant to be
// crawled and indexed, unlike the rest of /tools/*. Metadata fields are
// replaced (not merged) per-field against the parent layout, so setting
// `robots` here is enough on its own.
export const metadata: Metadata = {
  title: "Opportunity Finder | Moore Solutions",
  description:
    "Free tool: answer a few plain-English questions about how your business runs, and the Opportunity Finder builds you a custom AI prompt that surfaces your best opportunities and ranks them by what they're worth.",
  robots: { index: true, follow: true },
};

export default async function ToolsQuestionnairePage() {
  // No account required to use the Opportunity Finder - an unauthenticated
  // visitor gets the anonymous flow (fill it out, get the prompt, offered a
  // save step afterward). A session, when present, behaves exactly as
  // before.
  const session = await auth();
  const user = session?.user?.id ? getUserById(session.user.id) : null;

  const submissions = user ? getSubmissionsByUser(user.id) : [];
  const alreadySubmitted = submissions.length > 0;
  const initialPrompt = submissions[0]?.renderedPrompt ?? null;

  return (
    <div style={{ maxWidth: 760, margin: "0 auto", padding: "clamp(24px,4vw,34px) clamp(18px,4vw,44px) 80px" }}>
      <OpportunityFinderFlow
        firstName={user?.firstName}
        email={user?.email}
        emailVerified={user?.emailVerified ?? false}
        alreadySubmitted={alreadySubmitted}
        initialPrompt={initialPrompt}
        accountCompleted={user ? isAccountCompleted(user) : false}
        anonymous={!user}
      />
    </div>
  );
}
