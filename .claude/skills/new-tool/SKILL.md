---
name: new-tool
description: Scaffold a new client tool on the /tools dashboard (e.g. Content Assistant, Review Responder, Competitor Scan), following the AI Opportunity Finder's routing, auth, sidebar, and dashboard-card pattern. Use when James is ready to build one of the "coming soon" tools into a real feature.
---

# New Tool

The `/tools` dashboard currently ships one real tool (AI Opportunity Finder) plus three placeholder cards for tools that don't exist yet: Content Assistant, Review Responder, Competitor Scan (defined in `COMING_SOON_TOOLS` in `src/lib/tools/reportData.ts`, rendered via `ToolPlaceholderCard`). When one of these gets built for real, it needs to be wired into several places that don't share a common registry today — this skill is the checklist.

## Touch points, in order

1. **Route:** `src/app/tools/<tool-slug>/page.tsx` — server component, auth-gated exactly like `ai-opportunity-finder/page.tsx`:
   ```tsx
   const session = await auth();
   if (!session?.user?.id) redirect("/signup");
   const user = getUserById(session.user.id);
   if (!user) redirect("/signup");
   ```
   Fetch whatever tool-specific data the flow needs, then render a client "Flow" component with it as props (see next step).

2. **Flow component:** `src/components/tools/<ToolName>Flow.tsx` — the actual client-side UI (`"use client"`), following `AiOpportunityFinderFlow.tsx`'s shape: takes the server-fetched data as props, owns its own step/form state, and swaps between an input state and a result state. Reuse `PromptDisplay.tsx`'s Send-To-AI pattern (copies to clipboard or pre-fills a URL for Claude/ChatGPT/Gemini) if the new tool also hands the user a prompt rather than doing generation server-side — check with James first if the tool's output model is different (e.g. actually calling an LLM API server-side instead).

3. **`ToolsShell.tsx` page metadata:** add a branch to `pageMeta()` for the new route's kicker/title, e.g.:
   ```tsx
   if (pathname.startsWith("/tools/<tool-slug>")) {
     return { kicker: "AI TOOLS", title: "<Tool Display Name>" };
   }
   ```
   Order matters if the new tool also has a sub-route like `/report` — put the more specific `startsWith` check first, same as the existing `ai-opportunity-finder/report` branch does.

4. **`Sidebar.tsx` nav link:** this list is hardcoded JSX, not a data array (unlike `Navbar.tsx`/`Footer.tsx` — see the `nav-link` skill for those). Add a new `<Link>` inside the `TOOLS` section, and a new `isXActive` pathname check at the top of the component to drive its active state:
   ```tsx
   const isNewToolActive = pathname.startsWith("/tools/<tool-slug>");
   ```
   ```tsx
   <Link href="/tools/<tool-slug>" onClick={onClose} className="..." style={{ ...navBase, ...(isNewToolActive ? navActive : {}), borderRadius: 6 }}>
     <SomeIcon size={17} />
     <span style={{ flex: 1 }}>Tool Display Name</span>
   </Link>
   ```

5. **Dashboard card:** `FeaturedToolCard.tsx` is currently hardcoded to AI Opportunity Finder only (title, description, "4 QUICK SECTIONS" meta line are all literal strings, not props) and `src/app/tools/page.tsx` renders exactly one `<FeaturedToolCard status={toolStatus} />`. When a second real tool ships, this needs a decision, not just a copy-paste:
   - **Generalize `FeaturedToolCard`** to take `title`, `description`, `metaItems`, `href`, `icon` as props, and render one per completed/available tool, or
   - **Add a second, differently-named card component** if the new tool's card needs a meaningfully different layout.
   Don't silently duplicate the hardcoded component with find-replaced strings — ask James which direction he wants before choosing, since it changes how every future tool card gets added too.

6. **Remove from `COMING_SOON_TOOLS`:** delete the tool's entry from the array in `src/lib/tools/reportData.ts` now that it's real (`ToolPlaceholderCard` reads this list to render the "MORE TOOLS ON THE WAY" grid).

7. **Report/results sub-route (if applicable):** if the tool produces a persisted result the user revisits later (like the orphaned `/tools/ai-opportunity-finder/report` demo page), decide whether it's a real linked page or another example-only page reachable by direct URL — see that route's history for precedent (kept unlinked intentionally per James's instruction).

## Verifying

Use the `preview-component` skill to screenshot the new dashboard card and flow states without needing a fresh signup each time. Run `npm run lint`, `npm run typecheck`, and exercise the real auth-gated route in the browser tool (the dev session in this repo commonly already has a signed-in cookie — check before assuming a fresh signup is needed).
