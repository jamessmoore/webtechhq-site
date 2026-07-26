"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { MoveForwardStatus } from "@/lib/types";

const STATUS_OPTIONS: MoveForwardStatus[] = ["waiting", "contacted", "converted"];

export default function AdminQueueStatusControl({
  requestId,
  currentStatus,
}: {
  requestId: string;
  currentStatus: MoveForwardStatus;
}) {
  const router = useRouter();
  const [status, setStatus] = useState<MoveForwardStatus>(currentStatus);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleChange(next: MoveForwardStatus) {
    const previous = status;
    setStatus(next);
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/queue/${requestId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      if (!res.ok) {
        const d = (await res.json()) as { error?: string };
        setError(d.error ?? "Something went wrong.");
        setStatus(previous);
        return;
      }
      router.refresh();
    } catch {
      setError("Network error.");
      setStatus(previous);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <select
        value={status}
        disabled={saving}
        onChange={(e) => handleChange(e.target.value as MoveForwardStatus)}
        className="font-sans text-[12px] px-2 py-1 focus:outline-none focus:[border-color:#3D7FD4]"
        style={{
          backgroundColor: "#071525",
          border: "0.8px solid rgba(255,255,255,0.4)",
          borderRadius: "2px",
          color: "#EEF6FF",
          cursor: saving ? "not-allowed" : "pointer",
        }}
      >
        {STATUS_OPTIONS.map((s) => (
          <option key={s} value={s}>
            {s.toUpperCase()}
          </option>
        ))}
      </select>
      {error && (
        <span className="font-sans text-[11px]" style={{ color: "#E0556F" }}>
          {error}
        </span>
      )}
    </div>
  );
}
