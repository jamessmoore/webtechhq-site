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
 *
 * `pointerdown` alone only bounds *mouse/touch*-driven re-arming, though.
 * A keyboard-only user never dispatches one at all: Tab to focus a column
 * search's `<summary>`, Enter/Space to open it (native `<details>`
 * activation - a `click`, not a pointer event), Tab into the input, type,
 * Tab away. If a stale flag were left over from an earlier, unrelated mouse
 * row click, that keyboard-only sequence would never clear it, and the
 * resulting blur's `closePanel()` would wrongly read it as true and silently
 * drop the debounce instead of flushing it - the same class of bug, just
 * reached without a mouse. `focusin` (unlike `focus`, it bubbles and is
 * composed, so it reaches a `document`-level listener) fires for *every*
 * focus change regardless of what caused it - mouse click, Tab keypress, or
 * a programmatic `.focus()` call - so it looks like the obvious way to close
 * that gap: register the same clear function on it too.
 *
 * That obvious version is broken, though (caught by an e2e run, not by
 * inspection - it reproduces every time, not a flake): a mouse click on the
 * row `<Link>` *itself* fires a same-gesture `focusin`. Clicking a focusable
 * element (an `<a>`, here) moves focus to it as part of `mousedown`'s own
 * default action, and that focus change fires blur-on-the-old-element then
 * focus/`focusin`-on-the-new-one - still all within the one synchronous
 * `pointerdown -> mousedown -> blur/focusin -> mouseup -> click` cascade a
 * single click dispatches, per the ordering this file already depends on.
 * So an unconditional `focusin`-clears-it listener fires *after*
 * `markRowNavigationPending()` (called from that same click's `pointerdown`,
 * which always goes first) and immediately erases what that pointerdown just
 * armed - before `AdminUsersColumnSearch`'s own deferred blur check ever gets
 * a chance to consume it. That's the exact bug this whole module exists to
 * prevent, just self-inflicted by the keyboard-gap fix instead of by a timer.
 *
 * The actual distinction that matters: a `focusin` that's a downstream side
 * effect of a `pointerdown` this module *just* saw (same gesture) must not
 * clear what that gesture may have armed; a `focusin` from anywhere else -
 * in particular, a Tab keypress with no accompanying `pointerdown` at all -
 * must. `withinPointerGesture` tracks that: the `pointerdown` listener sets
 * it before running the shared clear.
 *
 * It's reset via `setTimeout(fn, 0)`, deliberately *not* `queueMicrotask`.
 * The obvious-looking microtask version was tried first and is *also*
 * broken, confirmed by instrumenting real event dispatch in a browser rather
 * than by reasoning about it: per the HTML spec's "clean up after running
 * script" step, a microtask checkpoint runs after *every individual*
 * listener invocation, not just once at the end of a whole gesture - so a
 * microtask queued from the `pointerdown` capture listener drains
 * immediately, before dispatch even reaches that same event's own
 * bubble-phase listener on the target, let alone the later `mousedown` ->
 * focus-change -> `focusin` steps of the same click. It was back to `false`
 * long before the `focusin` it was meant to guard against ever fired.
 * `setTimeout(fn, 0)`, by contrast, is a full task, not a microtask - it only
 * runs once *every* listener for pointerdown, mousedown, the resulting
 * blur/focus/focusin, mouseup, and click has already finished (confirmed the
 * same way), which covers this entire single-gesture cascade, while still
 * resetting far sooner than any later, genuinely separate gesture -
 * necessarily arriving after actual new input from the user - could occur.
 */
let rowNavigationPending = false;
let withinPointerGesture = false;

function clearStaleRowNavigationPending(): void {
  rowNavigationPending = false;
}

if (typeof document !== "undefined") {
  document.addEventListener(
    "pointerdown",
    () => {
      clearStaleRowNavigationPending();
      withinPointerGesture = true;
      setTimeout(() => {
        withinPointerGesture = false;
      }, 0);
    },
    true,
  );
  document.addEventListener(
    "focusin",
    () => {
      // Skip the clear if this focusin is a same-gesture side effect of a
      // pointerdown already handled above (see the doc comment) - that
      // pointerdown's own clear-then-arm already resolved this gesture
      // correctly, and clearing again here would erase it.
      if (withinPointerGesture) return;
      clearStaleRowNavigationPending();
    },
    true,
  );
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
