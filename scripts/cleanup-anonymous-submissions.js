#!/usr/bin/env node
// Deletes anonymous (never-claimed) Opportunity Finder and Prompt Pilot
// submissions older than a retention window. Both tools are usable without
// an account now (see src/proxy.ts) and write their result to the DB
// immediately with a null user_id, only getting linked to a real account if
// the visitor chooses to save it via the claim-token flow
// (src/app/api/tools/claim-submission/route.ts). A visitor who never comes
// back to claim it leaves an orphaned row behind forever otherwise - this
// script is the cleanup side of that tradeoff.
//
// Script-only, no cron wiring here - run by hand or from whatever scheduler
// ends up managing it. Mirrors scripts/seed-prompt-pilot-templates.js for
// connection/CLI style.
//
// Usage: npm run cleanup:anonymous-submissions
//   DATABASE_PATH=... to target a non-default db file
//   RETENTION_DAYS=... to override the default 30-day window
//   DRY_RUN=1 to log what would be deleted without deleting it

const path = require("path");
const fs = require("fs");
const Database = require("better-sqlite3");

const DB_PATH = process.env.DATABASE_PATH ?? "./data/submissions.db";
const RETENTION_DAYS = Number(process.env.RETENTION_DAYS ?? "30");
const DRY_RUN = process.env.DRY_RUN === "1";

const resolvedDb = path.resolve(process.cwd(), DB_PATH);

if (!fs.existsSync(resolvedDb)) {
  console.error(`Database not found: ${resolvedDb}`);
  process.exit(1);
}

if (!Number.isFinite(RETENTION_DAYS) || RETENTION_DAYS <= 0) {
  console.error(`RETENTION_DAYS must be a positive number, got: ${process.env.RETENTION_DAYS}`);
  process.exit(1);
}

const db = new Database(resolvedDb);
db.pragma("journal_mode = WAL");

const cutoff = new Date(Date.now() - RETENTION_DAYS * 24 * 60 * 60 * 1000).toISOString();

// user_id IS NULL is the "never claimed" condition - a claimed submission
// gets its user_id set by the claim endpoint and is excluded from cleanup
// from that point on, regardless of age.
const TABLES = ["submissions", "prompt_pilot_submissions"];

let totalDeleted = 0;

for (const table of TABLES) {
  const countRow = db
    .prepare(`SELECT COUNT(*) AS n FROM ${table} WHERE user_id IS NULL AND created_at < ?`)
    .get(cutoff);
  const count = countRow.n;

  if (DRY_RUN) {
    console.log(`[dry run] ${table}: would delete ${count} anonymous submission(s) older than ${cutoff}`);
    continue;
  }

  const result = db
    .prepare(`DELETE FROM ${table} WHERE user_id IS NULL AND created_at < ?`)
    .run(cutoff);
  console.log(`${table}: deleted ${result.changes} anonymous submission(s) older than ${cutoff}`);
  totalDeleted += result.changes;
}

if (!DRY_RUN) {
  console.log(`Done. Deleted ${totalDeleted} total anonymous submission(s) from ${resolvedDb}`);
}
