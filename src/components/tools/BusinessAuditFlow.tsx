"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import PayPalCardCheckout from "./PayPalCardCheckout";
import { ShieldIcon, CheckIcon, ArrowRightIcon } from "./icons";
import type { Product } from "@/lib/products";

function formatWholeDollars(cents: number): string {
  return `$${(cents / 100).toFixed(0)}`;
}

export default function BusinessAuditFlow({
  product,
  hasSubmission,
  alreadyPurchased,
}: {
  product: Product;
  hasSubmission: boolean;
  alreadyPurchased: boolean;
}) {
  const [justConfirmed, setJustConfirmed] = useState(false);
  const [purchased, setPurchased] = useState(alreadyPurchased);

  useEffect(() => {
    if (!justConfirmed) return;
    const timer = setTimeout(() => setPurchased(true), 2200);
    return () => clearTimeout(timer);
  }, [justConfirmed]);

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
        <h1 style={{ margin: 0, font: '400 clamp(21px,4vw,27px)/1.2 "Courier New", monospace', color: "#EEF6FF", letterSpacing: "0.01em" }}>
          Finish the Opportunity Finder first
        </h1>
        <p style={{ margin: "11px 0 0", font: "400 14px/1.6 Arial, sans-serif", maxWidth: 480 }}>
          Your Business Audit is built from your Opportunity Finder answers, so we need those
          first. It only takes a few minutes.
        </p>
        <Link
          href="/tools/ai-opportunity-finder"
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
          START THE QUESTIONNAIRE
          <ArrowRightIcon size={16} />
        </Link>
      </div>
    );
  }

  if (purchased) {
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
        <h1 style={{ margin: 0, font: '400 clamp(21px,4vw,27px)/1.2 "Courier New", monospace', color: "#EEF6FF", letterSpacing: "0.01em" }}>
          Your audit is being prepared
        </h1>
        <p style={{ margin: "11px 0 0", font: "400 14px/1.6 Arial, sans-serif", maxWidth: 480 }}>
          Thanks for the purchase. James is putting your Business Audit together from your
          Opportunity Finder answers and will email it to you as soon as it&apos;s ready.
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
      <h1 style={{ margin: 0, font: '400 clamp(21px,4vw,27px)/1.2 "Courier New", monospace', color: "#EEF6FF", letterSpacing: "0.01em" }}>
        Get your Business Audit
      </h1>
      <p style={{ margin: "11px 0 0", font: "400 14px/1.6 Arial, sans-serif", maxWidth: 480 }}>
        {product.description} One-time purchase, no subscription.
      </p>

      <div className="flex items-baseline gap-3 flex-wrap" style={{ margin: "20px 0" }}>
        <span style={{ font: '700 32px "Courier New", monospace', color: "#EEF6FF" }}>
          {formatWholeDollars(product.priceCents)}
        </span>
        <span style={{ font: '400 16px "Courier New", monospace', color: "#5B7BA5", textDecoration: "line-through" }}>
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

      <p style={{ margin: "0 0 22px", font: "400 12.5px/1.5 Arial, sans-serif", color: "#5B7BA5" }}>
        This fee credits in full toward any implementation you engage from your audit.
      </p>

      <PayPalCardCheckout product={product} onPaid={() => setJustConfirmed(true)} />
    </div>
  );
}
