"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ReCAPTCHA from "react-google-recaptcha";
import type {
  TeamSize,
  RepetitiveAnswer,
  ComplianceAnswer,
  DataAnswer,
} from "@/lib/types";

interface FormData {
  businessType: string;
  teamSize: TeamSize | "";
  layer1Problem: string;
  layer1Elimination: string;
  layer2Hours: string;
  layer2Salary: string;
  layer3Repetitive: RepetitiveAnswer | "";
  layer3Compliance: ComplianceAnswer | "";
  layer3ComplianceDetail: string;
  layer3Data: DataAnswer | "";
  additionalNotes: string;
}

const INITIAL_FORM: FormData = {
  businessType: "",
  teamSize: "",
  layer1Problem: "",
  layer1Elimination: "",
  layer2Hours: "",
  layer2Salary: "",
  layer3Repetitive: "",
  layer3Compliance: "",
  layer3ComplianceDetail: "",
  layer3Data: "",
  additionalNotes: "",
};

const TEAM_SIZES: TeamSize[] = ["Solo", "2-5", "6-10", "10+"];
const REPETITIVE_OPTIONS: RepetitiveAnswer[] = [
  "Mostly repetitive",
  "Mix of both",
  "Mostly judgment calls",
];
const COMPLIANCE_OPTIONS: ComplianceAnswer[] = [
  "No concerns",
  "Maybe",
  "Yes, significant concerns",
];
const DATA_OPTIONS: DataAnswer[] = [
  "Yes, we're organized",
  "Somewhat, it's scattered",
  "Not really",
];
const SALARY_OPTIONS = [
  "Under $20/hr",
  "$20–$40/hr",
  "$40–$75/hr",
  "$75–$150/hr",
  "$150+/hr",
];

const STEPS = [
  { label: "Your Business" },
  { label: "The Problem" },
  { label: "The Cost" },
  { label: "The Fit" },
];

// ── Shared field styles (matching ContactForm) ────────────────────────────────

const fieldStyle: React.CSSProperties = {
  backgroundColor: "#143C6A",
  border: "0.8px solid rgba(255,255,255,0.4)",
  color: "#EEF6FF",
  borderRadius: "2px",
};

const labelStyle: React.CSSProperties = {
  color: "#FFFFFF",
};

// ── Sub-components ────────────────────────────────────────────────────────────

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label
      className="font-sans text-[16px] tracking-widest mb-2 block"
      style={labelStyle}
    >
      {children}
    </label>
  );
}

function TextInput({
  value,
  onChange,
  placeholder,
  autoFocus,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
}) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      autoFocus={autoFocus}
      className="w-full px-3 py-2 font-sans text-[14px] focus:outline-none"
      style={fieldStyle}
    />
  );
}

function TextArea({
  value,
  onChange,
  placeholder,
  rows = 5,
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

function SelectInput({
  value,
  onChange,
  options,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  placeholder?: string;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-3 py-2 font-sans text-[14px] focus:outline-none"
      style={{ ...fieldStyle, cursor: "pointer" }}
    >
      {placeholder && (
        <option value="" disabled style={{ background: "#0A1E3A" }}>
          {placeholder}
        </option>
      )}
      {options.map((opt) => (
        <option key={opt} value={opt} style={{ background: "#0A1E3A" }}>
          {opt}
        </option>
      ))}
    </select>
  );
}

// ── Steps ─────────────────────────────────────────────────────────────────────

function Step1({
  form,
  set,
}: {
  form: FormData;
  set: (k: keyof FormData, v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-[14px]">
      <div>
        <FieldLabel>WHAT KIND OF BUSINESS DO YOU RUN?</FieldLabel>
        <TextInput
          value={form.businessType}
          onChange={(v) => set("businessType", v)}
          placeholder="e.g. plumbing company, restaurant, coaching practice…"
          autoFocus
        />
      </div>
      <div>
        <FieldLabel>TEAM SIZE</FieldLabel>
        <ButtonGroup
          options={TEAM_SIZES}
          value={form.teamSize}
          onChange={(v) => set("teamSize", v)}
        />
      </div>
    </div>
  );
}

function Step2({
  form,
  set,
}: {
  form: FormData;
  set: (k: keyof FormData, v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-[14px]">
      <div>
        <FieldLabel>
          WHAT&apos;S THE SINGLE BIGGEST OPERATIONAL HEADACHE IN YOUR BUSINESS
          RIGHT NOW?
        </FieldLabel>
        <TextArea
          value={form.layer1Problem}
          onChange={(v) => set("layer1Problem", v)}
          placeholder="Be as specific as you can. The more detail, the better your report will be."
          autoFocus
        />
      </div>
      <div>
        <FieldLabel>
          IF YOU COULD ELIMINATE ONE TASK FROM YOUR WEEK FOREVER, WHAT WOULD IT
          BE?
        </FieldLabel>
        <TextArea
          value={form.layer1Elimination}
          onChange={(v) => set("layer1Elimination", v)}
          placeholder="Could be the same as above, or something different."
          rows={4}
        />
      </div>
    </div>
  );
}

function Step3({
  form,
  set,
}: {
  form: FormData;
  set: (k: keyof FormData, v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-[14px]">
      <div>
        <FieldLabel>
          HOW MANY HOURS PER WEEK DOES THIS COST YOU OR YOUR TEAM?
        </FieldLabel>
        <div className="flex items-center gap-3">
          <input
            type="number"
            min={0}
            max={168}
            value={form.layer2Hours}
            onChange={(e) => set("layer2Hours", e.target.value)}
            placeholder="0"
            className="px-3 py-2 font-sans text-[14px] focus:outline-none w-[110px]"
            style={fieldStyle}
          />
          <span className="font-sans text-[14px]" style={{ color: "#80AEE0" }}>
            hours / week
          </span>
        </div>
        <p className="font-sans text-[12px] mt-1.5">
          Rough estimate is fine, include everyone involved.
        </p>
      </div>
      <div>
        <FieldLabel>
          WHAT&apos;S THE ROUGH HOURLY COST OF THE PERSON HANDLING IT?
        </FieldLabel>
        <SelectInput
          value={form.layer2Salary}
          onChange={(v) => set("layer2Salary", v)}
          options={SALARY_OPTIONS}
          placeholder="Select a range…"
        />
        <p className="font-sans text-[12px] mt-1.5">
          Salary + benefits if it&apos;s an employee. Your own rate if it&apos;s your
          time.
        </p>
      </div>
    </div>
  );
}

function Step4({
  form,
  set,
  recaptchaRef,
  onRecaptcha,
}: {
  form: FormData;
  set: (k: keyof FormData, v: string) => void;
  recaptchaRef: React.RefObject<ReCAPTCHA | null>;
  onRecaptcha: (token: string) => void;
}) {
  const showDetail =
    form.layer3Compliance === "Maybe" ||
    form.layer3Compliance === "Yes, significant concerns";

  return (
    <div className="flex flex-col gap-[18px]">
      <div>
        <FieldLabel>
          ARE THE TASKS INVOLVED MOSTLY REPETITIVE OR DO THEY REQUIRE JUDGMENT
          CALLS?
        </FieldLabel>
        <ButtonGroup
          options={REPETITIVE_OPTIONS}
          value={form.layer3Repetitive}
          onChange={(v) => set("layer3Repetitive", v)}
        />
      </div>

      <div>
        <FieldLabel>
          ANY COMPLIANCE OR DATA PRIVACY CONCERNS AROUND AUTOMATING THIS AREA?
        </FieldLabel>
        <ButtonGroup
          options={COMPLIANCE_OPTIONS}
          value={form.layer3Compliance}
          onChange={(v) => {
            set("layer3Compliance", v);
            if (v === "No concerns") set("layer3ComplianceDetail", "");
          }}
        />
        {showDetail && (
          <div className="mt-3">
            <TextArea
              value={form.layer3ComplianceDetail}
              onChange={(v) => set("layer3ComplianceDetail", v)}
              placeholder="Briefly describe the concern: HIPAA, PCI, state regulations, etc."
              rows={3}
            />
          </div>
        )}
      </div>

      <div>
        <FieldLabel>
          DO YOU HAVE ORGANIZED DATA OR RECORDS RELATED TO THIS PROCESS?
        </FieldLabel>
        <ButtonGroup
          options={DATA_OPTIONS}
          value={form.layer3Data}
          onChange={(v) => set("layer3Data", v)}
        />
      </div>

      <div>
        <FieldLabel>ANYTHING ELSE YOU WANT ME TO KNOW? (OPTIONAL)</FieldLabel>
        <TextArea
          value={form.additionalNotes}
          onChange={(v) => set("additionalNotes", v)}
          placeholder="Context, constraints, prior attempts, anything that didn't fit above…"
          rows={4}
        />
      </div>

      {/* reCAPTCHA */}
      <div>
        {process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY ? (
          <ReCAPTCHA
            ref={recaptchaRef}
            sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}
            onChange={(value) => onRecaptcha(value ?? "")}
            onExpired={() => onRecaptcha("")}
            theme="dark"
          />
        ) : (
          <p
            className="font-sans text-[9px] tracking-widest"
            style={{ color: "#E0556F" }}
          >
            reCAPTCHA not configured: set NEXT_PUBLIC_RECAPTCHA_SITE_KEY
          </p>
        )}
      </div>
    </div>
  );
}

// ── AI disclosure ─────────────────────────────────────────────────────────────

function AiDisclosureNotice() {
  return (
    <p className="font-sans text-[11px] leading-relaxed mt-4">
      <strong style={{ color: "#80AEE0" }}>Heads up:</strong> This form uses
      AI (Claude, via AWS Bedrock) to generate your personalized response.
      Your answers are never sold or shared. They&apos;re used only to
      reply to you and, with your permission, to follow up about working
      together.{" "}
      <Link
        href="/privacy"
        className="underline hover:no-underline"
        style={{ color: "#89D4FF" }}
      >
        Privacy Policy
      </Link>
    </p>
  );
}

// ── Progress bar ──────────────────────────────────────────────────────────────

function ProgressBar({ step, total }: { step: number; total: number }) {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-2">
        <span
          className="font-sans text-[11px] tracking-widest"
          style={{ color: "#3D7FD4" }}
        >
          STEP {step} OF {total}
        </span>
        <span className="font-sans text-[11px]" style={{ color: "#5B90C8" }}>
          {STEPS[step - 1].label}
        </span>
      </div>
      <div
        className="h-[3px] w-full"
        style={{ backgroundColor: "#071525", borderRadius: "2px" }}
      >
        <div
          className="h-[3px] transition-all duration-500"
          style={{
            width: `${(step / total) * 100}%`,
            background: "linear-gradient(90deg, #1A4FC4, #3D7FD4)",
            borderRadius: "2px",
          }}
        />
      </div>
    </div>
  );
}

// ── Special states ────────────────────────────────────────────────────────────

function StatusCard({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className="p-6"
      style={{
        backgroundColor: "#071525",
        border: "0.8px solid #162D5A",
        borderRadius: "2px",
      }}
    >
      {children}
    </div>
  );
}

function SuccessScreen({ firstName }: { firstName: string }) {
  return (
    <StatusCard>
      <h2
        className="font-sans font-bold text-[20px] mb-3"
        style={{ color: "#89D4FF" }}
      >
        Got it, {firstName}.
      </h2>
      <p className="font-sans text-[21px] leading-relaxed mb-2" style={{ color: "#FFFFFF" }}>
        Your answers are in. I&apos;ll review them and build your personalized
        Opportunity Report.
      </p>
      <p className="font-sans text-[21px]" style={{ color: "#FFFFFF" }}>
        Expect it in your inbox <span style={{ color: "#89D4FF" }}>right away</span>.
      </p>
      <p className="font-sans text-[12px] mt-5 leading-relaxed">
        I personally review every submission before generating your report.
        You&apos;ll get your top 3 AI opportunities, ranked by impact, with
        realistic time and cost estimates, not hype.
      </p>
    </StatusCard>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function Questionnaire({
  firstName,
  email,
  emailVerified,
  alreadySubmitted,
  redirectOnSuccessHref,
  onSubmitted,
  showAiDisclosure = true,
}: {
  firstName: string;
  email: string;
  emailVerified: boolean;
  alreadySubmitted: boolean;
  /** If provided, navigates here on successful submit instead of showing SuccessScreen. */
  redirectOnSuccessHref?: string;
  /**
   * If provided, called with the rendered prompt (or null if none was
   * generated) on successful submit instead of the default SuccessScreen /
   * redirect behavior — lets the parent take over rendering.
   */
  onSubmitted?: (renderedPrompt: string | null) => void;
  /**
   * Shows the "this form uses AI to generate your personalized response"
   * notice on the last step. Default true. Set false for flows (like the
   * Opportunity Finder) where the response is templated, not generated by a
   * model at submission time.
   */
  showAiDisclosure?: boolean;
}) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormData>(INITIAL_FORM);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState("");
  const recaptchaRef = useRef<ReCAPTCHA | null>(null);

  function set(key: keyof FormData, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setError(null);
  }

  function validateStep(): string | null {
    if (step === 1 && !form.businessType.trim()) {
      return "Please describe your business before continuing.";
    }
    if (step === 2 && !form.layer1Problem.trim()) {
      return "Please describe your biggest operational problem.";
    }
    return null;
  }

  function next() {
    const err = validateStep();
    if (err) { setError(err); return; }
    setError(null);
    setStep((s) => s + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function back() {
    setError(null);
    setStep((s) => s - 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function submit() {
    if (!recaptchaToken && process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY) {
      setError("Please complete the reCAPTCHA check before submitting.");
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/questionnaire/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessType: form.businessType,
          teamSize: form.teamSize || undefined,
          layer1Problem: form.layer1Problem,
          layer1Elimination: form.layer1Elimination || undefined,
          layer2Hours: form.layer2Hours ? Number(form.layer2Hours) : undefined,
          layer2Salary: form.layer2Salary || undefined,
          layer3Repetitive: form.layer3Repetitive || undefined,
          layer3Compliance: form.layer3Compliance || undefined,
          layer3ComplianceDetail: form.layer3ComplianceDetail || undefined,
          layer3Data: form.layer3Data || undefined,
          additionalNotes: form.additionalNotes || undefined,
          recaptchaToken,
        }),
      });

      const data = (await res.json()) as {
        success?: boolean;
        error?: string;
        renderedPrompt?: string | null;
      };
      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        recaptchaRef.current?.reset();
        setRecaptchaToken("");
        return;
      }
      if (onSubmitted) {
        onSubmitted(data.renderedPrompt ?? null);
        return;
      }
      if (redirectOnSuccessHref) {
        router.push(redirectOnSuccessHref);
        return;
      }
      setDone(true);
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  // ── Special states ──

  if (alreadySubmitted) {
    return (
      <StatusCard>
        <h2
          className="font-sans font-bold text-[20px] mb-3"
          style={{ color: "#89D4FF" }}
        >
          You&apos;re already in the queue
        </h2>
        <p className="font-sans text-[21px] leading-relaxed" style={{ color: "#FFFFFF" }}>
          We received your answers. Your Opportunity Report is being
          prepared. Watch your inbox at{" "}
          <span style={{ color: "#89D4FF" }}>{email}</span>.
        </p>
      </StatusCard>
    );
  }

  if (!emailVerified) {
    return (
      <StatusCard>
        <h2
          className="font-sans font-bold text-[20px] mb-3"
          style={{ color: "#89D4FF" }}
        >
          Verify your email first
        </h2>
        <p className="font-sans text-[21px] leading-relaxed" style={{ color: "#FFFFFF" }}>
          Check your inbox at{" "}
          <span style={{ color: "#89D4FF" }}>{email}</span> for a verification
          link. Once confirmed you can get started.
        </p>
      </StatusCard>
    );
  }

  if (done) {
    return <SuccessScreen firstName={firstName} />;
  }

  const isLastStep = step === STEPS.length;
  const recaptchaConfigured = !!process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
  const submitDisabled = loading || (isLastStep && recaptchaConfigured && !recaptchaToken);

  return (
    <div>
      <ProgressBar step={step} total={STEPS.length} />

      <div className="min-h-[340px]">
        {step === 1 && <Step1 form={form} set={set} />}
        {step === 2 && <Step2 form={form} set={set} />}
        {step === 3 && <Step3 form={form} set={set} />}
        {step === 4 && (
          <Step4
            form={form}
            set={set}
            recaptchaRef={recaptchaRef}
            onRecaptcha={setRecaptchaToken}
          />
        )}
      </div>

      {error && (
        <p
          className="font-sans text-[11px] leading-relaxed mt-4"
          style={{ color: "#E0556F" }}
        >
          {error}
        </p>
      )}

      {isLastStep && showAiDisclosure && <AiDisclosureNotice />}

      <div
        className="flex items-center justify-between mt-6 pt-5"
        style={{ borderTop: "0.8px solid #162D5A" }}
      >
        {step > 1 ? (
          <button
            type="button"
            onClick={back}
            className="font-sans text-[13px] tracking-widest px-5 py-2 transition-all duration-200 hover:[box-shadow:0_0_10px_2px_rgba(61,127,212,0.45),0_0_24px_6px_rgba(137,212,255,0.25)] hover:!text-white"
            style={{
              backgroundColor: "transparent",
              border: "0.8px solid #162D5A",
              borderRadius: "6px",
              color: "#80AEE0",
              cursor: "pointer",
            }}
          >
            ← BACK
          </button>
        ) : (
          <div />
        )}

        <button
          type="button"
          onClick={isLastStep ? submit : next}
          disabled={submitDisabled}
          className="font-sans font-bold text-[16px] tracking-widest px-7 py-3 transition-all duration-200 disabled:opacity-50 hover:[box-shadow:0_0_10px_2px_rgba(61,127,212,0.45),0_0_24px_6px_rgba(137,212,255,0.25)] hover:!text-white"
          style={{
            backgroundColor: "#238636",
            border: "1px solid #238636",
            color: "#FFFFFF",
            borderRadius: "6px",
            cursor: submitDisabled ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "SUBMITTING…" : isLastStep ? "SUBMIT ›" : "NEXT ›"}
        </button>
      </div>
    </div>
  );
}
