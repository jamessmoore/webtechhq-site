"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function TestAccountResetButton() {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleReset() {
    setResetting(true);
    setError(null);
    try {
      const res = await fetch("/api/tools/test-reset", { method: "POST" });
      if (!res.ok) {
        const d = (await res.json()) as { error?: string };
        setError(d.error ?? "Something went wrong.");
        setResetting(false);
        return;
      }
      setConfirming(false);
      setResetting(false);
      router.refresh();
    } catch {
      setError("Network error.");
      setResetting(false);
    }
  }

  return (
    <div
      className="flex flex-wrap items-center gap-2"
      style={{
        marginBottom: 24,
        padding: "10px 14px",
        border: "0.8px solid #3D7FD4",
        backgroundColor: "#0A1832",
        borderRadius: 4,
      }}
    >
      <span
        className="font-sans text-[11px] tracking-widest"
        style={{ color: "#89D4FF", marginRight: 4 }}
      >
        TEST ACCOUNT
      </span>
      {!confirming ? (
        <button
          type="button"
          onClick={() => setConfirming(true)}
          className="font-sans font-bold text-[12px] tracking-widest px-4 py-1.5 transition-all duration-200 hover:[box-shadow:0_0_10px_2px_rgba(61,127,212,0.45),0_0_24px_6px_rgba(137,212,255,0.25)] hover:!text-white"
          style={{
            backgroundColor: "transparent",
            border: "0.8px solid #162D5A",
            color: "#80AEE0",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          RESET ALL TOOL DATA
        </button>
      ) : (
        <>
          <span className="font-sans text-[12px]" style={{ color: "#E0556F" }}>
            Clear every tool&apos;s output for this account and start over?
          </span>
          <button
            type="button"
            disabled={resetting}
            onClick={handleReset}
            className="font-sans font-bold text-[12px] tracking-widest px-4 py-1.5 transition-all duration-200 disabled:opacity-40 hover:[box-shadow:0_0_10px_2px_rgba(61,127,212,0.45),0_0_24px_6px_rgba(137,212,255,0.25)] hover:!text-white"
            style={{
              backgroundColor: "#5c1a1a",
              border: "1px solid #c0392b",
              color: "#FFFFFF",
              borderRadius: "4px",
              cursor: resetting ? "not-allowed" : "pointer",
            }}
          >
            {resetting ? "RESETTING…" : "CONFIRM RESET"}
          </button>
          <button
            type="button"
            disabled={resetting}
            onClick={() => setConfirming(false)}
            className="font-sans text-[12px] tracking-widest px-4 py-1.5 transition-all duration-200 disabled:opacity-40 hover:[box-shadow:0_0_10px_2px_rgba(61,127,212,0.45),0_0_24px_6px_rgba(137,212,255,0.25)] hover:!text-white"
            style={{
              backgroundColor: "transparent",
              border: "0.8px solid #162D5A",
              color: "#80AEE0",
              borderRadius: "4px",
              cursor: resetting ? "not-allowed" : "pointer",
            }}
          >
            CANCEL
          </button>
        </>
      )}
      {error && (
        <p className="font-sans text-[11px]" style={{ color: "#E0556F", width: "100%", margin: "4px 0 0" }}>
          {error}
        </p>
      )}
    </div>
  );
}
