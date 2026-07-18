"use client";

import Link from "next/link";
import { markRowNavigationPending } from "@/lib/adminUsersRowNavigation";

/**
 * Thin client wrapper around the admin users table's per-row stretched
 * `<Link>` (the `position: absolute; inset: 0` overlay that makes the whole
 * row clickable). The table itself is rendered by a Server Component
 * (`src/app/admin/users/page.tsx`), which can't attach a live event handler
 * straight to `next/link` - functions aren't serializable across the
 * server/client boundary - so this exists purely to carry `onPointerDown`.
 *
 * Marking `markRowNavigationPending()` here lets `AdminUsersColumnSearch`
 * tell a genuine row-click navigation apart from any other reason its search
 * input lost focus, so it can leave this `Link`'s own `push()` alone instead
 * of racing it with a debounce-flush `replace()`. See
 * `src/lib/adminUsersRowNavigation.ts` for the full race explanation.
 */
export default function AdminUsersRowLink({
  href,
  ariaLabel,
}: {
  href: string;
  ariaLabel: string;
}) {
  return (
    <Link
      href={href}
      className="absolute inset-0"
      style={{ zIndex: 0 }}
      aria-label={ariaLabel}
      onPointerDown={markRowNavigationPending}
    />
  );
}
