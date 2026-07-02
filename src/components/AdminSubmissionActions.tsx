"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { ApprovalStatus } from "@/lib/types";

const fieldStyle: React.CSSProperties = {
  backgroundColor: "#071525",
  border: "0.8px solid #162D5A",
  color: "#EEF6FF",
  borderRadius: "2px",
  fontFamily: "inherit",
  fontSize: "13px",
  resize: "vertical",
};

export default function AdminSubmissionActions({
  id,
  currentStatus,
  currentNotes,
}: {
  id: string;
  currentStatus: ApprovalStatus;
  currentNotes?: string;
}) {
  const router = useRouter();
  const [notes, setNotes] = useState(currentNotes ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function patch(body: { status?: ApprovalStatus; notes?: string }) {
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      const res = await fetch(`/api/admin/submissions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const d = (await res.json()) as { error?: string };
        setError(d.error ?? "Something went wrong.");
        return;
      }
      setSaved(true);
      router.refresh();
    } catch {
      setError("Network error.");
    } finally {
      setSaving(false);
    }
  }

  const isPending = currentStatus === "pending_review";
  const isApproved = currentStatus === "approved";
  const isRejected = currentStatus === "rejected";

  return (
    <div className="space-y-6">
      {/* Status actions */}
      <div>
        <p
          className="font-sans text-[11px] tracking-widest mb-3"
          style={{ color: "#5B90C8" }}
        >
          STATUS
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={saving || isApproved}
            onClick={() => patch({ status: "approved" })}
            className="font-sans font-bold text-[13px] tracking-widest px-5 py-2 transition-all duration-200 disabled:opacity-40 hover:[box-shadow:0_0_10px_2px_rgba(61,127,212,0.45),0_0_24px_6px_rgba(137,212,255,0.25)] hover:!text-white"
            style={{
              backgroundColor: isApproved ? "#1a5c2a" : "#238636",
              border: `1px solid ${isApproved ? "#2ea043" : "#238636"}`,
              color: "#FFFFFF",
              borderRadius: "4px",
              cursor: isApproved || saving ? "not-allowed" : "pointer",
            }}
          >
            {isApproved ? "✓ APPROVED" : "APPROVE"}
          </button>
          <button
            type="button"
            disabled={saving || isRejected}
            onClick={() => patch({ status: "rejected" })}
            className="font-sans font-bold text-[13px] tracking-widest px-5 py-2 transition-all duration-200 disabled:opacity-40 hover:[box-shadow:0_0_10px_2px_rgba(61,127,212,0.45),0_0_24px_6px_rgba(137,212,255,0.25)] hover:!text-white"
            style={{
              backgroundColor: isRejected ? "#5c1a1a" : "#8B2020",
              border: `1px solid ${isRejected ? "#c0392b" : "#8B2020"}`,
              color: "#FFFFFF",
              borderRadius: "4px",
              cursor: isRejected || saving ? "not-allowed" : "pointer",
            }}
          >
            {isRejected ? "✕ REJECTED" : "REJECT"}
          </button>
          {!isPending ? (
            <button
              type="button"
              disabled={saving}
              onClick={() => patch({ status: "pending_review" })}
              className="font-sans text-[13px] tracking-widest px-5 py-2 transition-all duration-200 disabled:opacity-40 hover:[box-shadow:0_0_10px_2px_rgba(61,127,212,0.45),0_0_24px_6px_rgba(137,212,255,0.25)] hover:!text-white"
              style={{
                backgroundColor: "transparent",
                border: "0.8px solid #162D5A",
                color: "#80AEE0",
                borderRadius: "4px",
                cursor: saving ? "not-allowed" : "pointer",
              }}
            >
              RESET TO PENDING
            </button>
          ) : null}
        </div>
      </div>

      {/* Admin notes */}
      <div>
        <p
          className="font-sans text-[11px] tracking-widest mb-2"
          style={{ color: "#5B90C8" }}
        >
          ADMIN NOTES
        </p>
        <textarea
          rows={4}
          value={notes}
          onChange={(e) => { setNotes(e.target.value); setSaved(false); }}
          placeholder="Internal notes — not visible to the submitter."
          className="w-full px-3 py-2 focus:outline-none"
          style={fieldStyle}
        />
        <div className="flex items-center gap-3 mt-2">
          <button
            type="button"
            disabled={saving}
            onClick={() => patch({ notes })}
            className="font-sans text-[13px] tracking-widest px-4 py-1.5 transition-all duration-200 disabled:opacity-40 hover:[box-shadow:0_0_10px_2px_rgba(61,127,212,0.45),0_0_24px_6px_rgba(137,212,255,0.25)] hover:!text-white"
            style={{
              backgroundColor: "#0E3A9A",
              border: "1px solid #3D7FD4",
              color: "#BCE5FF",
              borderRadius: "4px",
              cursor: saving ? "not-allowed" : "pointer",
            }}
          >
            {saving ? "SAVING…" : "SAVE NOTES"}
          </button>
          {saved && (
            <span className="font-sans text-[11px]" style={{ color: "#2ea043" }}>
              Saved.
            </span>
          )}
          {error && (
            <span className="font-sans text-[11px]" style={{ color: "#E0556F" }}>
              {error}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
