import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getUserById } from "@/lib/users";
import { getSubmissionsByUser } from "@/lib/submissions";
import FeaturedToolCard from "@/components/tools/FeaturedToolCard";
import ToolPlaceholderCard from "@/components/tools/ToolPlaceholderCard";
import { COMING_SOON_TOOLS } from "@/lib/tools/reportData";

export const metadata: Metadata = { title: "Dashboard | Moore Solutions" };

export default async function ToolsDashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/signup");

  const user = getUserById(session.user.id);
  if (!user) redirect("/signup");

  const submissions = getSubmissionsByUser(user.id);
  const toolStatus: "not_started" | "completed" = submissions.length > 0 ? "completed" : "not_started";

  return (
    <div style={{ maxWidth: 1040, margin: "0 auto", padding: "clamp(24px,4vw,40px) clamp(18px,4vw,44px) 64px" }}>
      <h1
        style={{ margin: 0, font: '400 clamp(23px,4.4vw,32px)/1.15 "Courier New", monospace', letterSpacing: "0.01em" }}
      >
        Welcome back, {user.firstName}.
      </h1>
      <p style={{ margin: "11px 0 0", font: "400 clamp(14px,2.4vw,15.5px)/1.6 Arial, sans-serif", maxWidth: 560 }}>
        Your AI toolkit lives here. Run a tool, get clear results, and put your time back where
        it belongs — running the business.
      </p>

      <FeaturedToolCard status={toolStatus} />

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
