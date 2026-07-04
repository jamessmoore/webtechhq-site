---
name: test-account-flow
description: Reset the local SQLite dev database and drive a real signup through email verification, sign-in, and the Opportunity Finder using the browser tool. Use when asked to test the account/signup flow, verify a copy or UI change on signup/tools pages end-to-end, or reset local test data.
---

# Test Account Flow

Drives a full account lifecycle (signup → email verification → sign-in → questionnaire → submission) against the local dev database, and resets that database cleanly between runs.

## Step 1 — Reset the local database

The dev db lives at `data/submissions.db` (SQLite, gitignored — safe to destroy). Check `DATABASE_PATH` in `.env.local` isn't pointed somewhere unexpected before deleting.

```bash
rm -f data/submissions.db data/submissions.db-shm data/submissions.db-wal
npm run seed:prompt-templates
```

`seed:prompt-templates` recreates the `prompt_template`/`prompt_template_eval` tables from `data/seeds/prompt-templates.local.json`. The `users`/`submissions` tables are created lazily by `migrate()` in `src/lib/db.ts` on first app request — that's expected, not a bug.

**Gotcha — restart the dev server after resetting.** `better-sqlite3` keeps its file descriptor open even after the underlying file is deleted (Linux allows this: the process keeps talking to the now-unlinked inode). If a `next dev` process was already running, it will keep serving the *old* database — including old accounts — until it's restarted. Symptom: signup fails with "An account with this email already exists" right after a reset that should have produced an empty db.

Check for a running server and restart it:
```bash
pgrep -af "next dev"
# kill the npm run dev parent pid, then:
npm run dev &
```

Confirm the reset actually took by checking table state directly — don't infer it from the app:
```bash
sqlite3 data/submissions.db ".tables"
```

## Step 2 — Drive signup in the browser

Load the deferred Chrome tools if not already loaded (one batched `ToolSearch` call):
```
select:mcp__claude-in-chrome__tabs_context_mcp,mcp__claude-in-chrome__navigate,mcp__claude-in-chrome__computer,mcp__claude-in-chrome__browser_batch,mcp__claude-in-chrome__find
```

Get tab context, navigate to `http://localhost:3000/signup`, and fill the form (first name, last name, email, password, ToS checkbox) via `computer` clicks/`type` — batch these with `browser_batch`.

**Stop at the reCAPTCHA.** Completing CAPTCHAs is off-limits — don't click the "I'm not a robot" checkbox. Two options:
- Ask the user to click it and submit themselves, then continue from Step 3.
- If the user wants a fully unattended run, restart the dev server with the reCAPTCHA secret unset for that process only (never edit `.env.local`'s real value):
  ```bash
  RECAPTCHA_SECRET_KEY= npm run dev &
  ```
  `verifyRecaptcha()` in `src/lib/recaptcha.ts` short-circuits to `true` when the secret is unset, so the form submits without a real challenge. Flag this to the user before doing it — it's a real (if ephemeral, process-scoped) change to security behavior, and restart the server back to normal afterward.

## Step 3 — Verify the email without a real inbox

No need to check a real mailbox. The verification token is stored directly on the user row:

```bash
sqlite3 data/submissions.db "SELECT email, verification_token, verification_expires_at FROM users ORDER BY created_at DESC LIMIT 1;"
```

Navigate the browser to `http://localhost:3000/api/verify/<token>` — it redirects to `/verify?success=1` on a valid token, `/verify?error=invalid` or `?error=expired` otherwise (see `src/app/api/verify/[token]/route.ts`).

## Step 4 — Sign in and exercise the tool

Navigate to `/signin`, sign in with the test account's email/password, then to `/tools/opportunity-finder` to confirm the questionnaire loads and (if testing that far) that a submission renders a prompt via `PromptDisplay`.

Check submission rows directly when needed instead of guessing from the UI:
```bash
sqlite3 data/submissions.db "SELECT id, user_id, business_type, created_at FROM submissions ORDER BY created_at DESC LIMIT 5;"
```

## Notes

- Never print `.env.local` secret *values* (reCAPTCHA secret, SendGrid key, etc.) to the terminal or into any file — checking whether a var is *set* is fine (`grep -c` or `[ -n "$VAR" ]`), echoing its value is not.
- This whole flow targets the local SQLite file only. Nothing here touches production — there's no path from this skill to the live db.
- If a run leaves the db in a state you don't want to keep, just redo Step 1.
