"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function FinishSignupForm({ redirectTo }: { redirectTo: string }) {
  const router = useRouter();
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/complete-signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, lastName: lastName.trim() || undefined }),
      });

      const data = (await res.json()) as { success?: boolean; error?: string };

      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        return;
      }

      router.push(redirectTo);
      router.refresh();
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <div>
        <label
          htmlFor="finish-last-name"
          className="block text-xs mb-1.5 tracking-wider"
          style={{ color: "#FFFFFF" }}
        >
          LAST NAME (OPTIONAL)
        </label>
        <input
          id="finish-last-name"
          type="text"
          autoComplete="family-name"
          value={lastName}
          onChange={(e) => { setLastName(e.target.value); setError(null); }}
          className="w-full px-3 py-2.5 text-sm outline-none transition-all duration-150"
          style={{
            background: "rgba(14,58,154,0.12)",
            border: "1px solid rgba(255,255,255,0.4)",
            borderRadius: "6px",
            color: "#EEF6FF",
            fontFamily: "'Courier New', monospace",
          }}
          onFocus={(e) => (e.currentTarget.style.borderColor = "#3D7FD4")}
          onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.4)")}
        />
      </div>

      <div>
        <label
          htmlFor="finish-password"
          className="block text-xs mb-1.5 tracking-wider"
          style={{ color: "#FFFFFF" }}
        >
          PASSWORD
        </label>
        <input
          id="finish-password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          value={password}
          onChange={(e) => { setPassword(e.target.value); setError(null); }}
          className="w-full px-3 py-2.5 text-sm outline-none transition-all duration-150"
          style={{
            background: "rgba(14,58,154,0.12)",
            border: "1px solid rgba(255,255,255,0.4)",
            borderRadius: "6px",
            color: "#EEF6FF",
            fontFamily: "'Courier New', monospace",
          }}
          onFocus={(e) => (e.currentTarget.style.borderColor = "#3D7FD4")}
          onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.4)")}
        />
        <p className="mt-1 text-[13px]" style={{ color: "#89D4FF" }}>
          At least 8 characters
        </p>
      </div>

      <div>
        <label
          htmlFor="finish-confirm-password"
          className="block text-xs mb-1.5 tracking-wider"
          style={{ color: "#FFFFFF" }}
        >
          CONFIRM PASSWORD
        </label>
        <input
          id="finish-confirm-password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          value={confirmPassword}
          onChange={(e) => { setConfirmPassword(e.target.value); setError(null); }}
          className="w-full px-3 py-2.5 text-sm outline-none transition-all duration-150"
          style={{
            background: "rgba(14,58,154,0.12)",
            border: "1px solid rgba(255,255,255,0.4)",
            borderRadius: "6px",
            color: "#EEF6FF",
            fontFamily: "'Courier New', monospace",
          }}
          onFocus={(e) => (e.currentTarget.style.borderColor = "#3D7FD4")}
          onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.4)")}
        />
      </div>

      {error && (
        <p
          className="text-xs px-3 py-2 rounded"
          style={{ color: "#FF6B6B", background: "rgba(255,107,107,0.08)", border: "1px solid rgba(255,107,107,0.2)" }}
        >
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 font-sans font-bold text-[16px] tracking-widest transition-all duration-200 disabled:opacity-50 hover:[box-shadow:0_0_10px_2px_rgba(61,127,212,0.45),0_0_24px_6px_rgba(137,212,255,0.25)] hover:!text-white"
        style={{
          backgroundColor: "#238636",
          border: "1px solid #238636",
          borderRadius: "6px",
          color: "#FFFFFF",
          cursor: loading ? "not-allowed" : "pointer",
        }}
      >
        {loading ? "SAVING…" : "SAVE MY ACCOUNT ›"}
      </button>
    </form>
  );
}
