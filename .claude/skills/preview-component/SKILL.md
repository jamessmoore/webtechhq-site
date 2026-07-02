---
name: preview-component
description: Visually verify a component that normally sits behind auth (signup redirect) or another gate, using a disposable route and the browser tool, then clean up. Use when a UI change needs to be screenshotted/confirmed but the real page requires signing in first.
---

# Preview Component

Most interesting UI in this repo lives behind `auth()` gates (`/tools/**` redirects to `/signup` if there's no session). Signing in a real browser session just to check a color or a copy change is slow and often unnecessary if there's already an authenticated session in the browser tab (dev sessions frequently do carry one, see "Shortcut" below). This skill scaffolds a throwaway public route that renders the component directly, so it can be screenshotted without touching auth.

## Steps

1. **Check for a shortcut first.** If `mcp__claude-in-chrome` is already navigated into the site with a live session (common mid-session after earlier auth-gated work), just navigate straight to the real route (e.g. `/tools`) instead of building a preview route — it'll render for real. Only build a preview route if that's not available, or the component needs props/states the real flow can't easily produce (e.g. rendering all three "Send To" brand buttons side by side, or both `not_started` and `completed` statuses of the same card at once).

2. **Create the route.** Add `src/app/preview-<topic>/page.tsx`. **Do not prefix the folder with `_`** — Next.js treats `_`-prefixed folders as private and opts them out of routing entirely, so the route will 404.
   ```tsx
   import SomeComponent from "@/components/path/SomeComponent";

   export default function PreviewPage() {
     return (
       <div style={{ background: "#050B14", minHeight: "100vh", padding: 40 }}>
         <SomeComponent prop="..." />
       </div>
     );
   }
   ```
   Render multiple instances/props side by side when comparing states (e.g. two `<FeaturedToolCard status="..." />` calls to see `not_started` vs `completed` at once).

3. **Verify in browser.** Load the deferred `mcp__claude-in-chrome` tools if not already loaded (`ToolSearch` with `select:mcp__claude-in-chrome__tabs_context_mcp,mcp__claude-in-chrome__navigate,mcp__claude-in-chrome__computer,mcp__claude-in-chrome__tabs_create_mcp`), navigate to `http://localhost:3000/preview-<topic>`, and use `computer` (`screenshot`/`zoom`) to confirm the change. The project's local dev server frequently is already running on port 3000 from a prior session (check with `pgrep -af "next dev"` before starting a new one — Next.js will refuse to start a second instance on the same port and its own log line names the existing PID).

4. **Delete the preview route before committing.** `rm -rf src/app/preview-<topic>` and confirm with `git status --short` that only the intended component file(s) remain modified. Never leave a `preview-*` route in a commit — it's dead code and a stray public route.

## Notes

- This pattern is disposable by design: one preview route per verification pass, deleted immediately after. Don't accumulate multiple preview routes or try to make one reusable across sessions.
- If the component needs data that only exists server-side (a DB-backed prop, a session-derived value), pass a realistic literal instead of wiring up real data fetching — the goal is visual verification, not a full integration test.
