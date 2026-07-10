import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getUserById } from "@/lib/users";
import { getSubmissionsByUser } from "@/lib/submissions";
import { hasPurchased } from "@/lib/purchases";
import FeaturedToolCard, { type ToolCardStatus } from "@/components/tools/FeaturedToolCard";
import ToolPlaceholderCard from "@/components/tools/ToolPlaceholderCard";
import TestAccountResetButton from "@/components/tools/TestAccountResetButton";
import { TelescopeIcon, SearchIcon } from "@/components/tools/icons";
import { COMING_SOON_TOOLS } from "@/lib/tools/reportData";
import { isGoldStandardTestAccount } from "@/lib/testAccount";

export const metadata: Metadata = { title: "Dashboard | Moore Solutions" };

export default async function ToolsDashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/signup");

  const user = getUserById(session.user.id);
  if (!user) redirect("/signup");

  const isTestAccount = isGoldStandardTestAccount(user.email);

  const submissions = getSubmissionsByUser(user.id);
  const hasSubmission = submissions.length > 0;
  const opportunityFinderStatus: ToolCardStatus = hasSubmission ? "completed" : "not_started";

  const purchasedAudit = hasPurchased(user.id, "business_audit");
  const businessAuditStatus: ToolCardStatus = !hasSubmission
    ? "locked"
    : purchasedAudit
      ? "purchased"
      : "not_started";

  const businessAuditPrimaryLabel =
    businessAuditStatus === "locked"
      ? "FINISH THE OPPORTUNITY FINDER FIRST"
      : businessAuditStatus === "purchased"
        ? "VIEW YOUR AUDIT"
        : isTestAccount
          ? "RUN YOUR AUDIT (TEST, NO CHARGE)"
          : "GET YOUR AUDIT, $50";
  const businessAuditHref = businessAuditStatus === "locked" ? "/tools/opportunity-finder" : "/tools/business-audit";

  return (
    <div style={{ maxWidth: 1040, margin: "0 auto", padding: "clamp(24px,4vw,40px) clamp(18px,4vw,44px) 64px" }}>
      {isTestAccount && <TestAccountResetButton />}
      <h1
        style={{
          margin: 0,
          font: '400 clamp(23px,4.4vw,32px)/1.15 "Courier New", monospace',
          color: "#89D4FF",
          letterSpacing: "0.01em",
        }}
      >
        Welcome back, {user.firstName}.
      </h1>
      <p style={{ margin: "11px 0 0", font: "400 21px/1.6 Arial, sans-serif", color: "#FFFFFF", maxWidth: 560 }}>
        Your AI toolkit lives here. Run a tool, get clear results, and put your time back where
        it belongs, running the business.
      </p>

      <FeaturedToolCard
        title="Opportunity Finder"
        description="Answer a few plain-English questions about how you work. I'll build you a custom prompt to run in Claude, ChatGPT, or Gemini, pointing straight at the AI moves that would save you the most time and money. No jargon, no fluff."
        status={opportunityFinderStatus}
        href="/tools/opportunity-finder"
        icon={<TelescopeIcon size={42} style={{ color: "#89D4FF" } as React.CSSProperties} />}
        metaItems={["4 QUICK SECTIONS"]}
        primaryLabel={opportunityFinderStatus === "completed" ? "SEE RESULTS" : "START THE OPPORTUNITY FINDER"}
      />

      <FeaturedToolCard
        title="Business Audit"
        description="A personalized audit of your business, built from your Opportunity Finder answers. Get a clear breakdown of what to automate first and what it's worth."
        status={businessAuditStatus}
        href={businessAuditHref}
        icon={<SearchIcon size={42} style={{ color: "#89D4FF" } as React.CSSProperties} />}
        metaItems={["FOUNDING CLIENT RATE", "ONE-TIME PURCHASE"]}
        primaryLabel={businessAuditPrimaryLabel}
      />

      <div className="flex items-baseline justify-between flex-wrap gap-2" style={{ marginTop: 38 }}>
        <h3 style={{ margin: 0, font: '700 13px "Courier New", monospace', letterSpacing: "0.14em", color: "#EEF6FF" }}>
          MORE TOOLS ON THE WAY
        </h3>
        <span style={{ font: "400 12px Arial, sans-serif", color: "#5B7BA5" }}>Added as James builds them</span>
      </div>
      <div
        className="grid gap-[14px]"
        style={{ marginTop: 16, gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}
      >
        {COMING_SOON_TOOLS.map((tool) => (
          <ToolPlaceholderCard key={tool.name} glyph={tool.glyph} name={tool.name} desc={tool.desc} />
        ))}
      </div>
    </div>
  );
}
