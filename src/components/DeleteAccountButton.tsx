"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DeleteAccountButton({
  userId,
  protectedAccount = false,
}: {
  userId: string;
  protectedAccount?: boolean;
}) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    setDeleting(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, { method: "DELETE" });
      if (!res.ok) {
        const d = (await res.json()) as { error?: string };
        setError(d.error ?? "Something went wrong.");
        setDeleting(false);
        return;
      }
      router.push("/admin");
      router.refresh();
    } catch {
      setError("Network error.");
      setDeleting(false);
    }
  }

  return (
    <div>
      <p
        className="font-sans text-[11px] tracking-widest mb-3"
        style={{ color: "#5B90C8" }}
      >
        DANGER ZONE
      </p>
      {protectedAccount ? (
        <p className="font-sans text-[12px]" style={{ color: "#5B90C8" }}>
          This is a protected system account and cannot be deleted.
        </p>
      ) : !confirming ? (
        <button
          type="button"
          onClick={() => setConfirming(true)}
          className="font-sans font-bold text-[13px] tracking-widest px-5 py-2 transition-all duration-200 hover:[box-shadow:0_0_10px_2px_rgba(61,127,212,0.45),0_0_24px_6px_rgba(137,212,255,0.25)] hover:!text-white"
          style={{
            backgroundColor: "#8B2020",
            border: "1px solid #8B2020",
            color: "#FFFFFF",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          DELETE ACCOUNT
        </button>
      ) : (
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-sans text-[12px]" style={{ color: "#E0556F" }}>
            Permanently delete this user and their submission?
          </span>
          <button
            type="button"
            disabled={deleting}
            onClick={handleDelete}
            className="font-sans font-bold text-[13px] tracking-widest px-4 py-1.5 transition-all duration-200 disabled:opacity-40 hover:[box-shadow:0_0_10px_2px_rgba(61,127,212,0.45),0_0_24px_6px_rgba(137,212,255,0.25)] hover:!text-white"
            style={{
              backgroundColor: "#5c1a1a",
              border: "1px solid #c0392b",
              color: "#FFFFFF",
              borderRadius: "4px",
              cursor: deleting ? "not-allowed" : "pointer",
            }}
          >
            {deleting ? "DELETING…" : "CONFIRM DELETE"}
          </button>
          <button
            type="button"
            disabled={deleting}
            onClick={() => setConfirming(false)}
            className="font-sans text-[13px] tracking-widest px-4 py-1.5 transition-all duration-200 disabled:opacity-40 hover:[box-shadow:0_0_10px_2px_rgba(61,127,212,0.45),0_0_24px_6px_rgba(137,212,255,0.25)] hover:!text-white"
            style={{
              backgroundColor: "transparent",
              border: "0.8px solid #162D5A",
              color: "#80AEE0",
              borderRadius: "4px",
              cursor: deleting ? "not-allowed" : "pointer",
            }}
          >
            CANCEL
          </button>
        </div>
      )}
      {error && (
        <p className="font-sans text-[11px] mt-2" style={{ color: "#E0556F" }}>
          {error}
        </p>
      )}
    </div>
  );
}
