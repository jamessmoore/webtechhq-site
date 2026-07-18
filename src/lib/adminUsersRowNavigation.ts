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
 * Bounding the flag's lifetime - without a wall clock: `consumeRowNavigationPending()`
 * only ever runs from inside `AdminUsersColumnSearch`'s own `closePanel()`,
 * which only fires while a search input currently has focus and loses it. An
 * ordinary row click with no search open anywhere - the overwhelmingly common
 * case - never triggers `closePanel()` at all, so nothing would ever consume
 * (clear) the flag it sets; left unbounded, it stays armed indefinitely and
 * gets wrongly read as "a row navigation is in flight" by the next,
 * completely unrelated search-and-dismiss (a real, observed regression). A
 * prior version of this file bounded the flag with a 200ms self-expiring
 * timer, but a timer only guarantees a *minimum* delay before clearing, not a
 * *maximum* one before consumption - under real contention (a throttled or
 * backgrounded tab, a slow device, a busy main thread), the blur handler's
 * own deferred check can itself run *after* that timer already fired,
 * wrongly reading the flag as `false` and reintroducing the original race,
 * now load-dependent instead of deterministic.
 *
 * So instead of a duration, the flag is bounded by the next real
 * `pointerdown` anywhere on the document - a `document`-level, capture-phase
 * listener, registered once below, clears it unconditionally before that
 * pointerdown's own bubble-phase handlers (including a fresh
 * `markRowNavigationPending()` call, if this pointerdown is itself another
 * row click) run. Capture phase always travels from `document` down to the
 * target before bubble phase runs back up, so this ordering - "clear
 * whatever's left over from the *previous* gesture, then let *this* gesture
 * arm its own flag" - holds structurally, by the DOM event dispatch
 * algorithm, not by however much wall-clock time has elapsed. And because a
 * genuine second `pointerdown` can't be dispatched while JS from the first
 * one is still synchronously running, this can't shrink the window a flag
 * needs to survive for its *own* same-gesture `consumeRowNavigationPending()`
 * call either: that call (via the blur handler's deferred check) always runs
 * to completion before any later `pointerdown` could even be queued.
 */
let rowNavigationPending = false;

function clearStaleRowNavigationPending(): void {
  rowNavigationPending = false;
}

if (typeof document !== "undefined") {
  document.addEventListener("pointerdown", clearStaleRowNavigationPending, true);
}

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
