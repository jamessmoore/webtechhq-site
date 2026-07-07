import type { Metadata } from "next";
import Link from "next/link";
import LogoLockup from "@/components/LogoLockup";

export const metadata: Metadata = {
  title: "Email Verification | Moore Solutions",
};

type State = "success" | "expired" | "invalid";

function getState(params: Record<string, string | string[] | undefined>): State {
  if (params.success) return "success";
  if (params.error === "expired") return "expired";
  return "invalid";
}

const CONTENT: Record<
  State,
  { icon: string; iconColor: string; iconBg: string; heading: string; body: string; cta: { label: string; href: string } }
> = {
  success: {
    icon: "✓",
    iconColor: "#89D4FF",
    iconBg: "rgba(61,127,212,0.15)",
    heading: "Email verified",
    body: "Your account is active. You can now sign in and start your Opportunity Finder.",
    cta: { label: "Sign in →", href: "/signin" },
  },
  expired: {
    icon: "⏱",
    iconColor: "#FBBC05",
    iconBg: "rgba(251,188,5,0.1)",
    heading: "Link expired",
    body: "This verification link has expired. Verification links are valid for 24 hours. Create a new account to get a fresh link.",
    cta: { label: "Sign up again →", href: "/signup" },
  },
  invalid: {
    icon: "✕",
    iconColor: "#FF6B6B",
    iconBg: "rgba(255,107,107,0.1)",
    heading: "Invalid link",
    body: "This verification link doesn't look right. It may have already been used or was copied incorrectly. Try signing in, or create a new account.",
    cta: { label: "Sign in →", href: "/signin" },
  },
};

export default async function VerifyPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const state = getState(params);
  const { icon, iconColor, iconBg, heading, body, cta } = CONTENT[state];

  return (
    <div
      className="min-h-screen flex items-center justify-center px-6 py-12"
      style={{ backgroundColor: "#030B18" }}
    >
      {/* Grid */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(#09182E 1px, transparent 1px), linear-gradient(90deg, #09182E 1px, transparent 1px)",
          backgroundSize: "136px 50px",
        }}
      />

      <div className="relative z-10 w-full max-w-[420px] text-center">
        <div className="mb-8 flex justify-center">
          <Link href="/">
            <LogoLockup height={38} />
          </Link>
        </div>

        <div
          className="p-10 rounded-lg"
          style={{ background: "rgba(14,58,154,0.06)", border: "1px solid #162D5A" }}
        >
          {/* Icon */}
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-6 text-xl font-bold"
            style={{ background: iconBg, border: `1px solid ${iconColor}`, color: iconColor }}
          >
            {icon}
          </div>

          <h1
            className="text-2xl font-bold mb-4"
            style={{ color: "#3D7FD4", fontFamily: "'Courier New', monospace" }}
          >
            {heading}
          </h1>

          <p className="text-sm leading-relaxed mb-8">
            {body}
          </p>

          <Link
            href={cta.href}
            className="inline-block w-full py-3 text-sm font-bold tracking-widest transition-all duration-200 hover:[box-shadow:0_0_10px_2px_rgba(61,127,212,0.45),0_0_24px_6px_rgba(137,212,255,0.25)] hover:!text-white"
            style={{
              background: "linear-gradient(180deg, #1A4FC4, #0E3A9A)",
              border: "1px solid #3D7FD4",
              borderRadius: "6px",
              color: "#89D4FF",
              fontFamily: "'Courier New', monospace",
            }}
          >
            {cta.label}
          </Link>
        </div>

        <p className="mt-6 text-xs">
          <Link href="/" className="underline hover:no-underline" style={{ color: "#4A6A8A" }}>
            ← Back to webtechhq.com
          </Link>
        </p>
      </div>
    </div>
  );
}
