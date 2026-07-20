# CLAUDE.md

Guidance for Claude Code when working in this repository.

## Project

Moore Solutions personal brand site (webtechhq.com) — Next.js 16 (App Router), TypeScript, Tailwind CSS. Pushes to `master` auto-deploy to production via `.github/workflows/deploy.yml`.

## Required workflow — no direct commits to master

`master` is protected, deploys automatically, and is published live. Every change MUST follow this flow:

1. Create a new branch off `master` for the change (e.g. `git checkout -b fix/short-description`).
2. Commit changes to that branch.
3. Push the branch and open a pull request targeting `master` (`gh pr create`).
4. Wait for CI (`test / test` — lint, build, typecheck, Playwright e2e) to pass on the PR.
5. Only merge the PR into `master` after all required checks pass.
6. After a successful merge, delete the local feature branch (`git branch -d <branch>`) and run `git fetch --prune`. The remote branch is deleted automatically on merge (repo setting `delete_branch_on_merge`). Skip local deletion for any branch backing an active worktree.

Never commit directly to `master`, never push directly to `master`, and never merge a PR with failing or pending checks. Merging to `master` triggers a production deploy — do not merge, under any circumstance, without a fresh, explicit go-ahead from the user for that specific PR. Being asked to open or update the PR is not that go-ahead.

## Local verification before opening/updating a PR

Run everything that actually runs locally on this machine, matching what CI runs:

```bash
npm run lint
npm run build
npm run typecheck
npm run test:unit
```

`npm run test:e2e` is not run locally here — Playwright's browser install is blocked on this machine. CI's required `test / test` check is the real e2e gate; never report or imply e2e passed locally when it didn't.

## Project structure

```
src/app/          # Routes (App Router): page.tsx, layout.tsx, services/, portfolio/, about/, contact/
src/components/   # Shared components (Navbar, Hero, Footer, etc.)
tests/unit/        # Vitest unit/integration tests (lib + API routes, real sqlite temp DB per file)
tests/e2e/         # Playwright specs
```

## Secrets & environment

- `.env.local` holds real secrets (Gmail app password, reCAPTCHA keys) and is gitignored — never commit it, never print/log its contents, and never paste its values into commits, PRs, or commit messages.
- `.env.example` documents required variables with empty/placeholder values — update it when adding new env vars, but never add real secret values to it.

## Content & copy changes

When editing on-page copy (Hero, Services, About, etc.), match the existing brand voice: knowledgeable but approachable, confident without arrogance, faith-informed but not preachy, direct and occasionally humorous. Keep claims (years of experience, credentials, client names) consistent with what's already on the site unless James gives updated figures.

**No em dashes.** Don't use em dashes (`—`) in any user-facing copy. Split into two sentences, or use a comma, colon, or parentheses instead, whichever reads most naturally. Applies to new copy and to existing copy you touch; doesn't apply to code comments.

### Also check the AEO/LLM-facing artifacts

This site is actively optimized for discovery by AI answer engines (ChatGPT, Perplexity, Claude, Google AI Overviews), not just classic SEO. This applies to **new copy you're adding just as much as copy you're editing** — a brand-new page or section needs these artifacts from the day it ships, not as a follow-up later. Whenever you add or change copy that touches what a page says about itself (its headline/H1, the services or facts it states, or whether a route is public or gated), check whether these need updating in the same PR:

- **That page's own `export const metadata`** (title/description in its `page.tsx`) — every new public page gets its own, written to match the copy actually on the page, not left to inherit the homepage's. On edits, don't let it drift into describing a version of the page that no longer exists.
- **`src/app/sitemap.ts`** — add the route the moment a new public page ships; remove or reclassify it if you're removing a page or changing its public/gated status.
- **`src/app/robots.ts`** — same, if a route's crawlability should change (e.g. a page that used to redirect-if-unauthenticated becomes genuinely public, or vice versa).
- **`public/llms.txt`** — add a one-line description for a genuinely new public page; update an existing one if its purpose or content materially changed.
- **JSON-LD structured data** (`Organization`/`Person` schema in `layout.tsx`, `Service` schema on `/services`) — update if the change touches a fact one of these schemas asserts (years of experience, service list, founder bio claims, pricing framing).

Fold any needed update into the same PR as the copy change rather than leaving it for later. If a file listed above doesn't exist yet in the repo, skip that item, it's not a blocker, just check once it does.

## Buttons & clickable links — default styling

Every button-like or link-like clickable element (CTAs, nav links, form submit buttons) gets these two treatments by default unless a component has an explicit reason not to (e.g. plain inline text links):

- **Rounding:** `border-radius: 6px` (`borderRadius: 6` inline, or `rounded-[6px]`).
- **Hover glow:** `transition-all duration-200 hover:[box-shadow:0_0_10px_2px_rgba(61,127,212,0.45),0_0_24px_6px_rgba(137,212,255,0.25)]` (add `hover:!text-white` too if the element has a border/outline style rather than a filled background).

This is already the pattern used across `Hero.tsx`, `Navbar.tsx`, `Services.tsx`, `ContactForm.tsx`, the auth forms, `error.tsx`/`not-found.tsx`, and everything under `components/tools/`. Apply it to any new button/link rather than inventing a new hover treatment.

## Boxy elements — default rounding

Every non-layout "boxy" element (cards, panels, icon squares, badges/tags/pills) gets a small corner radius by default, scaled to the element's size — nothing on the site should have a hard 0px corner unless it's structural. Use this scale, matching what's already in use (e.g. `admin/page.tsx`, `admin/submissions/[id]/page.tsx`):

- **Cards/panels** (content containers): `4px`
- **Icon squares / medium boxes**: `3–4px`
- **Badges, tags, pills, small status chips**: `2–3px`
- **Buttons/CTAs**: `6px` (see above)

**Excluded — structural layout only:** the page shell and chrome that defines the app's frame, not its content — `ToolsShell.tsx`'s flex wrapper, `Sidebar.tsx`'s `<aside>` frame, `TopBar.tsx`'s bar, and similar full-bleed structural containers. Everything rendered *inside* that frame (cards, tiles, icon boxes, badges) still follows the scale above.

**Exception — Tools dashboard uses button rounding (`6px`), not the graduated scale.** On `/tools` specifically, these boxy elements were deliberately bumped to match the `6px` button radius instead of their normal card/icon-square size: `FeaturedToolCard`, `ToolPlaceholderCard`, the "NEED A HAND?" box in `Sidebar.tsx`, and the user-initials avatar squares in both `Sidebar.tsx` (bottom-left) and `TopBar.tsx` (top-right). This was a direct, explicit design call for that page — don't propagate `6px` to boxy elements elsewhere on the site off the back of this exception; the graduated scale above still applies everywhere else.

Apply the graduated scale by default to any new boxy element rather than leaving corners sharp — don't wait to be asked per-component. Only use `6px` outside of buttons if it's a Tools dashboard element following the exception above, or if explicitly requested.

## Text field borders — default styling

Every text-entry field (`<input>` of type text/email/password/number, `<textarea>`, `<select>`) gets a thin white border by default: `border: "0.8px solid rgba(255,255,255,0.4)"` (or `1px` where a component already used `1px`, e.g. the auth forms). Keep each field's existing background, radius, and color; only the border color changes.

For fields that swap border color on focus via inline `onFocus`/`onBlur` handlers (the auth forms — `SignInForm.tsx`, `SignUpForm.tsx`, `ForgotPasswordForm.tsx`, `ResetPasswordForm.tsx`), the focus color stays `#3D7FD4`, but `onBlur` must reset to `rgba(255,255,255,0.4)`, not the old `#162D5A`.

This is already the pattern in `Questionnaire.tsx`'s shared `fieldStyle`, `ContactForm.tsx`, `AdminNotesEditor.tsx`, `PromptDisplay.tsx`'s prompt textarea, the business-name inputs in `BusinessAuditFlow.tsx`, and all four auth forms. Apply it to any new text field rather than reusing the old `#162D5A` border.

**Excluded:** buttons, dividers, card/panel borders, and segmented `ButtonGroup`-style selectors (e.g. the team-size / repetitive-task pickers in `Questionnaire.tsx`) — those aren't free-text fields and keep their own border rules (see Buttons & clickable links and Boxy elements above).

### Field labels

Every field label (the small caption above an input/textarea/select) gets: `className="font-sans text-[16px] tracking-widest mb-2 block"`, `color: "#FFFFFF"`. This is the `Questionnaire.tsx`/Opportunity Finder `FieldLabel` pattern, also applied to the Business Audit page's "BUSINESS NAME" label and `PayPalCardCheckout.tsx`'s "CARD NUMBER" / "EXPIRY" / "CVV" labels. Don't use the old small `11px "Courier New", monospace` all-caps gray label style for form field labels going forward; that style remains fine for non-field meta captions (card meta info, section eyebrow labels) but not for a label sitting directly above a text field.

## Paragraph text color

`globals.css` sets `p { color: var(--brand-white); }` — white is the site-wide default for every `<p>`. Don't add an inline/explicit color to a new paragraph just to match its neighbors; let it inherit.

**Exception — functional/semantic color stays:** colors that carry meaning (form error banners, the reCAPTCHA-not-configured warning, success/error confirmation text, status-coded values like the admin KPI tiles or the use-cases page's green "Result" line) are left as their deliberate color, not flattened to white. If a paragraph's color is telling the user something (error, warning, success, a status value), keep it; if it's just muted body copy for visual hierarchy, let it be white.

## Tool screen headers & lead paragraphs — default styling

Every screen-level header inside `/tools` (the dashboard welcome header, and each state/step header rendered by a tool flow: locked, not-started, in-progress, success, error, etc.) plus its immediately-following lead paragraph gets this treatment by default:

- **Header** (`h1`/`h2`, `"Courier New", monospace`): `color: "#89D4FF"` (light blue, matches `--brand-sky`).
- **Lead paragraph** directly under it (Arial, sans-serif): `font-size: 21px`, `color: "#FFFFFF"` (pure white, not the `--brand-white` default).

This is already the pattern in `AiOpportunityFinderFlow.tsx`, `PromptDisplay.tsx`, `BusinessAuditFlow.tsx` (all of its state screens), the dashboard welcome header in `app/tools/page.tsx`, and the `StatusCard`/`SuccessScreen` states in `Questionnaire.tsx`. Apply it to any new tool screen's header/lead-paragraph pair rather than inventing new values.

**Excluded:**
- `BusinessAuditReport.tsx` — the formal Opportunity Report document follows its own fixed template (see the Opportunity Report section) with intentionally varied heading/text sizes; don't apply this convention to it.
- Compact confirmation banners/toasts (e.g. the "Payment received" strip in `BusinessAuditFlow.tsx` shown alongside a checkmark icon) — these are transient inline confirmations, not full screen headers, and keep their own smaller sizing.
- Secondary/supplementary paragraphs below the main lead paragraph (disclaimers, fine print, perk callouts) keep their own smaller, purpose-specific sizing rather than being bumped to 21px.

## Gold-standard test account — applies to every tool, present and future

The account configured via `TEST_ACCOUNT_EMAIL` (private data, set only in `.env.local`/production env, never hardcoded in code) is the one account allowed to bypass payment gates and reset its own tool output in production, so the full signup → tool → paid-tool funnel can be exercised repeatedly without creating throwaway accounts or paying real money. All of this logic lives in `src/lib/testAccount.ts`.

**Every future paid tool must:**
- Check access with `isGoldStandardTestAccount(user.email) || hasPurchased(...)` (or an equivalent bypass) rather than gating on `hasPurchased`/a real payment alone.
- Provision an `ensureComplimentaryPurchase`-style zero-cost, already-captured purchase row (see `src/lib/purchases.ts`) if the tool needs a purchase record to hang its own tables off, instead of routing the test account through the real payment provider.
- Offer a way to run/regenerate its output without payment for this account (see `/api/tools/business-audit/run-test` for the pattern), since real generation is normally only triggered by a captured payment.

**Every future tool with its own per-user result table must:**
- Add a `DELETE FROM <table> WHERE user_id = ?` line to `resetAllToolDataForUser()` in `src/lib/testAccount.ts`, unless the table cascades from `purchases` or another table already covered there.

The dashboard (`/tools`) renders a `TestAccountResetButton` only for this account, which calls `POST /api/tools/test-reset` to wipe all tool output at once. Don't build a new one-off reset mechanism per tool - extend the shared reset function instead.

## No real account emails in publicly-presentable files

`.env.example`, `CLAUDE.md`, `README.md`, and everything under `.claude/**` are committed to this public repo. None of them may contain a real, resolvable email address for a specific account, especially one that designates a privileged identity (admin login, test-account payment bypass, protected-account lists, etc). Use a placeholder on `example.com`/`.org`/`.net`, or `test.local` for local-only test fixtures. Real values live only in `.env.local` (gitignored) or the production host's env, referenced by env var name in docs, never spelled out.

This also applies to code: don't hardcode a real privileged-account email as a fallback default (see `isGoldStandardTestAccount` in `src/lib/testAccount.ts` - no default, the env var is required). Ordinary functional addresses that are meant to be public by design (e.g. the `/privacy` and `/terms` contact addresses, the SendGrid "from" fallback in `src/lib/email.ts`) are not "accounts" in this sense and are fine to keep real in source.

`npm run lint` runs `scripts/check-example-emails.js`, which fails the build if a non-allowlisted email address shows up in any of the files above. Add new example/doc files to that script's `TARGET_FILES`/`TARGET_DIRS` if they should be covered too.

## Commit messages

Follow the existing log style: short, imperative, capitalized summary line (e.g. "Fix hero CTA links blocked by fixed-background scroll wrapper"). No conventional-commit prefixes (`feat:`, `fix:`, etc.).

## Notes

- `npm run test:e2e` runs Playwright across the configured viewport matrix; install browsers first with `npx playwright install --with-deps chromium webkit` if needed.
- Branch protection on `master` requires the `test / test` status check to pass before merge.
- `deploy.sh` is a manual fallback for direct EC2 deploys outside the normal flow — the primary deploy path is the automated `master` push via `.github/workflows/deploy.yml`. Don't use it as a substitute for the PR workflow.
