import Link from "next/link";
import type { Opportunity } from "@/lib/tools/reportData";
import { ChevronIcon, ClockIcon, CheckIcon, ArrowRightIcon } from "./icons";

interface OpportunityCardProps {
  opp: Opportunity;
  expanded: boolean;
  onToggle: () => void;
}

const IMPACT_COLOR: Record<Opportunity["impact"], string> = {
  High: "#89D4FF",
  Medium: "#3D7FD4",
  Foundational: "#5B7BA5",
};

const EFFORT_COLOR: Record<Opportunity["effort"], string> = {
  Low: "#89D4FF",
  Medium: "#5B90C8",
  High: "#5B7BA5",
};

function Dot({ color }: { color: string }) {
  return <span style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: color }} />;
}

export default function OpportunityCard({ opp, expanded, onToggle }: OpportunityCardProps) {
  return (
    <div style={{ backgroundColor: "#071525", border: "0.8px solid #162D5A" }}>
      <div
        onClick={onToggle}
        className="flex gap-4 items-start cursor-pointer"
        style={{ padding: "18px 20px" }}
      >
        <div
          className="flex-none flex items-center justify-center"
          style={{ width: 32, height: 32, backgroundColor: "#0A1832", border: "0.8px solid #3D7FD4", font: '700 14px "Courier New", monospace', color: "#89D4FF" }}
        >
          {opp.rank}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-[10px] flex-wrap">
            <h3 style={{ margin: 0, font: '700 clamp(14px,2.6vw,16px) "Courier New", monospace', color: "#EEF6FF", letterSpacing: "0.02em" }}>
              {opp.title}
            </h3>
            <span
              style={{
                font: '400 9.5px "Courier New", monospace',
                letterSpacing: "0.1em",
                color: "#5B7BA5",
                border: "0.8px solid #162D5A",
                padding: "2px 8px",
              }}
            >
              {opp.cat.toUpperCase()}
            </span>
          </div>
          <p style={{ margin: "8px 0 0", font: "400 13.5px/1.55 Arial, sans-serif", color: "#80AEE0" }}>{opp.plain}</p>
          <div className="flex gap-4 flex-wrap" style={{ marginTop: 12 }}>
            <span className="flex items-center gap-[7px]" style={{ font: '400 11px "Courier New", monospace', letterSpacing: "0.03em", color: "#80AEE0" }}>
              <Dot color={IMPACT_COLOR[opp.impact]} />
              {opp.impact.toUpperCase()} IMPACT
            </span>
            <span className="flex items-center gap-[7px]" style={{ font: '400 11px "Courier New", monospace', letterSpacing: "0.03em", color: "#80AEE0" }}>
              <Dot color={EFFORT_COLOR[opp.effort]} />
              {opp.effort.toUpperCase()} EFFORT
            </span>
            <span className="flex items-center gap-[7px]" style={{ font: '400 11px "Courier New", monospace', letterSpacing: "0.03em", color: "#80AEE0" }}>
              <ClockIcon size={13} style={{ color: "#89D4FF" } as React.CSSProperties} />
              {opp.time}
            </span>
          </div>
        </div>
        <div className="flex-none flex flex-col items-end gap-[9px]">
          <div style={{ textAlign: "right" }}>
            <div style={{ font: '700 17px "Courier New", monospace', color: "#EEF6FF" }}>{opp.fit}</div>
            <div style={{ font: '400 9px "Courier New", monospace', letterSpacing: "0.14em", color: "#5B7BA5" }}>FIT</div>
          </div>
          <ChevronIcon size={17} open={expanded} style={{ color: "#5B7BA5" } as React.CSSProperties} />
        </div>
      </div>
      {expanded && (
        <div style={{ padding: "0 clamp(18px,4vw,22px) 22px clamp(20px,7vw,68px)" }}>
          <div
            className="grid gap-[22px]"
            style={{ borderTop: "0.8px solid #162D5A", paddingTop: 17, gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))" }}
          >
            <div>
              <div style={{ font: '400 10.5px "Courier New", monospace', letterSpacing: "0.12em", color: "#89D4FF", marginBottom: 11 }}>
                WHAT THIS LOOKS LIKE FOR YOU
              </div>
              <div className="flex flex-col gap-[9px]">
                {opp.looks.map((look) => (
                  <div key={look} className="flex gap-[9px]" style={{ font: "400 13px/1.5 Arial, sans-serif", color: "#80AEE0" }}>
                    <CheckIcon size={14} style={{ color: "#89D4FF", flex: "none", marginTop: 2 } as React.CSSProperties} />
                    <span>{look}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div style={{ font: '400 10.5px "Courier New", monospace', letterSpacing: "0.12em", color: "#89D4FF", marginBottom: 11 }}>
                HOW WE&apos;D ROLL IT OUT
              </div>
              <p style={{ margin: "0 0 16px", font: "400 13px/1.6 Arial, sans-serif", color: "#80AEE0" }}>{opp.rollout}</p>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 transition-colors duration-150"
                style={{
                  padding: "10px 16px",
                  borderRadius: 2,
                  border: "0.8px solid #3D7FD4",
                  backgroundColor: "#143C6A",
                  color: "#BCE5FF",
                  font: '400 11px "Courier New", monospace',
                  letterSpacing: "0.08em",
                }}
              >
                TALK TO JAMES ABOUT THIS
                <ArrowRightIcon size={14} />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
