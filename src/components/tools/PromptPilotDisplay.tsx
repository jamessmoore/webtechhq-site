"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckIcon, CopyIcon } from "./icons";
import SignUpForm from "@/components/SignUpForm";
import type { PromptPilotWhy } from "@/lib/types";

const BRAND_COLORS: Record<
  string,
  { brand: string; restingBg: string; copiedBorder: string; copiedText: string }
> = {
  Claude: {
    brand: "#D97757",
    restingBg: "#7B574B",
    copiedBorder: "#E8916F",
    copiedText: "#FFE8DC",
  },
  ChatGPT: {
    brand: "#10A37F",
    restingBg: "#3F6459",
    copiedBorder: "#4FCBA8",
    copiedText: "#DFFFF3",
  },
  Gemini: {
    brand: "#8E75B2",
    restingBg: "#5D5669",
    copiedBorder: "#B79EDD",
    copiedText: "#F2EAFB",
  },
};

export default function PromptPilotDisplay({
  firstName,
  prompt,
  why,
  accountCompleted,
  anonymous = false,
  onReset,
}: {
  /** Unset for an anonymous (no-session) visitor - the heading below adapts. */
  firstName?: string;
  prompt: string;
  /** Drives the soft Opportunity Finder nudge below the prompt — only shown for "I run a business". */
  why?: PromptPilotWhy | null;
  accountCompleted: boolean;
  /** No session yet - shows a "save this result" capture step instead of "finish account setup". */
  anonymous?: boolean;
  /** Clears the completed result/form state back to the start of the Prompt Pilot flow. */
  onReset: () => void;
}) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [copiedDestination, setCopiedDestination] = useState<string | null>(null);
  const [copyFailed, setCopyFailed] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API unavailable — user can still select and copy manually.
    }
  }

  // Same Send-To-AI mechanic as PromptDisplay.tsx: ChatGPT accepts the prompt
  // as a "?q=" URL argument, Claude and Gemini don't, so those copy first.
  // The write must be awaited and confirmed before opening the destination
  // tab — window.open() shifts focus away, and Chromium silently fails any
  // clipboard write that lands after focus has moved.
  async function handleSendTo(label: string, url: string, copyFirst: boolean) {
    if (copyFirst) {
      try {
        await navigator.clipboard.writeText(prompt);
        setCopiedDestination(label);
        setCopyFailed(false);
        setTimeout(() => setCopiedDestination(null), 2000);
      } catch {
        setCopyFailed(true);
        setTimeout(() => setCopyFailed(false), 4000);
      }
    }
    window.open(url, "_blank", "noopener,noreferrer");
  }

  // Deletes the stored submission server-side first (so a reload afterward
  // doesn't bring the old result back via initialPrompt/alreadySubmitted),
  // then hands off to the parent's onReset to clear the local prompt/form
  // state - only on success. A failed request leaves the result screen and
  // client state exactly as they were, with an inline error, rather than
  // clearing local state while a stale row is still on file server-side.
  async function handleReset() {
    setResetting(true);
    setResetError(null);
    try {
      const res = await fetch("/api/prompt-pilot/reset", { method: "POST" });
      if (!res.ok) {
        setResetError("Couldn't reset your result. Please try again.");
        setResetting(false);
        return;
      }
      onReset();
    } catch {
      setResetError("Network error. Please check your connection and try again.");
      setResetting(false);
    }
  }

  return (
    <div>
      <h2
        style={{
          margin: 0,
          font: '400 clamp(26px,4vw,32px)/1.2 "Courier New", monospace',
          color: "#89D4FF",
          letterSpacing: "0.01em",
        }}
      >
        Got it{firstName ? `, ${firstName}` : ""}.
      </h2>
      <p
        style={{
          margin: "11px 0 0",
          font: "400 19px/1.6 Arial, sans-serif",
          color: "#FFFFFF",
        }}
      >
        Here&apos;s a prompt built to have AI teach you AI, tuned to where you&apos;re starting
        from and how deep you want to go. Click a button below and I&apos;ll open Claude,
        ChatGPT, or Gemini with it ready to go: copied to your clipboard or pre-filled,
        depending on the tool. Or copy it yourself and paste it into whatever AI chat tool you
        already prefer.
      </p>

      <div style={{ marginTop: 28 }}>
        <textarea
          readOnly
          value={prompt}
          rows={8}
          onFocus={(e) => e.currentTarget.select()}
          className="w-full px-3 py-3 font-sans text-[13px] leading-relaxed focus:outline-none resize-y"
          style={{
            backgroundColor: "#071525",
            border: "0.8px solid rgba(255,255,255,0.4)",
            color: "var(--brand-sky)",
            borderRadius: "2px",
            fontFamily: '"Courier New", monospace',
          }}
        />

        <div style={{ marginTop: 16 }}>
          <p
            className="font-sans text-[13px] tracking-widest mb-2"
            style={{ color: "var(--brand-white)" }}
          >
            COPY TO CLIPBOARD AND OPEN:
          </p>
          <div className="flex flex-wrap gap-2">
            {[
              { label: "Claude", url: "https://claude.ai/new", copyFirst: true },
              {
                label: "ChatGPT",
                url: `https://chatgpt.com/?q=${encodeURIComponent(prompt)}`,
                copyFirst: false,
              },
              { label: "Gemini", url: "https://gemini.google.com/app", copyFirst: true },
            ].map(({ label, url, copyFirst }) => {
              const isCopied = copiedDestination === label;
              const palette = BRAND_COLORS[label];
              const border = isCopied ? palette.copiedBorder : palette.restingBg;
              const background = isCopied ? palette.brand : palette.restingBg;
              const color = isCopied ? palette.copiedText : "#FFFFFF";
              return (
                <button
                  key={label}
                  type="button"
                  onClick={() => handleSendTo(label, url, copyFirst)}
                  className="inline-flex items-center gap-2 font-sans text-[15px] tracking-wide transition-all duration-200 hover:[box-shadow:0_0_10px_2px_rgba(255,255,255,0.45),0_0_24px_6px_rgba(255,255,255,0.25)] hover:!text-white"
                  style={{
                    padding: "10px 18px",
                    borderRadius: 6,
                    border: `0.8px solid ${border}`,
                    backgroundColor: background,
                    color: color,
                    cursor: "pointer",
                  }}
                >
                  {isCopied ? (
                    <>
                      <CheckIcon size={13} />
                      COPIED, PASTE IN {label.toUpperCase()}
                    </>
                  ) : (
                    <>{label} ›</>
                  )}
                </button>
              );
            })}
          </div>
          {copyFailed && (
            <p
              className="font-sans text-[11px] mt-2"
              style={{ color: "#E8634A" }}
            >
              Couldn&apos;t copy automatically. Use Copy to Clipboard below, then paste it in
              manually.
            </p>
          )}
        </div>

        <div className="flex justify-end mt-4">
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-2 transition-all duration-200 hover:[box-shadow:0_0_10px_2px_rgba(61,127,212,0.45),0_0_24px_6px_rgba(137,212,255,0.25)] hover:!text-white"
            style={{
              padding: "10px 18px",
              borderRadius: 6,
              border: `0.8px solid ${copied ? "#3D7FD4" : "#162D5A"}`,
              backgroundColor: copied ? "#1A4FC4" : "#143C6A",
              color: copied ? "#BCE5FF" : "var(--brand-sky)",
              font: '400 12px "Courier New", monospace',
              letterSpacing: "0.08em",
              cursor: "pointer",
            }}
          >
            {copied ? (
              <>
                <CheckIcon size={14} />
                COPIED
              </>
            ) : (
              <>
                <CopyIcon size={14} />
                COPY TO CLIPBOARD
              </>
            )}
          </button>
        </div>

        <div className="flex flex-col items-end mt-4">
          <button
            type="button"
            onClick={handleReset}
            disabled={resetting}
            className="inline-flex items-center gap-2 transition-all duration-200 disabled:opacity-50 hover:[box-shadow:0_0_10px_2px_rgba(61,127,212,0.45),0_0_24px_6px_rgba(137,212,255,0.25)] hover:!text-white"
            style={{
              padding: "10px 18px",
              borderRadius: 6,
              border: "0.8px solid #162D5A",
              backgroundColor: "#143C6A",
              color: "var(--brand-sky)",
              font: '400 12px "Courier New", monospace',
              letterSpacing: "0.08em",
              cursor: resetting ? "not-allowed" : "pointer",
            }}
          >
            {resetting ? "RESETTING…" : "RESET"}
          </button>
          {resetError && (
            <p className="font-sans text-[11px] mt-2" style={{ color: "#E8634A" }}>
              {resetError}
            </p>
          )}
        </div>

        {anonymous ? (
          <div
            style={{
              marginTop: 28,
              padding: "18px 20px",
              border: "0.8px solid rgba(255,255,255,0.4)",
              borderRadius: 4,
              backgroundColor: "#0A1B33",
            }}
          >
            <p className="font-sans font-bold text-[30px] leading-relaxed mb-2" style={{ color: "#FFFFFF" }}>
              Want to keep this result?
            </p>
            <p className="font-sans text-[15px] leading-relaxed mb-4" style={{ color: "#FFFFFF" }}>
              Save it to an account, and you won&apos;t need to redo Prompt Pilot next time.
            </p>
            <SignUpForm
              endpoint="/api/tools/claim-submission"
              extraBody={{ tool: "prompt-pilot" }}
              hideGoogle
              submitLabel="SAVE MY RESULT ›"
              submitLoadingLabel="SAVING…"
              verifyBody="Click it to save this result to your account."
            />
          </div>
        ) : (
          !accountCompleted && (
            <div
              style={{
                marginTop: 28,
                padding: "18px 20px",
                border: "0.8px solid rgba(255,255,255,0.4)",
                borderRadius: 4,
                backgroundColor: "#0A1B33",
              }}
            >
              <p className="font-sans text-[15px] leading-relaxed" style={{ color: "#FFFFFF" }}>
                To save it permanently, finish setting up your account with a password. Skip it and
                you&apos;ll need to redo Prompt Pilot next time.
              </p>
              <div className="flex flex-wrap gap-3 mt-4">
                <button
                  type="button"
                  onClick={() =>
                    router.push(
                      `/tools/finish-signup?next=${encodeURIComponent("/tools/prompt-pilot")}`,
                    )
                  }
                  className="inline-flex items-center gap-2 font-sans text-[15px] font-bold tracking-wide transition-all duration-200 hover:[box-shadow:0_0_10px_2px_rgba(61,127,212,0.45),0_0_24px_6px_rgba(137,212,255,0.25)] hover:!text-white"
                  style={{
                    padding: "10px 18px",
                    borderRadius: 6,
                    border: "1px solid #238636",
                    backgroundColor: "#238636",
                    color: "#FFFFFF",
                    cursor: "pointer",
                  }}
                >
                  Complete account signup ›
                </button>
              </div>
            </div>
          )
        )}

        {why === "I run a business" && (
          <div
            style={{
              marginTop: 20,
              padding: "18px 20px",
              border: "0.8px solid rgba(255,255,255,0.4)",
              borderRadius: 4,
              backgroundColor: "#0A1B33",
            }}
          >
            <p
              className="font-sans text-[21px] font-bold"
              style={{ color: "#FFFFFF", marginBottom: 8 }}
            >
              Since you run a business…
            </p>
            <p className="font-sans text-[20px] leading-relaxed" style={{ color: "#FFFFFF" }}>
              There&apos;s a free tool built specifically to find AI opportunities in your
              business, not just to teach you AI in general. Answer a few plain-English
              questions and get a custom prompt pointing at the moves that would save you the
              most time and money.
            </p>
            <div className="flex flex-wrap gap-3 mt-4">
              <button
                type="button"
                onClick={() => router.push("/tools/opportunity-finder")}
                className="inline-flex items-center gap-2 font-sans text-[15px] font-bold tracking-wide transition-all duration-200 hover:[box-shadow:0_0_10px_2px_rgba(61,127,212,0.45),0_0_24px_6px_rgba(137,212,255,0.25)] hover:!text-white"
                style={{
                  padding: "10px 18px",
                  borderRadius: 6,
                  border: "1px solid #1A4FC4",
                  backgroundColor: "#1A4FC4",
                  color: "#FFFFFF",
                  cursor: "pointer",
                }}
              >
                Try the Opportunity Finder ›
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
