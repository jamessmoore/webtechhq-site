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
 */
let rowNavigationPending = false;

/** Called synchronously from a row link's pointerdown - before any blur it triggers can run. */
export function markRowNavigationPending(): void {
  rowNavigationPending = true;
}

/** Reads and clears the flag in one step, so it only ever suppresses the one blur cycle it was set for. */
export function consumeRowNavigationPending(): boolean {
  const pending = rowNavigationPending;
  rowNavigationPending = false;
  return pending;
}
