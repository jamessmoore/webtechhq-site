import type { Metadata } from "next";
import PromptPilotFlow from "@/components/tools/PromptPilotFlow";
import { auth } from "@/auth";
import { getUserById, isAccountCompleted } from "@/lib/users";
import { getPromptPilotSubmissionByUser } from "@/lib/tools/promptPilotSubmissions";

// This is now the Prompt Pilot landing page as well as the tool itself - no
// separate marketing page exists anymore. Overrides the /tools layout's
// blanket `robots: { index: false, follow: false }` (see src/app/tools/layout.tsx)
// since this specific route is meant to be crawled and indexed, unlike the
// rest of /tools/*. Metadata fields are replaced (not merged) per-field
// against the parent layout, so setting `robots` here is enough on its own.
export const metadata: Metadata = {
  title: "Prompt Pilot | Moore Solutions",
  description:
    "Free tool: answer four quick questions about where you're starting from and what you want to learn, and Prompt Pilot builds you a personalized prompt that has AI teach you AI.",
  robots: { index: true, follow: true },
};

export default async function PromptPilotPage() {
  // No account required to use Prompt Pilot - an unauthenticated visitor
  // gets the anonymous flow (fill it out, get the prompt, offered a save
  // step afterward). A session, when present, behaves exactly as before.
  const session = await auth();
  const user = session?.user?.id ? getUserById(session.user.id) : null;

  const submission = user ? getPromptPilotSubmissionByUser(user.id) : null;

  return (
    <div style={{ maxWidth: 760, margin: "0 auto", padding: "clamp(24px,4vw,34px) clamp(18px,4vw,44px) 80px" }}>
      <PromptPilotFlow
        firstName={user?.firstName}
        email={user?.email}
        emailVerified={user?.emailVerified ?? false}
        alreadySubmitted={!!submission}
        initialPrompt={submission?.renderedPrompt ?? null}
        initialWhy={submission?.why ?? null}
        accountCompleted={user ? isAccountCompleted(user) : false}
        anonymous={!user}
      />
    </div>
  );
}
