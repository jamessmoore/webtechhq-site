"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

const HOVER_GLOW =
  "transition-all duration-200 hover:[box-shadow:0_0_10px_2px_rgba(61,127,212,0.45),0_0_24px_6px_rgba(137,212,255,0.25)]";

/**
 * Debounce window between a keystroke and firing the (server-side, regex-
 * matched-against-every-user) search navigation. This is a real DB-backed
 * filter re-run on every request, not a static in-memory list, so typing
 * fires a bounded number of navigations rather than one per keystroke.
 * Enter bypasses this and fires immediately (see the input's onKeyDown).
 */
const SEARCH_DEBOUNCE_MS = 300;

function SearchIcon({ size = 12 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="10.5" cy="10.5" r="6.5" />
      <line x1="20" y1="20" x2="15.5" y2="15.5" />
    </svg>
  );
}

export interface AdminUsersColumnSearchHiddenField {
  name: string;
  value: string;
}

/**
 * One column header's search disclosure (magnifying glass -> regex input),
 * split out as a client component so opening the `<details>` can autofocus
 * the text input (plain HTML `autofocus` doesn't fire here since the input
 * starts hidden inside a closed `<details>`) and so it can drive live,
 * debounced search navigation instead of a GET-form submit.
 *
 * The panel is a *controlled* `<details>` (open state lives in React state,
 * synced both ways via `onToggle`) specifically so it can be closed
 * imperatively on blur/outside-click, not just via the native
 * click-the-summary toggle.
 */
export default function AdminUsersColumnSearch({
  columnLabel,
  paramName,
  searchValue,
  searchActive,
  searchInvalid,
  hiddenFields,
}: {
  columnLabel: string;
  paramName: string;
  searchValue: string;
  searchActive: boolean;
  searchInvalid: boolean;
  hiddenFields: AdminUsersColumnSearchHiddenField[];
}) {
  const router = useRouter();
  const detailsRef = useRef<HTMLDetailsElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [open, setOpen] = useState(searchInvalid);

  // A debounced/committed search can land server-side as invalid (bad regex)
  // after the user has already moved on; keep the panel forced open so the
  // warning stays visible without requiring the user to click back into it.
  // Adjusting state directly during render (React's documented pattern for
  // "state that depends on a prop") rather than in an effect, so this
  // doesn't cause an extra cascading render after commit.
  if (searchInvalid && !open) {
    setOpen(true);
  }

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  function navigate(value: string) {
    const sp = new URLSearchParams();
    for (const f of hiddenFields) sp.set(f.name, f.value);
    if (value) sp.set(paramName, value);
    router.replace(`/admin/users?${sp.toString()}`, { scroll: false });
  }

  function scheduleNavigate(value: string) {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      debounceRef.current = null;
      navigate(value);
    }, SEARCH_DEBOUNCE_MS);
  }

  /** Cancels any pending debounce and navigates immediately with the given value. */
  function commitNow(value: string) {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }
    navigate(value);
  }

  /** Fires any pending debounced navigation immediately instead of waiting out the timer; a no-op if nothing's pending. */
  function flushPendingNavigate() {
    if (debounceRef.current) {
      commitNow(inputRef.current?.value ?? "");
    }
  }

  function closePanel() {
    flushPendingNavigate();
    setOpen(false);
  }

  return (
    <details
      ref={detailsRef}
      open={open}
      style={{ position: "relative" }}
      onToggle={(e) => {
        const isOpen = (e.target as HTMLDetailsElement).open;
        setOpen(isOpen);
        if (isOpen) inputRef.current?.focus();
      }}
      onBlur={(e) => {
        // Focus moved within the panel (there's nothing else in it besides
        // the input today, but this stays correct if that ever changes) -
        // leave it open.
        const next = e.relatedTarget as Node | null;
        if (next && detailsRef.current?.contains(next)) return;
        // Some browsers (Safari) don't reliably populate relatedTarget on
        // blur, and a click on a non-focusable element fires blur before the
        // click's own effects land. Defer one tick and re-check where focus
        // actually ended up so an in-panel click has already registered
        // before we decide whether to close.
        window.setTimeout(() => {
          if (!detailsRef.current) return;
          if (!detailsRef.current.contains(document.activeElement)) {
            closePanel();
          }
        }, 0);
      }}
    >
      <summary
        className={`cursor-pointer list-none inline-flex items-center justify-center p-1 rounded-[3px] ${HOVER_GLOW}`}
        style={{ color: searchActive || searchInvalid ? "#89D4FF" : "#5B90C8" }}
        aria-label={`Search ${columnLabel}`}
      >
        <SearchIcon />
      </summary>
      <div
        className="absolute z-20 mt-1 flex flex-col gap-1 p-2"
        style={{ backgroundColor: "#0B1930", border: "0.8px solid #162D5A", borderRadius: "4px", top: "100%", left: 0 }}
      >
        <div className="flex items-center gap-1">
          <input
            ref={inputRef}
            type="text"
            defaultValue={searchValue}
            placeholder="regex"
            className="font-sans text-[12px] px-2 py-1 focus:outline-none focus:[border-color:#3D7FD4] normal-case tracking-normal"
            style={{ backgroundColor: "#030B18", border: "0.8px solid rgba(255,255,255,0.4)", borderRadius: "2px", color: "#EEF6FF", width: "120px" }}
            onChange={(e) => scheduleNavigate(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                // No form to submit; Enter just means "don't wait for the
                // debounce", so fire the navigation right away.
                e.preventDefault();
                commitNow(inputRef.current?.value ?? "");
              } else if (e.key === "Escape") {
                e.preventDefault();
                closePanel();
              }
            }}
          />
        </div>
        {searchInvalid && (
          <p className="font-sans text-[10px] normal-case tracking-normal" style={{ color: "#FBBC05" }}>
            Invalid pattern, showing all rows
          </p>
        )}
      </div>
    </details>
  );
}
