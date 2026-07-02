"use client";

import { useState } from "react";
import { CheckIcon, CopyIcon } from "./icons";

export default function PromptDisplay({
  firstName,
  prompt,
}: {
  firstName: string;
  prompt: string;
}) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API unavailable — user can still select and copy manually.
    }
  }

  return (
    <div>
      <h2
        style={{
          margin: 0,
          font: '400 clamp(21px,4vw,27px)/1.2 "Courier New", monospace',
          color: "var(--brand-blue)",
          letterSpacing: "0.01em",
        }}
      >
        Got it, {firstName}.
      </h2>
      <p
        style={{
          margin: "11px 0 0",
          font: "400 clamp(14px,2.4vw,15.5px)/1.6 Arial, sans-serif",
          color: "var(--brand-white)",
        }}
      >
        Here&apos;s a prompt built specifically for your business. Copy it and paste it into the
        AI chat tool of your choice — ChatGPT, Claude, Gemini, whatever you already use — to
        start exploring where AI could help.
      </p>

      <div style={{ marginTop: 28 }}>
        <textarea
          readOnly
          value={prompt}
          rows={16}
          onFocus={(e) => e.currentTarget.select()}
          className="w-full px-3 py-3 font-sans text-[13px] leading-relaxed focus:outline-none resize-y"
          style={{
            backgroundColor: "#071525",
            border: "0.8px solid #162D5A",
            color: "#EEF6FF",
            borderRadius: "2px",
            fontFamily: '"Courier New", monospace',
          }}
        />

        <div style={{ marginTop: 16 }}>
          <p
            className="font-sans text-[11px] tracking-widest mb-2"
            style={{ color: "var(--brand-white)" }}
          >
            SEND TO:
          </p>
          <div className="flex flex-wrap gap-2">
            {[
              { label: "Claude", href: "https://claude.ai" },
              { label: "ChatGPT", href: "https://chatgpt.com" },
              { label: "Gemini", href: "https://gemini.google.com" },
            ].map(({ label, href }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="font-sans text-[12px] tracking-wide transition-all duration-200 hover:[box-shadow:0_0_10px_2px_rgba(61,127,212,0.45),0_0_24px_6px_rgba(137,212,255,0.25)] hover:!text-white"
                style={{
                  padding: "10px 18px",
                  borderRadius: 6,
                  border: "0.8px solid #162D5A",
                  backgroundColor: "#143C6A",
                  color: "#80AEE0",
                  textDecoration: "none",
                }}
              >
                {label} ›
              </a>
            ))}
          </div>
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
              color: copied ? "#BCE5FF" : "#80AEE0",
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

      <p
        className="font-sans text-[12px] mt-6 leading-relaxed"
        style={{ color: "#3D7FD4" }}
      >
        When you&apos;re ready to move from ideas to an actual plan, that&apos;s exactly what a
        scoping conversation with James is for.
      </p>
    </div>
  );
}
