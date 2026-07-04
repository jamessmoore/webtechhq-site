import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { getUserById } from "@/lib/users";
import { getSubmissionsByUser } from "@/lib/submissions";
import { SparkleIcon } from "@/components/tools/icons";
import ReportScoreRing from "@/components/tools/ReportScoreRing";
import KpiTiles from "@/components/tools/KpiTiles";
import OpportunitiesList from "@/components/tools/OpportunitiesList";
import ReadinessBars from "@/components/tools/ReadinessBars";
import CtaBanner from "@/components/tools/CtaBanner";
import { REPORT_SCORE, KPIS, OPPORTUNITIES, READINESS_BARS } from "@/lib/tools/reportData";

export const metadata: Metadata = { title: "Your Opportunity Report | Moore Solutions" };

export default async function ToolsReportPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/signup");

  const user = getUserById(session.user.id);
  if (!user) redirect("/signup");

  const submissions = getSubmissionsByUser(user.id);
  if (submissions.length === 0) redirect("/tools/opportunity-finder");

  return (
    <div style={{ maxWidth: 920, margin: "0 auto", padding: "clamp(24px,4vw,40px) clamp(18px,4vw,44px) 70px" }}>
      <div
        className="flex items-center gap-[9px]"
        style={{ font: '400 11px "Courier New", monospace', letterSpacing: "0.16em", color: "#89D4FF", marginBottom: 16 }}
      >
        <SparkleIcon size={14} />
        YOUR PERSONALIZED REPORT
      </div>

      <div className="flex items-center flex-wrap" style={{ gap: "clamp(20px,4vw,30px)" }}>
        <ReportScoreRing score={REPORT_SCORE} />
        <div className="flex-1" style={{ minWidth: 250 }}>
          <h1
            style={{ margin: 0, font: '400 clamp(21px,4vw,27px)/1.2 "Courier New", monospace', color: "#EEF6FF", letterSpacing: "0.01em" }}
          >
            Strong potential, {user.firstName}.
          </h1>
          <p style={{ margin: "12px 0 0", font: "400 clamp(14px,2.4vw,15.5px)/1.6 Arial, sans-serif" }}>
            Based on your answers, the fastest wins are around how quickly leads get a response
            and how much repetitive admin is on your plate. Here are the moves we&apos;d make,
            in the order we&apos;d make them.
          </p>
        </div>
      </div>

      <KpiTiles kpis={KPIS} />

      <h2
        style={{ margin: "38px 0 4px", font: '700 clamp(15px,3vw,17px) "Courier New", monospace', letterSpacing: "0.06em", color: "#EEF6FF" }}
      >
        YOUR PRIORITIZED OPPORTUNITIES
      </h2>
      <p style={{ margin: "0 0 18px", font: "400 13.5px/1.5 Arial, sans-serif" }}>
        Ranked by impact, effort, and how well they fit your business. Tap any one to see what it
        looks like for you.
      </p>
      <OpportunitiesList opportunities={OPPORTUNITIES} />

      <h2
        style={{ margin: "38px 0 16px", font: '700 clamp(15px,3vw,17px) "Courier New", monospace', letterSpacing: "0.06em", color: "#EEF6FF" }}
      >
        WHERE YOU STAND TODAY
      </h2>
      <ReadinessBars bars={READINESS_BARS} />

      <CtaBanner />

      <div className="flex gap-3 justify-center flex-wrap" style={{ marginTop: 20 }}>
        <Link
          href="/tools/opportunity-finder"
          className="transition-all duration-200 hover:[box-shadow:0_0_10px_2px_rgba(61,127,212,0.45),0_0_24px_6px_rgba(137,212,255,0.25)] hover:!text-white"
          style={{
            padding: "11px 18px",
            borderRadius: 6,
            border: "0.8px solid #162D5A",
            backgroundColor: "transparent",
            color: "#80AEE0",
            font: '400 11px "Courier New", monospace',
            letterSpacing: "0.08em",
          }}
        >
          REVIEW MY ANSWERS
        </Link>
        <button
          type="button"
          disabled
          title="PDF export is coming soon"
          style={{
            padding: "11px 18px",
            borderRadius: 6,
            border: "0.8px solid #162D5A",
            backgroundColor: "transparent",
            color: "#5B7BA5",
            font: '400 11px "Courier New", monospace',
            letterSpacing: "0.08em",
            cursor: "not-allowed",
          }}
        >
          DOWNLOAD PDF
        </button>
      </div>
    </div>
  );
}
