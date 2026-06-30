import Link from "next/link";
import LogoLockup from "@/components/LogoLockup";

export function LegalLayout({
  eyebrow,
  title,
  lastUpdated,
  children,
}: {
  eyebrow: string;
  title: string;
  lastUpdated: string;
  children: React.ReactNode;
}) {
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
          {eyebrow}
        </p>
        <h1
          className="text-3xl font-bold mb-4"
          style={{ color: "#EEF6FF", fontFamily: "'Courier New', monospace" }}
        >
          {title}
        </h1>
        <p className="text-sm mb-10" style={{ color: "#6B8CAE" }}>
          {lastUpdated}
        </p>

        <div
          className="legal-content text-sm leading-relaxed"
          style={{ color: "#8BACC8" }}
        >
          {children}
        </div>

        <p className="mt-12">
          <Link
            href="/signup"
            className="text-xs underline hover:no-underline"
            style={{ color: "#6B8CAE" }}
          >
            ← Back to sign up
          </Link>
        </p>
      </main>

      <style>{`
        .legal-content h2 {
          color: #EEF6FF;
          font-weight: 700;
          font-size: 1.125rem;
          margin-top: 2.5rem;
          margin-bottom: 0.75rem;
        }
        .legal-content h2:first-child {
          margin-top: 0;
        }
        .legal-content p {
          margin-bottom: 1rem;
        }
        .legal-content ul {
          list-style: disc;
          padding-left: 1.25rem;
          margin-bottom: 1rem;
        }
        .legal-content li {
          margin-bottom: 0.5rem;
        }
        .legal-content a {
          color: #89D4FF;
          text-decoration: underline;
        }
        .legal-content strong {
          color: #B7CDE3;
        }
        .legal-content .legal-callout {
          background: rgba(14,58,154,0.06);
          border: 1px solid #162D5A;
          border-radius: 0.5rem;
          padding: 1.25rem 1.5rem;
          margin: 1rem 0 1.5rem;
          font-size: 0.8125rem;
        }
        .legal-content .legal-fineprint {
          font-style: italic;
          font-size: 0.8125rem;
          color: #6B8CAE;
          margin-top: 2.5rem;
        }
      `}</style>
    </div>
  );
}

export default LegalLayout;
