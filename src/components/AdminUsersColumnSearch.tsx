"use client";

import { useRef } from "react";

const HOVER_GLOW =
  "transition-all duration-200 hover:[box-shadow:0_0_10px_2px_rgba(61,127,212,0.45),0_0_24px_6px_rgba(137,212,255,0.25)]";

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
 * split out as a client component solely so opening the `<details>` can
 * autofocus the text input. Plain HTML `autofocus` doesn't fire here since
 * the input starts hidden inside a closed `<details>`; `onToggle` + a ref is
 * the reliable way to focus it the moment the panel opens. Everything else
 * about this markup (classes, colors, structure) mirrors the rest of
 * `admin/users/page.tsx` exactly - only the toggle-focus wiring is new.
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
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <details
      open={searchInvalid}
      style={{ position: "relative" }}
      onToggle={(e) => {
        if ((e.target as HTMLDetailsElement).open) {
          inputRef.current?.focus();
        }
      }}
    >
      <summary
        className={`cursor-pointer list-none inline-flex items-center justify-center p-1 rounded-[3px] ${HOVER_GLOW}`}
        style={{ color: searchActive || searchInvalid ? "#89D4FF" : "#5B90C8" }}
        aria-label={`Search ${columnLabel}`}
      >
        <SearchIcon />
      </summary>
      <form
        method="GET"
        action="/admin/users"
        className="absolute z-20 mt-1 flex flex-col gap-1 p-2"
        style={{ backgroundColor: "#0B1930", border: "0.8px solid #162D5A", borderRadius: "4px", top: "100%", left: 0 }}
      >
        <div className="flex items-center gap-1">
          {hiddenFields.map((f) => (
            <input key={f.name} type="hidden" name={f.name} value={f.value} />
          ))}
          <input
            ref={inputRef}
            type="text"
            name={paramName}
            defaultValue={searchValue}
            placeholder="regex"
            className="font-sans text-[12px] px-2 py-1 focus:outline-none focus:[border-color:#3D7FD4] normal-case tracking-normal"
            style={{ backgroundColor: "#030B18", border: "0.8px solid rgba(255,255,255,0.4)", borderRadius: "2px", color: "#EEF6FF", width: "120px" }}
          />
          <button
            type="submit"
            className={`font-sans text-[10px] tracking-widest px-2 py-1 rounded-[6px] ${HOVER_GLOW}`}
            style={{ color: "#89D4FF", border: "0.8px solid #3D7FD4" }}
          >
            GO
          </button>
        </div>
        {searchInvalid && (
          <p className="font-sans text-[10px] normal-case tracking-normal" style={{ color: "#FBBC05" }}>
            Invalid pattern, showing all rows
          </p>
        )}
      </form>
    </details>
  );
}
