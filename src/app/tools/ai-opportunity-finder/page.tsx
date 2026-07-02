import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Questionnaire from "@/components/Questionnaire";
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

  return (
    <div style={{ maxWidth: 760, margin: "0 auto", padding: "clamp(24px,4vw,34px) clamp(18px,4vw,44px) 80px" }}>
      <h1
        style={{ margin: 0, font: '400 clamp(21px,4vw,27px)/1.2 "Courier New", monospace', color: "#EEF6FF", letterSpacing: "0.01em" }}
      >
        Let&apos;s find your best AI opportunities
      </h1>
      <p style={{ margin: "11px 0 0", font: "400 clamp(14px,2.4vw,15.5px)/1.6 Arial, sans-serif", color: "#80AEE0" }}>
        There are no wrong answers — just tell us how things really work today. The more honest
        you are, the sharper your report.
      </p>

      <div style={{ marginTop: 32 }}>
        <Questionnaire
          firstName={user.firstName}
          email={user.email}
          emailVerified={user.emailVerified}
          alreadySubmitted={alreadySubmitted}
          redirectOnSuccessHref="/tools/ai-opportunity-finder/report"
        />
      </div>
    </div>
  );
}
