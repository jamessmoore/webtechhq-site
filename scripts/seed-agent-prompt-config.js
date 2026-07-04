#!/usr/bin/env node
// Seeds the agent_prompt_config table from a gitignored local JSON file.
// System prompts and tool-schema steering text are core IP and must never
// be committed — see data/seeds/agent-prompt-config.example.json for the
// shape, and copy it to agent-prompt-config.local.json (gitignored) with
// real content.
//
// Usage: npm run seed:agent-prompt-config
//   DATABASE_PATH=... to target a non-default db file
//   AGENT_PROMPT_CONFIG_SEED_PATH=... to target a non-default seed file

const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
const Database = require("better-sqlite3");

const DB_PATH = process.env.DATABASE_PATH ?? "./data/submissions.db";
const SEED_PATH =
  process.env.AGENT_PROMPT_CONFIG_SEED_PATH ?? "./data/seeds/agent-prompt-config.local.json";

const resolvedDb = path.resolve(process.cwd(), DB_PATH);
const resolvedSeed = path.resolve(process.cwd(), SEED_PATH);

if (!fs.existsSync(resolvedSeed)) {
  console.error(`Seed file not found: ${resolvedSeed}`);
  console.error(
    "Copy data/seeds/agent-prompt-config.example.json to that path and fill in the real system prompt and tool schema.",
  );
  process.exit(1);
}

const seed = JSON.parse(fs.readFileSync(resolvedSeed, "utf-8"));

if (!Array.isArray(seed.configs)) {
  console.error('Seed file must have a "configs" array.');
  process.exit(1);
}

fs.mkdirSync(path.dirname(resolvedDb), { recursive: true });

const db = new Database(resolvedDb);
db.pragma("journal_mode = WAL");

// Idempotent, matches src/lib/db.ts — safe to run standalone before the app
// has ever created this table.
db.exec(`
  CREATE TABLE IF NOT EXISTS agent_prompt_config (
    id                TEXT PRIMARY KEY,
    config_key        TEXT NOT NULL UNIQUE,
    version           INTEGER NOT NULL DEFAULT 1,
    system_prompt     TEXT NOT NULL,
    tool_schema_json  TEXT NOT NULL,
    created_at        TEXT NOT NULL,
    updated_at        TEXT NOT NULL
  );
`);

const now = new Date().toISOString();

const upsert = db.prepare(`
  INSERT INTO agent_prompt_config
    (id, config_key, version, system_prompt, tool_schema_json, created_at, updated_at)
  VALUES (?, ?, ?, ?, ?, ?, ?)
  ON CONFLICT(config_key) DO UPDATE SET
    version = excluded.version,
    system_prompt = excluded.system_prompt,
    tool_schema_json = excluded.tool_schema_json,
    updated_at = excluded.updated_at
`);

const replaceConfigs = db.transaction((configs) => {
  for (const c of configs) {
    upsert.run(
      crypto.randomUUID(),
      c.config_key,
      c.version ?? 1,
      c.system_prompt,
      JSON.stringify(c.tool_schema),
      now,
      now,
    );
  }
});

replaceConfigs(seed.configs);

console.log(`Seeded ${seed.configs.length} agent prompt config(s) into ${resolvedDb}`);
