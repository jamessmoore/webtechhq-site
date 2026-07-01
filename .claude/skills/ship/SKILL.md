---
name: ship
description: Push the current work through this repo's required branch → verify → PR → CI flow. Use when the user wants to open a PR, "ship" a change, or push local work through CI for webtechhq-site.
---

# Ship

Automates the workflow required by this repo's `CLAUDE.md`: feature branch → local verification → push → PR → wait for CI. Never merges automatically.

## Steps

1. **Check branch.** Run `git branch --show-current`. If it's `master`, create a new branch off it named for the change (e.g. `feature/short-description` or `fix/short-description`) — ask the user to confirm the name if it isn't obvious from context. Never commit directly to `master`.

2. **Check for uncommitted changes.** Run `git status`. If there are staged/unstaged changes, follow the standard commit process: review the diff, draft a concise imperative commit message matching the existing log style (no `feat:`/`fix:` prefixes), stage specific files by name (never `-A`/`.`), and commit. Skip this step if the working tree is already clean.

3. **Run local verification**, matching CI exactly:
   ```bash
   npm run lint
   npm run build
   npm run typecheck
   npm run test:e2e
   ```
   If any step fails, stop and fix the underlying issue before continuing — don't push broken code to open a PR.

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

7. **Report status and stop.** Once checks pass (or fail), tell the user the result and the PR URL. Do **not** merge — merging triggers a production deploy per `CLAUDE.md`, and requires explicit user confirmation even after checks pass, unless they've already asked for the merge in this request.

## Notes

- If the user only asks to "open a PR" without mentioning merge, stop after step 7.
- If CI fails, diagnose from the `gh pr checks` output / linked run logs, fix on the same branch, commit, push again, and re-watch — don't skip hooks or disable checks to force it through.
- Respect the repo's standing instruction: only commit/push when the user has given explicit go-ahead. Being asked to run this skill counts as that go-ahead for the steps above, but merging is a separate action requiring its own confirmation.
