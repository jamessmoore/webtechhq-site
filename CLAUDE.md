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

## Commit messages

Follow the existing log style: short, imperative, capitalized summary line (e.g. "Fix hero CTA links blocked by fixed-background scroll wrapper"). No conventional-commit prefixes (`feat:`, `fix:`, etc.).

## Notes

- `npm run test:e2e` runs Playwright across the configured viewport matrix; install browsers first with `npx playwright install --with-deps chromium webkit` if needed.
- Branch protection on `master` requires the `test / test` status check to pass before merge.
- `deploy.sh` is a manual fallback for direct EC2 deploys outside the normal flow — the primary deploy path is the automated `master` push via `.github/workflows/deploy.yml`. Don't use it as a substitute for the PR workflow.
