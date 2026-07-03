---
name: seed-admin-data
description: Populate the local dev database with a batch of fake users and questionnaire submissions so the admin panel (/admin, /admin/users/[id]) has realistic, varied data to review. Use when asked to seed fake users, populate test data for the admin panel, or make /admin reviewable without manually signing up multiple test accounts.
---

# Seed Admin Data

Runs `scripts/seed-fake-admin-data.js` to insert ~17 fake users (mixed verified/unverified, some with a questionnaire submission and some without) directly into `data/submissions.db`, so `/admin` and `/admin/users/[id]` have a realistic-looking dataset without driving the signup/verify/questionnaire flow by hand for every row. For testing a single account end-to-end instead (signup → verify → questionnaire), use `test-account-flow` — this skill is for bulk admin-panel review data, not flow verification.

## Running it

```bash
npm run seed:fake-admin-data
```

- Safe to re-run: it deletes any previously-seeded fake users (matched by the `.example.com` email suffix) before reinserting, so it never touches or duplicates real accounts.
- Every seeded account shares the password `TestPassword123`, in case you want to sign in as one of them individually rather than just the admin.
- Signup dates and submission dates are spread over the last several weeks (not all "today") so the admin table doesn't look artificially uniform.
- The dataset intentionally spans states the admin UI needs to render correctly: verified + submitted, verified + no submission (dropped off after signup), and unverified + no submission.

## Prerequisite — `ADMIN_EMAIL` must be set locally

`/admin` redirects to `/signin` unless the signed-in user's email matches `process.env.ADMIN_EMAIL` (`src/app/admin/page.tsx`, `src/app/admin/users/[id]/page.tsx`). This var is commonly **unset** in a fresh `.env.local` since it's not part of the checked-in `.env.example` defaults most local setups start from.

If `/admin` redirects even after seeding:
```bash
grep -c ADMIN_EMAIL .env.local
```
If that's `0`, add a line to `.env.local` pointing at whichever local account you'll sign in with as admin, e.g.:
```
ADMIN_EMAIL=admin@test.local
```
Then **restart the dev server** — `next dev` reads env vars at startup, so a running process won't pick up a `.env.local` edit until restarted (`pgrep -af "next dev"`, kill it, `npm run dev &`). If that account doesn't already exist or you don't know its password, create/reset it directly:
```bash
node -e "
const bcrypt = require('bcryptjs');
const Database = require('better-sqlite3');
const db = new Database('./data/submissions.db');
db.prepare('UPDATE users SET password_hash = ? WHERE email = ?')
  .run(bcrypt.hashSync('TestPassword123', 12), 'admin@test.local');
"
```

## Verifying

```bash
sqlite3 data/submissions.db "SELECT count(*) FROM users; SELECT count(*) FROM submissions;"
```
Then sign in as the `ADMIN_EMAIL` account and load `/admin` in the browser to confirm the stats row and users table populate as expected.

## Notes

- This only ever touches `data/submissions.db` (gitignored, local-only) — nothing here reaches production.
- The seed data lives in the script itself (`scripts/seed-fake-admin-data.js`), not a separate JSON file — unlike `seed-prompt-templates.js`, there's no real IP to keep out of git here, so it's committed directly.
- If you need to add more fake people or vary the data differently, edit the `people` array in the script directly and re-run.
