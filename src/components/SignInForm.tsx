"use client";

import { useRef, useState, FormEvent } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import ReCAPTCHA from "react-google-recaptcha";

export default function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/tools";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState("");
  const recaptchaRef = useRef<ReCAPTCHA | null>(null);
  const [needsVerification, setNeedsVerification] = useState(false);
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!recaptchaToken && process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY) {
      setError("Please complete the reCAPTCHA check before continuing.");
      return;
    }
    setLoading(true);
    setError(null);
    setNeedsVerification(false);
    setResent(false);

    // NextAuth collapses every credentials `authorize()` failure (wrong
    // password, unverified email, etc.) into the same generic
    // "CredentialsSignin" error client-side, so unverified-email has to be
    // detected before calling signIn() to show its own message.
    const emailStatus = await fetch("/api/auth/email-status", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    })
      .then((res) => res.json())
      .catch(() => ({ needsVerification: false }));

    if (emailStatus.needsVerification) {
      // Keep the just-solved reCAPTCHA token intact (it hasn't been consumed
      // yet) so the "Resend verification email" button below is immediately
      // clickable instead of appearing dead until the user re-solves it.
      setLoading(false);
      setNeedsVerification(true);
      setError(
        "Please verify your email before signing in. Check your inbox for a verification link.",
      );
      return;
    }

    const result = await signIn("credentials", {
      email,
      password,
      recaptchaToken,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      recaptchaRef.current?.reset();
      setRecaptchaToken("");
      setError("Incorrect email or password.");
      return;
    }

    router.push(callbackUrl);
  }

  async function handleGoogle() {
    await signIn("google", { callbackUrl });
  }

  async function handleResend() {
    if (!recaptchaToken && process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY) {
      setError("Please complete the reCAPTCHA check before continuing.");
      return;
    }
    setResending(true);
    try {
      await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, recaptchaToken }),
      });
      setResent(true);
    } finally {
      setResending(false);
      recaptchaRef.current?.reset();
      setRecaptchaToken("");
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      {/* Email */}
      <div>
        <label
          htmlFor="signin-email"
          className="block text-xs mb-1.5 tracking-wider"
          style={{ color: "#6B8CAE" }}
        >
          EMAIL
        </label>
        <input
          id="signin-email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => { setEmail(e.target.value); setError(null); setNeedsVerification(false); setResent(false); }}
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
        <div className="flex items-center justify-between mb-1.5">
          <label
            htmlFor="signin-password"
            className="block text-xs tracking-wider"
            style={{ color: "#6B8CAE" }}
          >
            PASSWORD
          </label>
          <a
            href="/forgot-password"
            className="text-xs underline hover:no-underline"
            style={{ color: "#89D4FF" }}
          >
            Forgot password?
          </a>
        </div>
        <input
          id="signin-password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => { setPassword(e.target.value); setError(null); setNeedsVerification(false); setResent(false); }}
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
          reCAPTCHA not configured: set NEXT_PUBLIC_RECAPTCHA_SITE_KEY
        </p>
      )}

      {/* Error */}
      {error && (
        <p
          className="text-xs px-3 py-2 rounded"
          style={{
            color: "#FF6B6B",
            background: "rgba(255,107,107,0.08)",
            border: "1px solid rgba(255,107,107,0.2)",
          }}
        >
          {error}
        </p>
      )}

      {/* Resend verification */}
      {needsVerification && (
        resent ? (
          <p className="text-xs" style={{ color: "#89D4FF" }}>
            Verification email sent. Check your inbox.
          </p>
        ) : (
          <button
            type="button"
            onClick={handleResend}
            disabled={resending || (!!process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY && !recaptchaToken)}
            className="text-xs underline hover:no-underline disabled:opacity-60"
            style={{ color: "#89D4FF" }}
          >
            {resending ? "Sending…" : "Resend verification email"}
          </button>
        )
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
        {loading ? "SIGNING IN…" : "SIGN IN ›"}
      </button>

      {/* Divider */}
      <div className="flex items-center gap-3 py-1">
        <div className="flex-1 h-px" style={{ background: "#162D5A" }} />
        <span className="text-xs tracking-widest" style={{ color: "#4A6A8A" }}>OR</span>
        <div className="flex-1 h-px" style={{ background: "#162D5A" }} />
      </div>

      {/* Google */}
      <button
        type="button"
        onClick={handleGoogle}
        className="w-full flex items-center justify-center gap-3 py-2.5 text-sm tracking-wide transition-all duration-200 hover:[box-shadow:0_0_10px_2px_rgba(61,127,212,0.45),0_0_24px_6px_rgba(137,212,255,0.25)] hover:!text-white"
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

      <p className="text-center text-xs">
        Don&apos;t have an account?{" "}
        <a href="/signup" className="underline hover:no-underline" style={{ color: "#89D4FF" }}>
          Get started
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
