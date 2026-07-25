import type { Metadata } from "next";
import { redirect } from "next/navigation";
import PromptPilotFlow from "@/components/tools/PromptPilotFlow";
import { auth } from "@/auth";
import { getUserById, isAccountCompleted } from "@/lib/users";
import { getPromptPilotSubmissionByUser } from "@/lib/tools/promptPilotSubmissions";

export const metadata: Metadata = { title: "Prompt Pilot | Moore Solutions" };

export default async function PromptPilotPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/signup");

  const user = getUserById(session.user.id);
  if (!user) redirect("/signup");

  const submission = getPromptPilotSubmissionByUser(user.id);

  return (
    <div style={{ maxWidth: 760, margin: "0 auto", padding: "clamp(24px,4vw,34px) clamp(18px,4vw,44px) 80px" }}>
      <PromptPilotFlow
        firstName={user.firstName}
        email={user.email}
        emailVerified={user.emailVerified}
        alreadySubmitted={!!submission}
        initialPrompt={submission?.renderedPrompt ?? null}
        initialWhy={submission?.why ?? null}
        accountCompleted={isAccountCompleted(user)}
      />
    </div>
  );
}
