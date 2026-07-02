"use client";

import { useRef, useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import ReCAPTCHA from "react-google-recaptcha";

export default function ResetPasswordForm({ token }: { token: string }) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState("");
  const recaptchaRef = useRef<ReCAPTCHA | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }
    if (!recaptchaToken && process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY) {
      setError("Please complete the reCAPTCHA check before continuing.");
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password, recaptchaToken }),
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
          Password updated
        </h2>
        <p className="text-sm leading-relaxed mb-5">
          Your password has been reset. You can now sign in with your new password.
        </p>
        <button
          type="button"
          onClick={() => router.push("/signin")}
          className="w-full py-3 text-sm font-bold tracking-widest transition-all duration-200 hover:[box-shadow:0_0_10px_2px_rgba(61,127,212,0.45),0_0_24px_6px_rgba(137,212,255,0.25)] hover:!text-white"
          style={{
            background: "linear-gradient(180deg, #1A4FC4, #0E3A9A)",
            border: "1px solid #3D7FD4",
            borderRadius: "6px",
            color: "#89D4FF",
            fontFamily: "'Courier New', monospace",
            cursor: "pointer",
          }}
        >
          SIGN IN ›
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <div>
        <label
          htmlFor="reset-password"
          className="block text-xs mb-1.5 tracking-wider"
          style={{ color: "#6B8CAE" }}
        >
          NEW PASSWORD
        </label>
        <input
          id="reset-password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          value={password}
          onChange={(e) => { setPassword(e.target.value); setError(null); }}
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
        <p className="mt-1 text-xs">
          At least 8 characters
        </p>
      </div>

      <div>
        <label
          htmlFor="reset-confirm-password"
          className="block text-xs mb-1.5 tracking-wider"
          style={{ color: "#6B8CAE" }}
        >
          CONFIRM NEW PASSWORD
        </label>
        <input
          id="reset-confirm-password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          value={confirmPassword}
          onChange={(e) => { setConfirmPassword(e.target.value); setError(null); }}
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
        className="w-full py-3 text-sm font-bold tracking-widest transition-all duration-200 disabled:opacity-60 hover:[box-shadow:0_0_10px_2px_rgba(61,127,212,0.45),0_0_24px_6px_rgba(137,212,255,0.25)] hover:!text-white"
        style={{
          background: loading ? "#0E3A9A" : "linear-gradient(180deg, #1A4FC4, #0E3A9A)",
          border: "1px solid #3D7FD4",
          borderRadius: "6px",
          color: "#89D4FF",
          fontFamily: "'Courier New', monospace",
          cursor: loading ? "not-allowed" : "pointer",
        }}
      >
        {loading ? "UPDATING…" : "RESET PASSWORD ›"}
      </button>
    </form>
  );
}
