import type { Metadata } from "next";
import SignUpForm from "@/components/SignUpForm";
import LogoLockup from "@/components/LogoLockup";
import HexMark from "@/components/HexMark";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Opportunity Finder | Moore Solutions",
  description:
    "Free tool: answer a few plain-English questions about how your business runs, and the Opportunity Finder builds you a custom AI prompt that surfaces your best opportunities and ranks them by what they're worth.",
};

const PROOF_POINTS = [
  "Built from how your business actually runs, not a generic \"10 AI tools\" listicle",
  "Ranked by time saved and dollar impact, so you know what to tackle first",
  "Run it in Claude, ChatGPT, or Gemini, no new app or account to learn first",
];

export default function OpportunityFinderPage() {
  return (
    <div
      className="min-h-screen flex"
      style={{ backgroundColor: "#030B18" }}
    >
      {/* Left panel — branding */}
      <div
        className="hidden lg:flex lg:w-[52%] flex-col justify-between p-12 relative overflow-hidden"
        style={{
          background: "linear-gradient(160deg, #040C1C 0%, #030B18 60%, #051530 100%)",
          borderRight: "1px solid #162D5A",
        }}
      >
        {/* Grid overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(#09182E 1px, transparent 1px), linear-gradient(90deg, #09182E 1px, transparent 1px)",
            backgroundSize: "136px 50px",
          }}
        />

        {/* Drifting hex watermark — contained by overflow-hidden on the panel */}
        <div
          className="absolute opacity-[0.065] pointer-events-none select-none"
          style={{ top: "50%", transform: "translateY(calc(-25% - 160px))" }}
        >
          <div className="hex-watermark-drift">
            <HexMark size={320} />
          </div>
        </div>

        {/* Logo */}
        <div className="relative z-10">
          <Link href="/">
            <LogoLockup height={44} />
          </Link>
        </div>

        {/* Main copy */}
        <div className="relative z-10 max-w-[440px]">
          <p className="text-xs tracking-[0.2em] mb-4">
            OPPORTUNITY FINDER
          </p>
          <h1
            className="text-3xl xl:text-4xl font-bold leading-tight mb-6"
            style={{ fontFamily: "'Courier New', monospace" }}
          >
            <span style={{ color: "#EEF6FF" }}>Stop guessing</span>
            <br />
            <span style={{ color: "#89D4FF" }}>where AI pays off</span>
          </h1>
          <p className="text-[21px] leading-relaxed mb-10">
            You don&apos;t need another AI experiment, you need to know which one is worth
            your time. Answer a few plain-English questions about how your business runs,
            and I&apos;ll build you a custom AI prompt, ready to run in Claude, ChatGPT, or
            Gemini, that points straight at the moves that would save you the most time
            and money.
          </p>

          <ul className="space-y-3">
            {PROOF_POINTS.map((point, index) => (
              <li key={point} className="flex items-start gap-3">
                <span
                  className="mt-0.5 shrink-0 w-4 h-4 rounded-full flex items-center justify-center"
                  style={{ background: "rgba(61,127,212,0.15)", border: "1px solid #3D7FD4" }}
                >
                  <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                    <path d="M1 4l2.2 2.2 3.8-4.4" stroke="#89D4FF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                <span
                  className={index === 0 ? "text-[15px] leading-relaxed" : "text-sm leading-relaxed"}
                  style={{ color: "#8BACC8" }}
                >
                  {point}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Footer copy */}
        <div className="relative z-10">
          <p className="text-[14px]">
            James S. Moore · Moore Solutions · webtechhq.com
          </p>
        </div>

        {/* Decorative corner ticks */}
        <div className="absolute top-8 right-8 w-5 h-5 pointer-events-none"
          style={{ borderTop: "1px solid #162D5A", borderRight: "1px solid #162D5A" }} />
        <div className="absolute bottom-8 left-8 w-5 h-5 pointer-events-none"
          style={{ borderBottom: "1px solid #162D5A", borderLeft: "1px solid #162D5A" }} />
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex flex-col justify-center items-center px-6 py-12 lg:px-12">
        {/* Mobile logo */}
        <div className="lg:hidden mb-8">
          <Link href="/">
            <LogoLockup height={38} />
          </Link>
        </div>

        <div className="w-full max-w-[400px]">
          <div className="mb-8">
            <h2
              className="text-2xl font-bold mb-2"
              style={{ color: "#3D7FD4", fontFamily: "'Courier New', monospace" }}
            >
              Try the Opportunity
              <br />
              Finder free
            </h2>
            <p className="text-sm">
              Just your name and email to get started. It&apos;s free and takes about 5 minutes.
            </p>
          </div>

          <SignUpForm
            source="opportunity-finder"
            googleCallbackUrl="/tools/opportunity-finder"
          />
        </div>
      </div>
    </div>
  );
}
