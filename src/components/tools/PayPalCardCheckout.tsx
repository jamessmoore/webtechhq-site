"use client";

import { useEffect, useRef, useState } from "react";
import type { Product } from "@/lib/products";

interface PayPalCardFieldsSession {
  createCardFieldsComponent(options: {
    type: "number" | "expiry" | "cvv";
    placeholder?: string;
    style?: Record<string, React.CSSProperties>;
  }): Node;
  submit(orderId: string): Promise<{ state: "succeeded" | "canceled" | "failed" | string }>;
}

interface PayPalEligibility {
  isEligible(method: string): boolean;
}

interface PayPalInstance {
  findEligibleMethods(): Promise<PayPalEligibility>;
  createCardFieldsOneTimePaymentSession(): PayPalCardFieldsSession;
}

interface PayPalGlobal {
  createInstance(options: { clientId: string; components: string[] }): Promise<PayPalInstance>;
}

declare global {
  interface Window {
    paypal?: PayPalGlobal;
  }
}

let sdkLoadPromise: Promise<void> | null = null;

function loadPayPalSdk(): Promise<void> {
  if (window.paypal) return Promise.resolve();
  if (sdkLoadPromise) return sdkLoadPromise;

  const baseUrl =
    process.env.NEXT_PUBLIC_PAYPAL_ENVIRONMENT === "live"
      ? "https://www.paypal.com"
      : "https://www.sandbox.paypal.com";

  sdkLoadPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = `${baseUrl}/web-sdk/v6/core`;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load the PayPal SDK."));
    document.body.appendChild(script);
  });

  return sdkLoadPromise;
}

const fieldContainerStyle: React.CSSProperties = {
  backgroundColor: "#143C6A",
  border: "0.8px solid #162D5A",
  borderRadius: 2,
  padding: "9px 12px",
  height: 40,
};

const cardFieldStyle = {
  input: {
    background: "transparent",
    border: "none",
    color: "#89D4FF",
    fontFamily: "Arial, sans-serif",
    fontSize: "14px",
    padding: "0",
  },
};

type SdkStatus = "loading" | "ready" | "ineligible" | "load_error";

export default function PayPalCardCheckout({
  product,
  onPaid,
  orderExtras,
  disabled,
}: {
  product: Product;
  onPaid: (amountCents: number) => void;
  orderExtras?: Record<string, unknown>;
  disabled?: boolean;
}) {
  const [sdkStatus, setSdkStatus] = useState<SdkStatus>("loading");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const numberRef = useRef<HTMLDivElement>(null);
  const expiryRef = useRef<HTMLDivElement>(null);
  const cvvRef = useRef<HTMLDivElement>(null);
  const sessionRef = useRef<PayPalCardFieldsSession | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function setup() {
      const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
      if (!clientId) {
        if (!cancelled) setSdkStatus("load_error");
        return;
      }

      try {
        await loadPayPalSdk();
        if (cancelled || !window.paypal) return;

        const sdk = await window.paypal.createInstance({ clientId, components: ["card-fields"] });
        const eligibility = await sdk.findEligibleMethods();
        if (cancelled) return;
        if (!eligibility.isEligible("advanced_cards")) {
          setSdkStatus("ineligible");
          return;
        }

        const cardSession = sdk.createCardFieldsOneTimePaymentSession();
        sessionRef.current = cardSession;

        if (numberRef.current && expiryRef.current && cvvRef.current) {
          const numberField = cardSession.createCardFieldsComponent({
            type: "number",
            placeholder: "Card number",
            style: cardFieldStyle,
          });
          const expiryField = cardSession.createCardFieldsComponent({
            type: "expiry",
            placeholder: "MM/YY",
            style: cardFieldStyle,
          });
          const cvvField = cardSession.createCardFieldsComponent({
            type: "cvv",
            placeholder: "CVV",
            style: cardFieldStyle,
          });
          numberRef.current.replaceChildren(numberField);
          expiryRef.current.replaceChildren(expiryField);
          cvvRef.current.replaceChildren(cvvField);
        }

        if (!cancelled) setSdkStatus("ready");
      } catch {
        if (!cancelled) setSdkStatus("load_error");
      }
    }

    setup();
    return () => {
      cancelled = true;
    };
  }, []);

  async function handlePay() {
    if (!sessionRef.current || submitting || disabled) return;
    setSubmitting(true);
    setSubmitError(null);

    try {
      const createRes = await fetch("/api/payments/paypal/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product.id, ...orderExtras }),
      });
      const createData = (await createRes.json()) as { orderId?: string; error?: string };
      if (!createRes.ok || !createData.orderId) {
        setSubmitError(createData.error ?? "Could not start checkout. Please try again.");
        setSubmitting(false);
        return;
      }

      const { state } = await sessionRef.current.submit(createData.orderId);

      if (state === "canceled") {
        setSubmitting(false);
        return;
      }
      if (state !== "succeeded") {
        setSubmitError("Your card could not be charged. Please check your details and try again.");
        setSubmitting(false);
        return;
      }

      const captureRes = await fetch("/api/payments/paypal/capture-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: createData.orderId }),
      });
      const captureData = (await captureRes.json()) as {
        success?: boolean;
        amountCents?: number;
        error?: string;
      };
      if (!captureRes.ok || !captureData.success) {
        setSubmitError(captureData.error ?? "Payment was not completed. Please try again.");
        setSubmitting(false);
        return;
      }

      onPaid(captureData.amountCents ?? product.priceCents);
    } catch {
      setSubmitError("Something went wrong. Please try again.");
      setSubmitting(false);
    }
  }

  if (sdkStatus === "load_error") {
    return (
      <p style={{ margin: 0, font: "400 13.5px/1.6 Arial, sans-serif", color: "#F87171" }}>
        Card payment isn&apos;t available right now. Please message James and he&apos;ll get you set up
        directly.
      </p>
    );
  }

  if (sdkStatus === "ineligible") {
    return (
      <p style={{ margin: 0, font: "400 13.5px/1.6 Arial, sans-serif", color: "#80AEE0" }}>
        Card payment isn&apos;t available on this account yet. Please message James and he&apos;ll get you
        set up directly.
      </p>
    );
  }

  return (
    <div>
      <div className="grid gap-3" style={{ gridTemplateColumns: "1fr 100px 80px" }}>
        <div>
          <div style={{ marginBottom: 6, font: '400 11px "Courier New", monospace', letterSpacing: "0.1em", color: "#5B7BA5" }}>
            CARD NUMBER
          </div>
          <div ref={numberRef} style={fieldContainerStyle} />
        </div>
        <div>
          <div style={{ marginBottom: 6, font: '400 11px "Courier New", monospace', letterSpacing: "0.1em", color: "#5B7BA5" }}>
            EXPIRY
          </div>
          <div ref={expiryRef} style={fieldContainerStyle} />
        </div>
        <div>
          <div style={{ marginBottom: 6, font: '400 11px "Courier New", monospace', letterSpacing: "0.1em", color: "#5B7BA5" }}>
            CVV
          </div>
          <div ref={cvvRef} style={fieldContainerStyle} />
        </div>
      </div>

      {submitError && (
        <p style={{ margin: "14px 0 0", font: "400 13px/1.5 Arial, sans-serif", color: "#F87171" }}>
          {submitError}
        </p>
      )}

      <button
        type="button"
        onClick={handlePay}
        disabled={sdkStatus !== "ready" || submitting || disabled}
        className="transition-all duration-200 hover:[box-shadow:0_0_10px_2px_rgba(61,127,212,0.45),0_0_24px_6px_rgba(137,212,255,0.25)] disabled:opacity-60 disabled:pointer-events-none"
        style={{
          marginTop: 20,
          padding: "12px 22px",
          borderRadius: 6,
          border: "0.8px solid #3D7FD4",
          backgroundColor: "#1A4FC4",
          color: "#EEF6FF",
          font: '400 12.5px "Courier New", monospace',
          letterSpacing: "0.1em",
          cursor: "pointer",
        }}
      >
        {submitting ? "PROCESSING…" : `PAY $${(product.priceCents / 100).toFixed(0)} SECURELY`}
      </button>
    </div>
  );
}
