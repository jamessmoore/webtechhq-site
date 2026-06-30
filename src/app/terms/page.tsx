import type { Metadata } from "next";
import Link from "next/link";
import LogoLockup from "@/components/LogoLockup";

export const metadata: Metadata = {
  title: "Terms of Service | Moore Solutions",
};

export default function TermsPage() {
  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: "#030B18" }}
    >
      <header className="px-6 py-5 border-b" style={{ borderColor: "#162D5A" }}>
        <Link href="/">
          <LogoLockup height={38} />
        </Link>
      </header>

      <main className="flex-1 px-6 py-12 max-w-[720px] mx-auto w-full">
        <p
          className="text-xs tracking-[0.2em] mb-4"
          style={{ color: "#3D7FD4" }}
        >
          LEGAL
        </p>
        <h1
          className="text-3xl font-bold mb-4"
          style={{ color: "#EEF6FF", fontFamily: "'Courier New', monospace" }}
        >
          Terms of Service
        </h1>
        <p className="text-sm mb-10" style={{ color: "#6B8CAE" }}>
          Last updated: coming soon
        </p>

        <div
          className="p-8 rounded-lg text-sm leading-relaxed"
          style={{
            background: "rgba(14,58,154,0.06)",
            border: "1px solid #162D5A",
            color: "#8BACC8",
          }}
        >
          <p>
            The Terms of Service for Moore Solutions are being drafted and will
            be published here shortly. Please check back soon or{" "}
            <a
              href="mailto:james@webtechhq.com"
              className="underline"
              style={{ color: "#89D4FF" }}
            >
              contact us
            </a>{" "}
            with any questions.
          </p>
        </div>

        <p className="mt-8">
          <Link
            href="/signup"
            className="text-xs underline hover:no-underline"
            style={{ color: "#6B8CAE" }}
          >
            ← Back to sign up
          </Link>
        </p>
      </main>
    </div>
  );
}
