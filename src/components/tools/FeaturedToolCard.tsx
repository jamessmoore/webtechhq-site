import Link from "next/link";
import { SparkleIcon, ArrowRightIcon } from "./icons";

interface FeaturedToolCardProps {
  status: "not_started" | "completed";
}

const STATUS_CONFIG = {
  not_started: {
    pillLabel: "NOT STARTED",
    dotColor: "#5B7BA5",
    pillBg: "#0A1A2E",
    pillBorder: "#162D5A",
    pillText: "#80AEE0",
    primaryLabel: "START THE QUESTIONNAIRE",
    primaryHref: "/tools/ai-opportunity-finder",
    secondaryLabel: null as string | null,
    secondaryHref: null as string | null,
  },
  completed: {
    pillLabel: "COMPLETED",
    dotColor: "#FFFFFF",
    pillBg: "#16A34A",
    pillBorder: "#16A34A",
    pillText: "#FFFFFF",
    primaryLabel: "SEE RESULTS",
    primaryHref: "/tools/ai-opportunity-finder",
    secondaryLabel: null as string | null,
    secondaryHref: null as string | null,
  },
};

export default function FeaturedToolCard({ status }: FeaturedToolCardProps) {
  const cfg = STATUS_CONFIG[status];

  return (
    <div
      className="relative overflow-hidden card-accent featured"
      style={{ marginTop: 28, border: "0.8px solid #3D7FD4", backgroundColor: "#071525", borderRadius: 6 }}
    >
      <span className="br-corner-tr" />
      <span className="br-corner-bl" />
      <div
        className="relative flex flex-wrap items-start gap-[22px]"
        style={{ padding: "clamp(20px,3.5vw,30px)" }}
      >
        <div
          className="flex-none flex items-center justify-center"
          style={{ width: 58, height: 58, backgroundColor: "#0A1832", border: "0.8px solid #3D7FD4", borderRadius: 4 }}
        >
          <SparkleIcon size={28} style={{ color: "#89D4FF" } as React.CSSProperties} />
        </div>
        <div className="flex-1" style={{ minWidth: 240 }}>
          <div className="flex items-center gap-[11px] flex-wrap">
            <h2
              style={{ margin: 0, font: '700 clamp(17px,3vw,20px) "Courier New", monospace', color: "#EEF6FF", letterSpacing: "0.02em" }}
            >
              AI Opportunity Finder
            </h2>
            <span
              className="inline-flex items-center gap-[7px]"
              style={{
                font: '400 10px "Courier New", monospace',
                letterSpacing: "0.12em",
                color: cfg.pillText,
                backgroundColor: cfg.pillBg,
                border: `0.8px solid ${cfg.pillBorder}`,
                padding: "4px 10px",
                borderRadius: 3,
              }}
            >
              <span style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: cfg.dotColor }} />
              {cfg.pillLabel}
            </span>
          </div>
          <p style={{ margin: "11px 0 0", font: "400 14px/1.6 Arial, sans-serif", maxWidth: 520 }}>
            Answer a few plain-English questions about how you work. We&apos;ll build you a custom
            prompt to run in Claude, ChatGPT, or Gemini, pointing straight at the AI moves that
            would save you the most time and money. No jargon, no fluff.
          </p>
          <div className="flex gap-5 flex-wrap" style={{ margin: "18px 0 22px" }}>
            <div
              className="flex items-center gap-2"
              style={{ font: '400 12px "Courier New", monospace', letterSpacing: "0.03em", color: "#80AEE0" }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#89D4FF" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 11l3 3L22 4" />
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
              </svg>
              4 QUICK SECTIONS
            </div>
          </div>
          <div className="flex gap-3 items-center flex-wrap">
            <Link
              href={cfg.primaryHref}
              className="inline-flex items-center gap-[9px] transition-all duration-200 hover:[box-shadow:0_0_10px_2px_rgba(61,127,212,0.45),0_0_24px_6px_rgba(137,212,255,0.25)] hover:!text-white"
              style={{
                padding: "12px 20px",
                borderRadius: 6,
                border: "0.8px solid #3D7FD4",
                backgroundColor: "#1A4FC4",
                color: "#EEF6FF",
                font: '400 12px "Courier New", monospace',
                letterSpacing: "0.1em",
              }}
            >
              {cfg.primaryLabel}
              <ArrowRightIcon size={16} />
            </Link>
            {cfg.secondaryLabel && cfg.secondaryHref && (
              <Link
                href={cfg.secondaryHref}
                className="transition-all duration-200 hover:[box-shadow:0_0_10px_2px_rgba(61,127,212,0.45),0_0_24px_6px_rgba(137,212,255,0.25)] hover:!text-white"
                style={{
                  padding: "12px 18px",
                  borderRadius: 6,
                  border: "0.8px solid #162D5A",
                  backgroundColor: "transparent",
                  color: "#EEF6FF",
                  font: '400 12px "Courier New", monospace',
                  letterSpacing: "0.1em",
                }}
              >
                {cfg.secondaryLabel}
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
