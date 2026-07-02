#!/usr/bin/env node
// Seeds the prompt_template table from a gitignored local JSON file.
// Template copy is core IP and must never be committed — see
// data/seeds/prompt-templates.example.json for the shape, and copy it to
// prompt-templates.local.json (gitignored) with real content.
//
// Usage: npm run seed:prompt-templates
//   DATABASE_PATH=... to target a non-default db file
//   PROMPT_TEMPLATE_SEED_PATH=... to target a non-default seed file

const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
const Database = require("better-sqlite3");

const DB_PATH = process.env.DATABASE_PATH ?? "./data/submissions.db";
const SEED_PATH =
  process.env.PROMPT_TEMPLATE_SEED_PATH ?? "./data/seeds/prompt-templates.local.json";

const resolvedDb = path.resolve(process.cwd(), DB_PATH);
const resolvedSeed = path.resolve(process.cwd(), SEED_PATH);

if (!fs.existsSync(resolvedSeed)) {
  console.error(`Seed file not found: ${resolvedSeed}`);
  console.error(
    "Copy data/seeds/prompt-templates.example.json to that path and fill in real template text.",
  );
  process.exit(1);
}

const seed = JSON.parse(fs.readFileSync(resolvedSeed, "utf-8"));

if (!Array.isArray(seed.templates)) {
  console.error('Seed file must have a "templates" array.');
  process.exit(1);
}

const fallbackCount = seed.templates.filter((t) => t.is_fallback).length;
if (fallbackCount !== 1) {
  console.error(`Expected exactly one is_fallback template, found ${fallbackCount}.`);
  process.exit(1);
}

fs.mkdirSync(path.dirname(resolvedDb), { recursive: true });

const db = new Database(resolvedDb);
db.pragma("journal_mode = WAL");

// Idempotent, matches src/lib/db.ts — safe to run standalone before the app
// has ever created these tables.
db.exec(`
  CREATE TABLE IF NOT EXISTS prompt_template (
    id                  TEXT PRIMARY KEY,
    trigger_repetitive  TEXT,
    trigger_compliance  TEXT,
    trigger_data        TEXT,
    is_fallback         INTEGER NOT NULL DEFAULT 0,
    version             INTEGER NOT NULL DEFAULT 1,
    template_text       TEXT NOT NULL,
    created_at          TEXT NOT NULL,
    updated_at          TEXT NOT NULL
  );

  CREATE UNIQUE INDEX IF NOT EXISTS idx_prompt_template_trigger
    ON prompt_template (trigger_repetitive, trigger_compliance, trigger_data)
    WHERE is_fallback = 0;

  CREATE TABLE IF NOT EXISTS prompt_template_eval (
    id            TEXT PRIMARY KEY,
    template_id   TEXT NOT NULL REFERENCES prompt_template (id) ON DELETE CASCADE,
    model_tested  TEXT NOT NULL,
    rubric        TEXT NOT NULL,
    notes         TEXT,
    evaluated_at  TEXT NOT NULL
  );

  CREATE INDEX IF NOT EXISTS idx_prompt_template_eval_template_id
    ON prompt_template_eval (template_id);
`);

const now = new Date().toISOString();

const replaceTemplates = db.transaction((templates) => {
  db.prepare("DELETE FROM prompt_template").run();
  const stmt = db.prepare(`
    INSERT INTO prompt_template
      (id, trigger_repetitive, trigger_compliance, trigger_data, is_fallback, version, template_text, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  for (const t of templates) {
    stmt.run(
      crypto.randomUUID(),
      t.trigger_repetitive ?? null,
      t.trigger_compliance ?? null,
      t.trigger_data ?? null,
      t.is_fallback ? 1 : 0,
      t.version ?? 1,
      t.template_text,
      now,
      now,
    );
  }
});

replaceTemplates(seed.templates);

console.log(`Seeded ${seed.templates.length} prompt templates into ${resolvedDb}`);
