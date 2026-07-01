---
name: db-change
description: Add a new table, column, or index to the SQLite database in src/lib/db.ts, following this repo's additive migration pattern. Use when adding fields to submissions/users or introducing a new table in webtechhq-site.
---

# DB Change

This repo has no migration framework — `src/lib/db.ts` runs an idempotent `migrate()` function on every `getDb()` call. All schema changes must stay additive and safe to re-run against an existing production `data/submissions.db`.

## Pattern to follow

**New table:** add a `CREATE TABLE IF NOT EXISTS` block (plus any `CREATE INDEX IF NOT EXISTS`) inside the main `db.exec(...)` template string in `migrate()`. This is safe on both fresh and existing databases.

**New column on an existing table (`users` or `submissions`):** existing tables already have rows in production, so new columns must go through the backfill guard at the bottom of `migrate()`:
```ts
const columns = db.prepare("PRAGMA table_info(<table>)").all() as { name: string }[];
const columnNames = new Set(columns.map((c) => c.name));
if (!columnNames.has("<new_column>")) {
  db.exec("ALTER TABLE <table> ADD COLUMN <new_column> <TYPE>");
  // + CREATE INDEX IF NOT EXISTS if the column needs one
}
```
Note `users` and `submissions` each need their own `PRAGMA table_info` check — don't assume one guard covers both.

**Never do this:**
- `DROP TABLE` / `DROP COLUMN` / column renames / type changes on existing columns — SQLite's `ALTER TABLE` doesn't support most of these safely, and it would touch live data. If a change genuinely requires this, stop and confirm with the user first rather than writing it.
- Adding a `NOT NULL` column without a `DEFAULT` — existing rows will violate it on the next write path that doesn't set it.

## After changing the schema

Update in the same change (these are not auto-derived):
1. `src/lib/types.ts` — add the field to both the domain type (e.g. `Submission`) and its `*Row` DB type, and update the corresponding `rowTo*` mapper function.
2. The relevant data-access file (`src/lib/submissions.ts` or `src/lib/users.ts`) — plumb the new field through the relevant `INSERT`/`SELECT`/`UPDATE` statements and function signatures.
3. Any API route or component that constructs/reads that object (e.g. `src/app/api/questionnaire/submit/route.ts`) if the new field is user-facing.

## Verifying

Delete or point `DATABASE_PATH` at a scratch file and run `npm run dev`, then exercise the affected flow — `migrate()` runs automatically on first `getDb()` call, so a fresh DB will pick up the new schema immediately. Confirm an *existing* DB file (with data) also still opens cleanly and picks up the backfill, since that's the actual production upgrade path.
