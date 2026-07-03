"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const fieldStyle: React.CSSProperties = {
  backgroundColor: "#071525",
  border: "0.8px solid #162D5A",
  color: "#EEF6FF",
  borderRadius: "2px",
  fontFamily: "inherit",
  fontSize: "13px",
  resize: "vertical",
};

export default function AdminNotesEditor({
  submissionId,
  currentNotes,
}: {
  submissionId: string;
  currentNotes?: string;
}) {
  const router = useRouter();
  const [notes, setNotes] = useState(currentNotes ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function save() {
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      const res = await fetch(`/api/admin/submissions/${submissionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes }),
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

  return (
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
        placeholder="Internal notes, not visible to the submitter."
        className="w-full px-3 py-2 focus:outline-none"
        style={fieldStyle}
      />
      <div className="flex items-center gap-3 mt-2">
        <button
          type="button"
          disabled={saving}
          onClick={save}
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
  );
}
