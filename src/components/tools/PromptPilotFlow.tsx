"use client";

import { useRef, useState } from "react";
import ReCAPTCHA from "react-google-recaptcha";
import PromptPilotDisplay from "./PromptPilotDisplay";
import type { PromptPilotStartingPoint, PromptPilotWhy, PromptPilotTimeBudget } from "@/lib/types";

const STARTING_POINTS: PromptPilotStartingPoint[] = [
  "Never used AI",
  "Dabbled with it",
  "Used it, want to go deeper",
];

const WHY_OPTIONS: PromptPilotWhy[] = [
  "Personal curiosity",
  "Career or job search",
  "I run a business",
];

const TIME_BUDGETS: PromptPilotTimeBudget[] = ["Quick primer", "Go deep"];

// ── Shared field styles (matching Questionnaire.tsx / ContactForm) ────────────

const fieldStyle: React.CSSProperties = {
  backgroundColor: "#143C6A",
  border: "0.8px solid rgba(255,255,255,0.4)",
  color: "#EEF6FF",
  borderRadius: "2px",
};

const labelStyle: React.CSSProperties = {
  color: "#FFFFFF",
};

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="font-sans text-[16px] tracking-widest mb-2 block" style={labelStyle}>
      {children}
    </label>
  );
}

function TextArea({
  value,
  onChange,
  placeholder,
  rows = 4,
  autoFocus,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
  autoFocus?: boolean;
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      autoFocus={autoFocus}
      className="w-full px-3 py-2 font-sans text-[14px] leading-relaxed focus:outline-none resize-none"
      style={fieldStyle}
    />
  );
}

function ButtonGroup<T extends string>({
  options,
  value,
  onChange,
}: {
  options: T[];
  value: T | "";
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2 mt-1">
      {options.map((opt) => {
        const active = value === opt;
        return (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt)}
            className="font-sans text-[13px] tracking-wide px-4 py-2 transition-colors duration-150"
            style={{
              backgroundColor: active ? "#1A4FC4" : "#143C6A",
              border: `0.8px solid ${active ? "#3D7FD4" : "#162D5A"}`,
              borderRadius: "2px",
              color: active ? "#BCE5FF" : "#80AEE0",
              cursor: "pointer",
            }}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}

function StatusCard({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="p-6"
      style={{ backgroundColor: "#071525", border: "0.8px solid #162D5A", borderRadius: "2px" }}
    >
      {children}
    </div>
  );
}

interface FormData {
  learningGoal: string;
  startingPoint: PromptPilotStartingPoint | "";
  why: PromptPilotWhy | "";
  timeBudget: PromptPilotTimeBudget | "";
}

const INITIAL_FORM: FormData = {
  learningGoal: "",
  startingPoint: "",
  why: "",
  timeBudget: "",
};

export default function PromptPilotFlow({
  firstName,
  email,
  emailVerified,
  alreadySubmitted,
  initialPrompt,
  initialWhy,
  accountCompleted,
}: {
  firstName: string;
  email: string;
  emailVerified: boolean;
  alreadySubmitted: boolean;
  /** The stored prompt from a prior submission, if any. */
  initialPrompt: string | null;
  /** The stored "why" answer from a prior submission, drives the business nudge. */
  initialWhy: PromptPilotWhy | null;
  accountCompleted: boolean;
}) {
  const [form, setForm] = useState<FormData>(INITIAL_FORM);
  const [prompt, setPrompt] = useState<string | null>(initialPrompt);
  const [why, setWhy] = useState<PromptPilotWhy | null>(initialWhy);
  // Tracks "a submission now exists" separately from `prompt` so that if
  // rendering somehow produces no prompt (e.g. no templates seeded yet),
  // the form falls back to its own "already submitted" state instead of
  // showing the intake form again.
  const [submitted, setSubmitted] = useState(alreadySubmitted);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState("");
  const recaptchaRef = useRef<ReCAPTCHA | null>(null);

  function set<K extends keyof FormData>(key: K, value: FormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setError(null);
  }

  const recaptchaConfigured = !!process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
  const canSubmit =
    !!form.learningGoal.trim() &&
    !!form.startingPoint &&
    !!form.why &&
    !!form.timeBudget &&
    (!recaptchaConfigured || !!recaptchaToken);

  async function submit() {
    if (!form.learningGoal.trim()) {
      setError("Please tell us what you want to learn about AI.");
      return;
    }
    if (!form.startingPoint || !form.why || !form.timeBudget) {
      setError("Please answer all four questions so I can tailor your prompt.");
      return;
    }
    if (recaptchaConfigured && !recaptchaToken) {
      setError("Please complete the reCAPTCHA check before submitting.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/prompt-pilot/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          learningGoal: form.learningGoal.trim(),
          startingPoint: form.startingPoint,
          why: form.why,
          timeBudget: form.timeBudget,
          recaptchaToken,
        }),
      });

      const data = (await res.json()) as {
        success?: boolean;
        error?: string;
        renderedPrompt?: string | null;
        why?: PromptPilotWhy | null;
      };
      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        recaptchaRef.current?.reset();
        setRecaptchaToken("");
        return;
      }
      setSubmitted(true);
      setPrompt(data.renderedPrompt ?? null);
      setWhy(data.why ?? null);
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  if (prompt) {
    return (
      <PromptPilotDisplay
        firstName={firstName}
        prompt={prompt}
        why={why}
        accountCompleted={accountCompleted}
      />
    );
  }

  if (submitted) {
    return (
      <StatusCard>
        <h2 className="font-sans font-bold text-[20px] mb-3" style={{ color: "#89D4FF" }}>
          You&apos;re already set, {firstName}.
        </h2>
        <p className="font-sans text-[21px] leading-relaxed" style={{ color: "#FFFFFF" }}>
          We already have a Prompt Pilot result on file for{" "}
          <span style={{ color: "#89D4FF" }}>{email}</span>.
        </p>
      </StatusCard>
    );
  }

  if (!emailVerified) {
    return (
      <StatusCard>
        <h2 className="font-sans font-bold text-[20px] mb-3" style={{ color: "#89D4FF" }}>
          Verify your email first
        </h2>
        <p className="font-sans text-[21px] leading-relaxed" style={{ color: "#FFFFFF" }}>
          Check your inbox at <span style={{ color: "#89D4FF" }}>{email}</span> for a
          verification link. Once confirmed you can get started.
        </p>
      </StatusCard>
    );
  }

  return (
    <>
      <h1
        style={{
          margin: 0,
          font: '400 clamp(21px,4vw,27px)/1.2 "Courier New", monospace',
          color: "#89D4FF",
          letterSpacing: "0.01em",
        }}
      >
        Let&apos;s have AI teach you AI
      </h1>
      <p
        style={{
          margin: "11px 0 0",
          font: "400 21px/1.6 Arial, sans-serif",
          color: "#FFFFFF",
        }}
      >
        Answer four quick questions and I&apos;ll build you a prompt tuned to where you&apos;re
        starting from and how deep you want to go. Run it in Claude, ChatGPT, or Gemini and let
        it walk you through the rest.
      </p>

      <div className="flex flex-col gap-[18px]" style={{ marginTop: 32 }}>
        <div>
          <FieldLabel>WHAT DO YOU WANT TO LEARN ABOUT AI?</FieldLabel>
          <TextArea
            value={form.learningGoal}
            onChange={(v) => set("learningGoal", v)}
            placeholder="e.g. how to use AI in my daily work, how these tools actually work under the hood, how to build something with it…"
            autoFocus
          />
        </div>

        <div>
          <FieldLabel>WHERE ARE YOU STARTING FROM?</FieldLabel>
          <ButtonGroup
            options={STARTING_POINTS}
            value={form.startingPoint}
            onChange={(v) => set("startingPoint", v)}
          />
        </div>

        <div>
          <FieldLabel>WHY ARE YOU LEARNING IT?</FieldLabel>
          <ButtonGroup options={WHY_OPTIONS} value={form.why} onChange={(v) => set("why", v)} />
        </div>

        <div>
          <FieldLabel>HOW MUCH TIME DO YOU WANT TO SPEND?</FieldLabel>
          <ButtonGroup
            options={TIME_BUDGETS}
            value={form.timeBudget}
            onChange={(v) => set("timeBudget", v)}
          />
        </div>

        <div>
          {recaptchaConfigured ? (
            <ReCAPTCHA
              ref={recaptchaRef}
              sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!}
              onChange={(value) => setRecaptchaToken(value ?? "")}
              onExpired={() => setRecaptchaToken("")}
              theme="dark"
            />
          ) : (
            <p className="font-sans text-[9px] tracking-widest" style={{ color: "#E0556F" }}>
              reCAPTCHA not configured: set NEXT_PUBLIC_RECAPTCHA_SITE_KEY
            </p>
          )}
        </div>

        {error && (
          <p className="font-sans text-[11px] leading-relaxed" style={{ color: "#E0556F" }}>
            {error}
          </p>
        )}

        <div className="flex justify-end pt-2" style={{ borderTop: "0.8px solid #162D5A" }}>
          <button
            type="button"
            onClick={submit}
            disabled={loading || !canSubmit}
            className="font-sans font-bold text-[16px] tracking-widest px-7 py-3 mt-5 transition-all duration-200 disabled:opacity-50 hover:[box-shadow:0_0_10px_2px_rgba(61,127,212,0.45),0_0_24px_6px_rgba(137,212,255,0.25)] hover:!text-white"
            style={{
              backgroundColor: "#238636",
              border: "1px solid #238636",
              color: "#FFFFFF",
              borderRadius: "6px",
              cursor: loading || !canSubmit ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "BUILDING YOUR PROMPT…" : "BUILD MY PROMPT ›"}
          </button>
        </div>
      </div>
    </>
  );
}
