import type { Metadata } from "next";
import SignUpForm from "@/components/SignUpForm";
import LogoLockup from "@/components/LogoLockup";
import HexMark from "@/components/HexMark";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Get Started | Moore Solutions",
  description:
    "Create a free account to start your AI Business Audit questionnaire.",
};

const PROOF_POINTS = [
  "A custom AI prompt built around your business, not a generic template",
  "Send it straight to Claude, ChatGPT, or Gemini in one click",
  "Get your answers in minutes, not days",
];

export default function SignUpPage() {
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
            AI OPPORTUNITY FINDER
          </p>
          <h1
            className="text-3xl xl:text-4xl font-bold leading-tight mb-6"
            style={{ fontFamily: "'Courier New', monospace" }}
          >
            <span style={{ color: "#EEF6FF" }}>Find the opportunities</span>
            <br />
            <span style={{ color: "#89D4FF" }}>hiding in your business</span>
          </h1>
          <p className="text-[21px] leading-relaxed mb-10">
            Answer a few questions about your biggest operational headaches.
            I&apos;ll build you a custom AI prompt, ready to run in Claude,
            ChatGPT, or Gemini, that surfaces your top opportunities, ranks
            them by impact, and estimates what each one is worth.
          </p>

          <ul className="space-y-3">
            {PROOF_POINTS.map((point) => (
              <li key={point} className="flex items-start gap-3">
                <span
                  className="mt-0.5 shrink-0 w-4 h-4 rounded-full flex items-center justify-center"
                  style={{ background: "rgba(61,127,212,0.15)", border: "1px solid #3D7FD4" }}
                >
                  <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                    <path d="M1 4l2.2 2.2 3.8-4.4" stroke="#89D4FF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                <span className="text-sm leading-relaxed" style={{ color: "#8BACC8" }}>
                  {point}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Footer copy */}
        <div className="relative z-10">
          <p className="text-xs">
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
              Create your account
            </h2>
            <p className="text-sm">
              The finder is free. Takes about 5 minutes.
            </p>
          </div>

          <SignUpForm />
        </div>
      </div>
    </div>
  );
}
