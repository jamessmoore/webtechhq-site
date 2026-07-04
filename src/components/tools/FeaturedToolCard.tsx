import Link from "next/link";
import { ArrowRightIcon } from "./icons";

export type ToolCardStatus = "not_started" | "completed" | "locked" | "purchased";

interface FeaturedToolCardProps {
  title: string;
  description: string;
  status: ToolCardStatus;
  href: string;
  icon: React.ReactNode;
  metaItems?: string[];
  primaryLabel: string;
}

const STATUS_CONFIG: Record<
  ToolCardStatus,
  { pillLabel: string; dotColor: string; pillBg: string; pillBorder: string; pillText: string }
> = {
  not_started: {
    pillLabel: "NOT STARTED",
    dotColor: "#5B7BA5",
    pillBg: "#0A1A2E",
    pillBorder: "#162D5A",
    pillText: "#80AEE0",
  },
  completed: {
    pillLabel: "COMPLETED",
    dotColor: "#FFFFFF",
    pillBg: "#16A34A",
    pillBorder: "#16A34A",
    pillText: "#FFFFFF",
  },
  locked: {
    pillLabel: "LOCKED",
    dotColor: "#5B7BA5",
    pillBg: "#0A1A2E",
    pillBorder: "#162D5A",
    pillText: "#5B7BA5",
  },
  purchased: {
    pillLabel: "PURCHASED",
    dotColor: "#FFFFFF",
    pillBg: "#16A34A",
    pillBorder: "#16A34A",
    pillText: "#FFFFFF",
  },
};

export default function FeaturedToolCard({
  title,
  description,
  status,
  href,
  icon,
  metaItems,
  primaryLabel,
}: FeaturedToolCardProps) {
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
          {icon}
        </div>
        <div className="flex-1" style={{ minWidth: 240 }}>
          <div className="flex items-center gap-[11px] flex-wrap">
            <h2
              style={{ margin: 0, font: '700 clamp(17px,3vw,20px) "Courier New", monospace', color: "#EEF6FF", letterSpacing: "0.02em" }}
            >
              {title}
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
            {description}
          </p>
          {metaItems && metaItems.length > 0 && (
            <div className="flex gap-5 flex-wrap" style={{ margin: "18px 0 22px" }}>
              {metaItems.map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-2"
                  style={{ font: '400 12px "Courier New", monospace', letterSpacing: "0.03em", color: "#80AEE0" }}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#89D4FF" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 11l3 3L22 4" />
                    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                  </svg>
                  {item}
                </div>
              ))}
            </div>
          )}
          <div className="flex gap-3 items-center flex-wrap">
            <Link
              href={href}
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
              {primaryLabel}
              <ArrowRightIcon size={16} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
