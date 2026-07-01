"use client";

import { useRef, useState, FormEvent } from "react";
import { signIn } from "next-auth/react";
import ReCAPTCHA from "react-google-recaptcha";

interface FormState {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  tos: boolean;
}

const INITIAL: FormState = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  tos: false,
};

export default function SignUpForm() {
  const [form, setForm] = useState<FormState>(INITIAL);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState("");
  const recaptchaRef = useRef<ReCAPTCHA | null>(null);

  function set(field: keyof FormState, value: string | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setError(null);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!form.tos) {
      setError("Please agree to the Terms of Service to continue.");
      return;
    }
    if (!recaptchaToken && process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY) {
      setError("Please complete the reCAPTCHA check before continuing.");
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          password: form.password,
          recaptchaToken,
        }),
      });

      const data = (await res.json()) as { success?: boolean; error?: string };

      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        recaptchaRef.current?.reset();
        setRecaptchaToken("");
        return;
      }

      setSubmitted(true);
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    await signIn("google", { callbackUrl: "/panel" });
  }

  if (submitted) {
    return (
      <div className="text-center py-8">
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-5"
          style={{ background: "rgba(61,127,212,0.15)", border: "1px solid #3D7FD4" }}
        >
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            <path d="M4 11l5 5 9-9" stroke="#89D4FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h2
          className="text-xl font-bold mb-3"
          style={{ color: "#EEF6FF", fontFamily: "'Courier New', monospace" }}
        >
          Check your inbox
        </h2>
        <p className="text-sm leading-relaxed" style={{ color: "#6B8CAE" }}>
          We sent a verification link to{" "}
          <span style={{ color: "#89D4FF" }}>{form.email}</span>.<br />
          Click it to activate your account and start the questionnaire.
        </p>
        <p className="mt-4 text-xs" style={{ color: "#4A6A8A" }}>
          Didn&apos;t get it? Check your spam folder or{" "}
          <button
            type="button"
            onClick={() => { setSubmitted(false); setForm(INITIAL); }}
            className="underline hover:no-underline transition-all"
            style={{ color: "#89D4FF" }}
          >
            try a different email
          </button>
          .
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      {/* Name row */}
      <div className="grid grid-cols-2 gap-3">
        {(
          [
            { field: "firstName", label: "First name", autoComplete: "given-name" },
            { field: "lastName", label: "Last name", autoComplete: "family-name" },
          ] as { field: keyof FormState; label: string; autoComplete: string }[]
        ).map(({ field, label, autoComplete }) => (
          <div key={field}>
            <label
              htmlFor={field}
              className="block text-xs mb-1.5 tracking-wider"
              style={{ color: "#6B8CAE" }}
            >
              {label.toUpperCase()}
            </label>
            <input
              id={field}
              type="text"
              autoComplete={autoComplete}
              required
              value={form[field] as string}
              onChange={(e) => set(field, e.target.value)}
              className="w-full px-3 py-2.5 text-sm outline-none transition-all duration-150"
              style={{
                background: "rgba(14,58,154,0.12)",
                border: "1px solid #162D5A",
                borderRadius: "6px",
                color: "#EEF6FF",
                fontFamily: "'Courier New', monospace",
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = "#3D7FD4")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "#162D5A")}
            />
          </div>
        ))}
      </div>

      {/* Email */}
      <div>
        <label
          htmlFor="email"
          className="block text-xs mb-1.5 tracking-wider"
          style={{ color: "#6B8CAE" }}
        >
          WORK EMAIL
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          required
          value={form.email}
          onChange={(e) => set("email", e.target.value)}
          className="w-full px-3 py-2.5 text-sm outline-none transition-all duration-150"
          style={{
            background: "rgba(14,58,154,0.12)",
            border: "1px solid #162D5A",
            borderRadius: "6px",
            color: "#EEF6FF",
            fontFamily: "'Courier New', monospace",
          }}
          onFocus={(e) => (e.currentTarget.style.borderColor = "#3D7FD4")}
          onBlur={(e) => (e.currentTarget.style.borderColor = "#162D5A")}
        />
      </div>

      {/* Password */}
      <div>
        <label
          htmlFor="password"
          className="block text-xs mb-1.5 tracking-wider"
          style={{ color: "#6B8CAE" }}
        >
          PASSWORD
        </label>
        <input
          id="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          value={form.password}
          onChange={(e) => set("password", e.target.value)}
          className="w-full px-3 py-2.5 text-sm outline-none transition-all duration-150"
          style={{
            background: "rgba(14,58,154,0.12)",
            border: "1px solid #162D5A",
            borderRadius: "6px",
            color: "#EEF6FF",
            fontFamily: "'Courier New', monospace",
          }}
          onFocus={(e) => (e.currentTarget.style.borderColor = "#3D7FD4")}
          onBlur={(e) => (e.currentTarget.style.borderColor = "#162D5A")}
        />
        <p className="mt-1 text-xs" style={{ color: "#4A6A8A" }}>
          At least 8 characters
        </p>
      </div>

      {/* ToS checkbox */}
      <div className="flex items-start gap-2.5 pt-1">
        <input
          id="tos"
          type="checkbox"
          checked={form.tos}
          onChange={(e) => set("tos", e.target.checked)}
          className="mt-0.5 shrink-0 cursor-pointer accent-[#3D7FD4]"
        />
        <label htmlFor="tos" className="text-xs leading-relaxed cursor-pointer" style={{ color: "#6B8CAE" }}>
          I agree to the{" "}
          <a href="/terms" className="underline hover:no-underline" style={{ color: "#89D4FF" }}>
            Terms of Service
          </a>{" "}
          and{" "}
          <a href="/privacy" className="underline hover:no-underline" style={{ color: "#89D4FF" }}>
            Privacy Policy
          </a>
          .
        </label>
      </div>

      {/* reCAPTCHA */}
      {process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY ? (
        <ReCAPTCHA
          ref={recaptchaRef}
          sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}
          onChange={(value) => setRecaptchaToken(value ?? "")}
          onExpired={() => setRecaptchaToken("")}
          theme="dark"
        />
      ) : (
        <p className="font-sans text-[9px] tracking-widest" style={{ color: "#E0556F" }}>
          reCAPTCHA not configured — set NEXT_PUBLIC_RECAPTCHA_SITE_KEY
        </p>
      )}

      {/* Error */}
      {error && (
        <p
          className="text-xs px-3 py-2 rounded"
          style={{ color: "#FF6B6B", background: "rgba(255,107,107,0.08)", border: "1px solid rgba(255,107,107,0.2)" }}
        >
          {error}
        </p>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={loading || (!!process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY && !recaptchaToken)}
        className="w-full py-3 font-sans font-bold text-[16px] tracking-widest transition-colors duration-150 disabled:opacity-50"
        style={{
          backgroundColor: "#238636",
          border: "1px solid #238636",
          borderRadius: "6px",
          color: "#FFFFFF",
          cursor: loading ? "not-allowed" : "pointer",
        }}
      >
        {loading ? "CREATING ACCOUNT…" : "GET STARTED ›"}
      </button>

      {/* Divider */}
      <div className="flex items-center gap-3 py-1">
        <div className="flex-1 h-px" style={{ background: "#162D5A" }} />
        <span className="text-xs tracking-widest" style={{ color: "#4A6A8A" }}>
          OR
        </span>
        <div className="flex-1 h-px" style={{ background: "#162D5A" }} />
      </div>

      {/* Google */}
      <button
        type="button"
        onClick={handleGoogle}
        className="w-full flex items-center justify-center gap-3 py-2.5 text-sm tracking-wide transition-all duration-150"
        style={{
          background: "rgba(14,58,154,0.08)",
          border: "1px solid #162D5A",
          borderRadius: "6px",
          color: "#EEF6FF",
          fontFamily: "'Courier New', monospace",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#3D7FD4")}
        onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#162D5A")}
      >
        <GoogleIcon />
        Continue with Google
      </button>

      <p className="text-center text-xs" style={{ color: "#4A6A8A" }}>
        Already have an account?{" "}
        <a href="/signin" className="underline hover:no-underline" style={{ color: "#89D4FF" }}>
          Sign in
        </a>
      </p>
    </form>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path
        d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z"
        fill="#4285F4"
      />
      <path
        d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z"
        fill="#34A853"
      />
      <path
        d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z"
        fill="#FBBC05"
      />
      <path
        d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z"
        fill="#EA4335"
      />
    </svg>
  );
}
