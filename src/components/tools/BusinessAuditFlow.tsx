"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import PayPalCardCheckout from "./PayPalCardCheckout";
import BusinessAuditReport from "./BusinessAuditReport";
import { ShieldIcon, SearchIcon, CheckIcon, ArrowRightIcon } from "./icons";
import type { Product } from "@/lib/products";
import type { AuditReport, AuditReportStatus } from "@/lib/types";

function formatWholeDollars(cents: number): string {
  return `$${(cents / 100).toFixed(0)}`;
}

export default function BusinessAuditFlow({
  product,
  hasSubmission,
  accountCompleted,
  alreadyPurchased,
  initialReportStatus,
  initialReport,
  isTestAccount = false,
}: {
  product: Product;
  hasSubmission: boolean;
  accountCompleted: boolean;
  alreadyPurchased: boolean;
  initialReportStatus?: AuditReportStatus | null;
  initialReport?: AuditReport | null;
  isTestAccount?: boolean;
}) {
  const [justConfirmed, setJustConfirmed] = useState(false);
  const [purchased, setPurchased] = useState(alreadyPurchased);
  const [businessName, setBusinessName] = useState("");
  const [reportStatus, setReportStatus] = useState<AuditReportStatus | null>(initialReportStatus ?? null);
  const [report, setReport] = useState<AuditReport | null>(initialReport ?? null);
  const [runningTest, setRunningTest] = useState(false);
  const [testRunError, setTestRunError] = useState<string | null>(null);

  async function handleTestRun() {
    setRunningTest(true);
    setTestRunError(null);
    try {
      const res = await fetch("/api/tools/business-audit/run-test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessName: businessName.trim() }),
      });
      if (!res.ok) {
        const d = (await res.json()) as { error?: string };
        setTestRunError(d.error ?? "Something went wrong.");
        setRunningTest(false);
        return;
      }
      setPurchased(true);
      setReportStatus("generating");
    } catch {
      setTestRunError("Network error.");
      setRunningTest(false);
    }
  }

  useEffect(() => {
    if (!justConfirmed) return;
    const timer = setTimeout(() => {
      setPurchased(true);
      setReportStatus((prev) => prev ?? "generating");
    }, 2200);
    return () => clearTimeout(timer);
  }, [justConfirmed]);

  useEffect(() => {
    if (!purchased || reportStatus !== "generating") return;
    const interval = setInterval(async () => {
      try {
        const res = await fetch("/api/tools/business-audit/report-status");
        if (!res.ok) return;
        const data = (await res.json()) as { status: AuditReportStatus; report: AuditReport | null };
        setReportStatus(data.status);
        if (data.report) setReport(data.report);
      } catch {
        // Keep polling; a transient network error shouldn't stop it.
      }
    }, 4000);
    return () => clearInterval(interval);
  }, [purchased, reportStatus]);

  if (!hasSubmission) {
    return (
      <div
        className="relative overflow-hidden card-accent featured"
        style={{ border: "0.8px solid #3D7FD4", backgroundColor: "#071525", borderRadius: 6, padding: "clamp(22px,3.5vw,30px)" }}
      >
        <span className="br-corner-tr" />
        <div
          className="flex-none flex items-center justify-center"
          style={{ width: 48, height: 48, backgroundColor: "#0A1832", border: "0.8px solid #3D7FD4", borderRadius: 4, marginBottom: 18 }}
        >
          <ShieldIcon size={22} style={{ color: "#89D4FF" } as React.CSSProperties} />
        </div>
        <h1 style={{ margin: 0, font: '400 clamp(21px,4vw,27px)/1.2 "Courier New", monospace', color: "#89D4FF", letterSpacing: "0.01em" }}>
          Finish the Opportunity Finder first
        </h1>
        <p style={{ margin: "11px 0 0", font: "400 21px/1.6 Arial, sans-serif", color: "#FFFFFF", maxWidth: 480 }}>
          Your Business Audit is built from your Opportunity Finder answers, so we need those
          first. It only takes a few minutes.
        </p>
        <Link
          href="/tools/opportunity-finder"
          className="inline-flex items-center gap-[9px] transition-all duration-200 hover:[box-shadow:0_0_10px_2px_rgba(61,127,212,0.45),0_0_24px_6px_rgba(137,212,255,0.25)] hover:!text-white"
          style={{
            marginTop: 22,
            padding: "12px 20px",
            borderRadius: 6,
            border: "0.8px solid #3D7FD4",
            backgroundColor: "#1A4FC4",
            color: "#EEF6FF",
            font: '400 12px "Courier New", monospace',
            letterSpacing: "0.1em",
          }}
        >
          START THE OPPORTUNITY FINDER
          <ArrowRightIcon size={16} />
        </Link>
      </div>
    );
  }

  if (!accountCompleted) {
    return (
      <div
        className="relative overflow-hidden card-accent featured"
        style={{ border: "0.8px solid #3D7FD4", backgroundColor: "#071525", borderRadius: 6, padding: "clamp(22px,3.5vw,30px)" }}
      >
        <span className="br-corner-tr" />
        <div
          className="flex-none flex items-center justify-center"
          style={{ width: 48, height: 48, backgroundColor: "#0A1832", border: "0.8px solid #3D7FD4", borderRadius: 4, marginBottom: 18 }}
        >
          <ShieldIcon size={22} style={{ color: "#89D4FF" } as React.CSSProperties} />
        </div>
        <h1 style={{ margin: 0, font: '400 clamp(21px,4vw,27px)/1.2 "Courier New", monospace', color: "#89D4FF", letterSpacing: "0.01em" }}>
          Finish creating your account first
        </h1>
        <p style={{ margin: "11px 0 0", font: "400 21px/1.6 Arial, sans-serif", color: "#FFFFFF", maxWidth: 480 }}>
          Your Opportunity Finder answers aren&apos;t saved to an account yet. Set a password to
          lock them in permanently before moving on to the Business Audit.
        </p>
        <Link
          href={`/tools/finish-signup?next=${encodeURIComponent("/tools/business-audit")}`}
          className="inline-flex items-center gap-[9px] transition-all duration-200 hover:[box-shadow:0_0_10px_2px_rgba(61,127,212,0.45),0_0_24px_6px_rgba(137,212,255,0.25)] hover:!text-white"
          style={{
            marginTop: 22,
            padding: "12px 20px",
            borderRadius: 6,
            border: "0.8px solid #3D7FD4",
            backgroundColor: "#1A4FC4",
            color: "#EEF6FF",
            font: '400 12px "Courier New", monospace',
            letterSpacing: "0.1em",
          }}
        >
          FINISH CREATING MY ACCOUNT
          <ArrowRightIcon size={16} />
        </Link>
      </div>
    );
  }

  if (purchased) {
    if (reportStatus === "ready" && report) {
      return <BusinessAuditReport report={report} />;
    }

    if (reportStatus === "failed") {
      return (
        <div
          className="relative overflow-hidden card-accent featured"
          style={{ border: "0.8px solid #3D7FD4", backgroundColor: "#071525", borderRadius: 6, padding: "clamp(22px,3.5vw,30px)" }}
        >
          <span className="br-corner-tr" />
          <div
            className="flex-none flex items-center justify-center"
            style={{ width: 48, height: 48, backgroundColor: "#0A1832", border: "0.8px solid #3D7FD4", borderRadius: 4, marginBottom: 18 }}
          >
            <ShieldIcon size={22} style={{ color: "#89D4FF" } as React.CSSProperties} />
          </div>
          <h1 style={{ margin: 0, font: '400 clamp(21px,4vw,27px)/1.2 "Courier New", monospace', color: "#89D4FF", letterSpacing: "0.01em" }}>
            Something went wrong preparing your audit
          </h1>
          <p style={{ margin: "11px 0 0", font: "400 21px/1.6 Arial, sans-serif", color: "#FFFFFF", maxWidth: 480 }}>
            Your payment went through, but we hit a snag putting the report together.{" "}
            <Link href="/contact" style={{ color: "#89D4FF", textDecoration: "underline" }}>
              Message James
            </Link>{" "}
            and he&apos;ll get it sorted directly.
          </p>
        </div>
      );
    }

    if (!reportStatus && isTestAccount) {
      return (
        <div
          className="relative overflow-hidden card-accent featured"
          style={{ border: "0.8px solid #3D7FD4", backgroundColor: "#071525", borderRadius: 6, padding: "clamp(22px,3.5vw,30px)" }}
        >
          <span className="br-corner-tr" />
          <div
            className="flex-none flex items-center justify-center"
            style={{ width: 48, height: 48, backgroundColor: "#0A1832", border: "0.8px solid #3D7FD4", borderRadius: 4, marginBottom: 18 }}
          >
            <ShieldIcon size={22} style={{ color: "#89D4FF" } as React.CSSProperties} />
          </div>
          <h1 style={{ margin: 0, font: '400 clamp(21px,4vw,27px)/1.2 "Courier New", monospace', color: "#89D4FF", letterSpacing: "0.01em" }}>
            Run your audit
          </h1>
          <p style={{ margin: "11px 0 0", font: "400 21px/1.6 Arial, sans-serif", color: "#FFFFFF", maxWidth: 480 }}>
            This account is already marked as purchased. Enter a business name and run the
            report generation again.
          </p>
          <div style={{ margin: "18px 0" }}>
            <label className="font-sans text-[16px] tracking-widest mb-2 block" style={{ color: "#FFFFFF" }}>
              BUSINESS NAME
            </label>
            <input
              type="text"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder="e.g. Desert Bloom Plumbing & Drain"
              style={{
                width: "100%",
                backgroundColor: "#143C6A",
                border: "0.8px solid rgba(255,255,255,0.4)",
                borderRadius: 2,
                padding: "9px 12px",
                height: 40,
                color: "#EEF6FF",
                font: "400 14px Arial, sans-serif",
              }}
            />
          </div>
          <button
            type="button"
            onClick={handleTestRun}
            disabled={businessName.trim().length === 0 || runningTest}
            className="transition-all duration-200 disabled:opacity-40 hover:[box-shadow:0_0_10px_2px_rgba(61,127,212,0.45),0_0_24px_6px_rgba(137,212,255,0.25)] hover:!text-white"
            style={{
              padding: "12px 20px",
              borderRadius: 6,
              border: "0.8px solid #3D7FD4",
              backgroundColor: "#1A4FC4",
              color: "#EEF6FF",
              font: '400 12px "Courier New", monospace',
              letterSpacing: "0.1em",
              cursor: runningTest ? "not-allowed" : "pointer",
            }}
          >
            {runningTest ? "STARTING…" : "RUN AUDIT — TEST ACCOUNT, NO CHARGE"}
          </button>
          {testRunError && (
            <p style={{ margin: "10px 0 0", font: "400 12px/1.5 Arial, sans-serif", color: "#E0556F" }}>
              {testRunError}
            </p>
          )}
        </div>
      );
    }

    return (
      <div
        className="relative overflow-hidden card-accent featured"
        style={{ border: "0.8px solid #3D7FD4", backgroundColor: "#071525", borderRadius: 6, padding: "clamp(22px,3.5vw,30px)" }}
      >
        <span className="br-corner-tr" />
        <div
          className="flex-none flex items-center justify-center"
          style={{ width: 48, height: 48, backgroundColor: "#0A1832", border: "0.8px solid #3D7FD4", borderRadius: 4, marginBottom: 18 }}
        >
          <SearchIcon size={22} style={{ color: "#89D4FF" } as React.CSSProperties} />
        </div>
        <h1 style={{ margin: 0, font: '400 clamp(21px,4vw,27px)/1.2 "Courier New", monospace', color: "#89D4FF", letterSpacing: "0.01em" }}>
          Your audit is being prepared
        </h1>
        <p style={{ margin: "11px 0 0", font: "400 21px/1.6 Arial, sans-serif", color: "#FFFFFF", maxWidth: 480 }}>
          Thanks for the purchase. I&apos;m putting your Business Audit together from your
          Opportunity Finder answers. This usually takes about a minute, this page will update
          automatically.
        </p>
      </div>
    );
  }

  if (justConfirmed) {
    return (
      <div
        className="relative overflow-hidden card-accent featured flex items-center gap-4"
        style={{ border: "0.8px solid #3D7FD4", backgroundColor: "#071525", borderRadius: 6, padding: "clamp(22px,3.5vw,30px)" }}
      >
        <span className="br-corner-tr" />
        <div
          className="flex-none flex items-center justify-center"
          style={{ width: 40, height: 40, backgroundColor: "#16A34A", borderRadius: "50%" }}
        >
          <CheckIcon size={18} style={{ color: "#FFFFFF" } as React.CSSProperties} />
        </div>
        <div>
          <h2 style={{ margin: 0, font: '700 clamp(17px,3vw,20px) "Courier New", monospace', color: "#EEF6FF" }}>
            Payment received: {formatWholeDollars(product.priceCents)}
          </h2>
          <p style={{ margin: "6px 0 0", font: "400 14px/1.6 Arial, sans-serif" }}>
            Thanks. Getting your audit ready now.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="relative overflow-hidden card-accent featured"
      style={{ border: "0.8px solid #3D7FD4", backgroundColor: "#071525", borderRadius: 6, padding: "clamp(22px,3.5vw,30px)" }}
    >
      <span className="br-corner-tr" />
      <h1 style={{ margin: 0, font: '400 clamp(21px,4vw,27px)/1.2 "Courier New", monospace', color: "#89D4FF", letterSpacing: "0.01em" }}>
        Get your Business Audit
      </h1>
      <p style={{ margin: "11px 0 0", font: "400 21px/1.6 Arial, sans-serif", color: "#FFFFFF", maxWidth: 480 }}>
        {product.description} One-time purchase, no subscription.
      </p>

      <div className="flex items-baseline gap-3 flex-wrap" style={{ margin: "20px 0" }}>
        <span style={{ font: '700 32px "Courier New", monospace', color: "#EEF6FF" }}>
          {formatWholeDollars(product.priceCents)}
        </span>
        <span style={{ font: '400 17px "Courier New", monospace', color: "#5B7BA5", textDecoration: "line-through" }}>
          {formatWholeDollars(product.regularPriceCents)}
        </span>
        <span
          className="inline-flex items-center gap-[7px]"
          style={{
            font: '400 10px "Courier New", monospace',
            letterSpacing: "0.12em",
            color: "#80AEE0",
            backgroundColor: "#0A1A2E",
            border: "0.8px solid #162D5A",
            padding: "4px 10px",
            borderRadius: 3,
          }}
        >
          {product.discountLabel.toUpperCase()}
        </span>
      </div>

      <div
        style={{
          margin: "0 0 18px",
          padding: "10px 14px",
          borderRadius: 4,
          border: "0.8px solid #3D7FD4",
          backgroundColor: "rgba(61,127,212,0.12)",
        }}
      >
        <p style={{ margin: 0, font: "700 19px/1.6 Arial, sans-serif", color: "#89D4FF" }}>
          This $50 founding client rate is only available through July 2026. Starting August 1,
          this audit is $300.
        </p>
      </div>

      <p style={{ margin: "0 0 12px", font: "700 19px/1.6 Arial, sans-serif", color: "#89D4FF" }}>
        As a founding client, you&apos;ll get extra perks and early offers that aren&apos;t available to standard
        clients.{" "}
        <Link href="/contact" style={{ color: "#89D4FF", textDecoration: "underline" }}>
          Message me
        </Link>{" "}
        with what you&apos;d like those to be.
      </p>

      <p style={{ margin: "0 0 22px", font: "400 17.5px/1.5 Arial, sans-serif", color: "#5B7BA5" }}>
        This fee credits in full toward any implementation you engage from your audit.
      </p>

      <div style={{ marginBottom: 18 }}>
        <label className="font-sans text-[16px] tracking-widest mb-2 block" style={{ color: "#FFFFFF" }}>
          BUSINESS NAME
        </label>
        <input
          type="text"
          value={businessName}
          onChange={(e) => setBusinessName(e.target.value)}
          placeholder="e.g. Desert Bloom Plumbing & Drain"
          style={{
            width: "100%",
            backgroundColor: "#143C6A",
            border: "0.8px solid rgba(255,255,255,0.4)",
            borderRadius: 2,
            padding: "9px 12px",
            height: 40,
            color: "#EEF6FF",
            font: "400 14px Arial, sans-serif",
          }}
        />
      </div>

      {isTestAccount ? (
        <>
          <button
            type="button"
            onClick={handleTestRun}
            disabled={businessName.trim().length === 0 || runningTest}
            className="transition-all duration-200 disabled:opacity-40 hover:[box-shadow:0_0_10px_2px_rgba(61,127,212,0.45),0_0_24px_6px_rgba(137,212,255,0.25)] hover:!text-white"
            style={{
              padding: "12px 20px",
              borderRadius: 6,
              border: "0.8px solid #3D7FD4",
              backgroundColor: "#1A4FC4",
              color: "#EEF6FF",
              font: '400 12px "Courier New", monospace',
              letterSpacing: "0.1em",
              cursor: runningTest ? "not-allowed" : "pointer",
            }}
          >
            {runningTest ? "STARTING…" : "RUN AUDIT — TEST ACCOUNT, NO CHARGE"}
          </button>
          {testRunError && (
            <p style={{ margin: "10px 0 0", font: "400 12px/1.5 Arial, sans-serif", color: "#E0556F" }}>
              {testRunError}
            </p>
          )}
        </>
      ) : (
        <PayPalCardCheckout
          product={product}
          onPaid={() => setJustConfirmed(true)}
          orderExtras={{ businessName: businessName.trim() }}
          disabled={businessName.trim().length === 0}
        />
      )}
    </div>
  );
}
