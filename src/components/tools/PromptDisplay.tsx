"use client";

import { useState } from "react";
import { CheckIcon, CopyIcon } from "./icons";

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

export default function PromptDisplay({
  firstName,
  prompt,
}: {
  firstName: string;
  prompt: string;
}) {
  const [copied, setCopied] = useState(false);
  const [copiedDestination, setCopiedDestination] = useState<string | null>(null);
  const [copyFailed, setCopyFailed] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API unavailable — user can still select and copy manually.
    }
  }

  // ChatGPT accepts the prompt as a "?q=" URL argument. Claude and Gemini have no
  // equivalent (Claude dropped it over prompt-injection concerns; Gemini never had
  // one), so those copy the prompt to the clipboard before opening the site.
  //
  // The write must be awaited and confirmed *before* opening the destination tab —
  // window.open() shifts document focus away, and Chromium browsers silently fail
  // any clipboard write that lands after focus has moved (NotAllowedError: Document
  // is not focused). Doing the write first, while this document still has focus,
  // avoids that race.
  async function handleSendTo(label: string, url: string, copyFirst: boolean) {
    if (copyFirst) {
      try {
        await navigator.clipboard.writeText(prompt);
        setCopiedDestination(label);
        setCopyFailed(false);
        setTimeout(() => setCopiedDestination(null), 2000);
      } catch {
        // Clipboard write was blocked (e.g. no active user-activation window,
        // or an unsupported browser) — surface it instead of failing silently.
        setCopyFailed(true);
        setTimeout(() => setCopyFailed(false), 4000);
      }
    }
    window.open(url, "_blank", "noopener,noreferrer");
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
        Got it, {firstName}.
      </h2>
      <p
        style={{
          margin: "11px 0 0",
          font: "400 21px/1.6 Arial, sans-serif",
          color: "#FFFFFF",
        }}
      >
        Here&apos;s a prompt built specifically for your business. Click a button below and
        we&apos;ll open Claude, ChatGPT, or Gemini with the prompt ready to go: copied to your
        clipboard or pre-filled, depending on the tool. Or copy it yourself and paste it into
        whatever AI chat tool you already prefer.
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
            className="font-sans text-[11px] tracking-widest mb-2"
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
              // Each destination's resting/copied colors are built from its own brand
              // color: Claude's asterisk orange (#D97757), ChatGPT's teal (#10A37F),
              // Gemini's violet (#8E75B2).
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
      </div>
    </div>
  );
}
