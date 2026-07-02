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

Never commit directly to `master`, never push directly to `master`, and never merge a PR with failing or pending checks. Since merging to `master` triggers a production deploy, treat PR merges as a deploy action — confirm with the user before merging unless they've explicitly asked for the merge.

## Local verification before opening/updating a PR

Run the same checks CI runs so failures are caught early:

```bash
npm run lint
npm run build
npm run typecheck
npm run test:e2e
```

## Project structure

```
src/app/          # Routes (App Router): page.tsx, layout.tsx, services/, portfolio/, about/, contact/
src/components/   # Shared components (Navbar, Hero, Footer, etc.)
tests/e2e/         # Playwright specs
```

## Secrets & environment

- `.env.local` holds real secrets (Gmail app password, reCAPTCHA keys) and is gitignored — never commit it, never print/log its contents, and never paste its values into commits, PRs, or commit messages.
- `.env.example` documents required variables with empty/placeholder values — update it when adding new env vars, but never add real secret values to it.

## Content & copy changes

When editing on-page copy (Hero, Services, About, etc.), match the existing brand voice: knowledgeable but approachable, confident without arrogance, faith-informed but not preachy, direct and occasionally humorous. Keep claims (years of experience, credentials, client names) consistent with what's already on the site unless James gives updated figures.

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

## Paragraph text color

`globals.css` sets `p { color: var(--brand-white); }` — white is the site-wide default for every `<p>`. Don't add an inline/explicit color to a new paragraph just to match its neighbors; let it inherit.

**Exception — functional/semantic color stays:** colors that carry meaning (form error banners, the reCAPTCHA-not-configured warning, success/error confirmation text, status-coded values like the admin KPI tiles or the use-cases page's green "Result" line) are left as their deliberate color, not flattened to white. If a paragraph's color is telling the user something (error, warning, success, a status value), keep it; if it's just muted body copy for visual hierarchy, let it be white.

## Commit messages

Follow the existing log style: short, imperative, capitalized summary line (e.g. "Fix hero CTA links blocked by fixed-background scroll wrapper"). No conventional-commit prefixes (`feat:`, `fix:`, etc.).

## Notes

- `npm run test:e2e` runs Playwright across the configured viewport matrix; install browsers first with `npx playwright install --with-deps chromium webkit` if needed.
- Branch protection on `master` requires the `test / test` status check to pass before merge.
- `deploy.sh` is a manual fallback for direct EC2 deploys outside the normal flow — the primary deploy path is the automated `master` push via `.github/workflows/deploy.yml`. Don't use it as a substitute for the PR workflow.
