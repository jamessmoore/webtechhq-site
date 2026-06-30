import type { Metadata } from "next";
import ForgotPasswordForm from "@/components/ForgotPasswordForm";
import LogoLockup from "@/components/LogoLockup";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Reset Password | Moore Solutions",
  description: "Request a password reset link for your Moore Solutions account.",
};

export default function ForgotPasswordPage() {
  return (
    <div
      className="min-h-screen flex items-center justify-center px-6 py-12"
      style={{ backgroundColor: "#030B18" }}
    >
      {/* Subtle grid */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(#09182E 1px, transparent 1px), linear-gradient(90deg, #09182E 1px, transparent 1px)",
          backgroundSize: "136px 50px",
        }}
      />

      <div className="relative z-10 w-full max-w-[400px]">
        {/* Logo */}
        <div className="mb-8 flex justify-center">
          <Link href="/">
            <LogoLockup height={40} />
          </Link>
        </div>

        {/* Card */}
        <div
          className="p-8 rounded-lg"
          style={{
            background: "rgba(14,58,154,0.06)",
            border: "1px solid #162D5A",
          }}
        >
          <div className="mb-7">
            <h1
              className="text-2xl font-bold mb-2"
              style={{ color: "#EEF6FF", fontFamily: "'Courier New', monospace" }}
            >
              Forgot your password?
            </h1>
            <p className="text-sm" style={{ color: "#6B8CAE" }}>
              Enter your email and we&apos;ll send you a reset link.
            </p>
          </div>

          <ForgotPasswordForm />
        </div>

        <p className="mt-6 text-center text-xs" style={{ color: "#4A6A8A" }}>
          <Link href="/" className="underline hover:no-underline" style={{ color: "#4A6A8A" }}>
            ← Back to webtechhq.com
          </Link>
        </p>
      </div>
    </div>
  );
}
