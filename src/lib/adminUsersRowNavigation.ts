/**
 * Shared signal between `AdminUsersRowLink` (the stretched `<Link>` that
 * makes an entire admin users table row clickable) and
 * `AdminUsersColumnSearch` (one independent instance per sortable column,
 * each with its own debounce timer). They render in separate component
 * subtrees - the row link is a peer of the column header search boxes, not
 * an ancestor/descendant of any of them - so a `useRef` local to either
 * component can't reach the other. This module-level flag is the shared
 * channel between them.
 *
 * Why it's needed: clicking a row blurs whatever column search input
 * currently has focus as the click's very first observable effect.
 * `AdminUsersColumnSearch` responds to that blur by flushing any
 * still-pending debounce straight to `router.replace()`. Without this flag,
 * that `replace()` can land *after* the row `<Link>`'s own `router.push()`
 * and silently steal the navigation back to the (now newly filtered) list
 * page - a real, observed regression.
 *
 * The fix: `AdminUsersRowLink` marks this flag from `onPointerDown`, which
 * always fires before the browser's focus-change-triggered blur (pointerdown
 * -> mousedown -> blur/focus -> mouseup -> click). `AdminUsersColumnSearch`
 * checks-and-clears it on blur before deciding whether to flush, so whichever
 * navigation is actually happening (the row's, or a plain "commit the search
 * and stay on the list" blur) wins outright rather than racing.
 *
 * Self-expiry: `consumeRowNavigationPending()` only ever runs from inside
 * `AdminUsersColumnSearch`'s own `closePanel()`, which only fires while a
 * search input currently has focus and loses it. An ordinary row click with
 * no search open anywhere - the overwhelmingly common case - never triggers
 * `closePanel()` at all, so nothing would ever consume (clear) the flag it
 * sets. Left unconditional, the flag stays armed after the *first* such
 * click for the rest of the page session, and gets wrongly read as "a row
 * navigation is in flight" by the *next*, completely unrelated
 * search-and-dismiss - silently dropping that pending debounce instead of
 * committing it (a real, observed regression). So `markRowNavigationPending`
 * also schedules an unconditional self-clear a short, bounded moment later:
 * generously longer than the real pointerdown -> blur -> closePanel() race
 * window (that's on the order of a single tick / animation frame), but far
 * too short for any later, independent interaction to ever observe it as
 * still `true`.
 */
let rowNavigationPending = false;
let rowNavigationExpiryTimer: ReturnType<typeof setTimeout> | null = null;

/**
 * Upper bound on how long the flag may stay armed before self-clearing.
 * Comfortably larger than the observed pointerdown -> blur -> closePanel()
 * race window (a single tick) so it's still `true` for every real in-flight
 * row click, but short enough that no later, unrelated interaction can ever
 * read it as stale.
 */
const PENDING_TTL_MS = 200;

function clearExpiryTimer(): void {
  if (rowNavigationExpiryTimer !== null) {
    clearTimeout(rowNavigationExpiryTimer);
    rowNavigationExpiryTimer = null;
  }
}

/** Called synchronously from a row link's pointerdown - before any blur it triggers can run. */
export function markRowNavigationPending(): void {
  rowNavigationPending = true;
  clearExpiryTimer();
  rowNavigationExpiryTimer = setTimeout(() => {
    rowNavigationExpiryTimer = null;
    rowNavigationPending = false;
  }, PENDING_TTL_MS);
}

/** Reads and clears the flag in one step, so it only ever suppresses the one blur cycle it was set for. */
export function consumeRowNavigationPending(): boolean {
  const pending = rowNavigationPending;
  rowNavigationPending = false;
  clearExpiryTimer();
  return pending;
}
