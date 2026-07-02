import Link from "next/link";
import { CalendarIcon } from "./icons";

export default function CtaBanner() {
  return (
    <div
      className="relative overflow-hidden card-accent featured flex items-center gap-6 flex-wrap"
      style={{ marginTop: 30, border: "0.8px solid #3D7FD4", backgroundColor: "#071525", padding: "clamp(22px,3.5vw,30px)" }}
    >
      <span className="br-corner-tr" />
      <div className="flex-1" style={{ minWidth: 240 }}>
        <h3 style={{ margin: 0, font: '700 clamp(16px,3vw,20px) "Courier New", monospace', color: "#EEF6FF", letterSpacing: "0.02em" }}>
          Want to turn this into a plan?
        </h3>
        <p style={{ margin: "9px 0 0", font: "400 14px/1.55 Arial, sans-serif", maxWidth: 480 }}>
          Book a free 20-minute walkthrough. James will talk through your top opportunities and
          what it&apos;d take to get the first one live.
        </p>
      </div>
      <Link
        href="/contact"
        className="inline-flex items-center gap-[9px] transition-all duration-200 hover:[box-shadow:0_0_10px_2px_rgba(61,127,212,0.45),0_0_24px_6px_rgba(137,212,255,0.25)] hover:!text-white"
        style={{
          padding: "14px 22px",
          borderRadius: 6,
          border: "0.8px solid #3D7FD4",
          backgroundColor: "#1A4FC4",
          color: "#EEF6FF",
          font: '400 12.5px "Courier New", monospace',
          letterSpacing: "0.1em",
        }}
      >
        <CalendarIcon size={17} />
        BOOK A WALKTHROUGH
      </Link>
    </div>
  );
}
