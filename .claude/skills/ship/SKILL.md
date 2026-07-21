---
name: ship
description: Push the current work through this repo's required branch → verify → PR → CI flow. Use when the user wants to open a PR, "ship" a change, or push local work through CI for webtechhq-site.
---

# Ship

Automates the workflow required by this repo's `CLAUDE.md`: feature branch → local verification → push → PR → wait for CI. Never merges automatically.

**Gate before invoking this skill at all (standing rule as of 2026-07-21):** this skill bundles commit *and* push/PR into one flow. Don't invoke it just because there's a working local change — push/PR needs its own explicit go-ahead from James, separate from and prior to whatever go-ahead produced the commit. For a commit-only round (steps 1-3 below), do those by hand without invoking this skill. Only run this skill once push has actually been authorized for that specific branch.

## Steps

1. **Check branch.** Run `git branch --show-current`. If it's `master`, create a new branch off it named for the change (e.g. `feature/short-description` or `fix/short-description`) — ask the user to confirm the name if it isn't obvious from context. Never commit directly to `master`.

2. **Check for uncommitted changes.** Run `git status`. If there are staged/unstaged changes, follow the standard commit process: review the diff, draft a concise imperative commit message matching the existing log style (no `feat:`/`fix:` prefixes), stage specific files by name (never `-A`/`.`), and commit. Skip this step if the working tree is already clean.

3. **Run local verification** for everything that actually runs on this machine:
   ```bash
   npm run lint
   npm run build
   npm run typecheck
   npm run test:unit
   ```
   If any step fails, stop and fix the underlying issue before continuing — don't push broken code to open a PR.

   `npm run test:e2e` is **not run locally** — Playwright's browser install is blocked on this machine. CI is the real e2e gate: the required `test / test` check runs it on every PR. Never report or imply e2e ran locally when it didn't.

4. **Push the branch:**
   ```bash
   git push -u origin <branch>
   ```

5. **Open the PR** with `gh pr create`, targeting `master`. Title under 70 characters; body with a `## Summary` (1-3 bullets) and `## Test plan` checklist, following the same format used for other PRs in this repo.

6. **Wait for CI.** The required check is named `test / test` (from `.github/workflows/test.yml` via `ci.yml`). Poll with:
   ```bash
   gh pr checks <pr-number> --watch
   ```
   or repeated `gh pr checks <pr-number>` if `--watch` isn't available.

7. **Report status and stop.** Once checks pass (or fail), tell the user the result and the PR URL. Do **not** merge, under any circumstance. Merging triggers a production deploy per `CLAUDE.md`, and is never part of shipping.

## Notes

- Stop after step 7, always. Merging is a separate action, decided and executed by someone else, never this skill.
- If CI fails, diagnose from the `gh pr checks` output / linked run logs, fix on the same branch, commit, push again, and re-watch — don't skip hooks or disable checks to force it through.
- Respect the repo's standing instruction: only commit/push when the user has given explicit go-ahead. Running this skill covers commit/push/PR — it never covers merge.
