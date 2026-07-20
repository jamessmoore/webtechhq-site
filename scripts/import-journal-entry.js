#!/usr/bin/env node
// Imports one James/Leo-approved Journal entry from a dated media-pipeline
// folder into the journal_entries table.
//
// Usage: npm run import:journal-entry -- <folder-name>
//   MEDIA_PIPELINE_DIR=... to target a non-default media-pipeline root
//     (default: ~/MooreSolutions/media-pipeline)
//   DATABASE_PATH=... to target a non-default db file
//
// See .claude/skills/import-journal-entry/SKILL.md for the full contract
// (what "approved" means, why title comes from the Draft heading and not
// the file's own header line, youtube_url rules, etc).
//
// Safe to re-run: upserts by slug (derived from the extracted title), so
// re-running against a revised entry.md updates the existing row instead
// of duplicating it.

const os = require("os");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
const Database = require("better-sqlite3");

const folderName = process.argv[2];
if (!folderName) {
  console.error("Usage: npm run import:journal-entry -- <folder-name>");
  process.exit(1);
}

const MEDIA_PIPELINE_DIR =
  process.env.MEDIA_PIPELINE_DIR ?? path.join(os.homedir(), "MooreSolutions", "media-pipeline");
const DB_PATH = process.env.DATABASE_PATH ?? "./data/submissions.db";

const entryDir = path.join(MEDIA_PIPELINE_DIR, folderName, "journal");
const entryPath = path.join(entryDir, "entry.md");

if (!fs.existsSync(entryPath)) {
  console.error(`No journal entry found at ${entryPath}`);
  console.error(
    "Expected <folder>/journal/entry.md, written by the moore-journal skill and explicitly approved by James before this script ever runs.",
  );
  process.exit(1);
}

const raw = fs.readFileSync(entryPath, "utf-8");

// ─── Extract title + body from the "## Draft — "<title>" (~N words)" heading ───
//
// entry.md's own top-level `# Journal Entry — "<video hook/kicker>" (Video #N)`
// header line is NOT the journal title, it's the video's hook/thumbnail
// kicker, a different string serving a different purpose (confirmed against
// real entries: e.g. 2026-07-02's header quotes "STOP WASTING YOUR TIME" but
// the actual essay, and its Draft heading, is "Rosie Was Onto Something").
// The real title lives in the "## Draft — ..." heading. Support either an
// em-dash or hyphen between "Draft" and the quoted title, and either curly
// or straight quotes, since these are hand-authored markdown files.
//
// The heading line itself doesn't end at the closing quote — it continues
// with a "(~N words)" word-count suffix (e.g. `## Draft — "Not the Best
// Barbecue" (~680 words)`). The trailing `.*` below consumes the rest of
// that line so the word-count suffix isn't accidentally sliced into the
// body as its own leading paragraph (and from there into the meta
// description via excerptOf(), which takes the first paragraph). This bit
// production data once already: got past lint/typecheck/build/tests
// because "(~680 words)" is valid content, just wrong content.
const draftHeadingPattern = /^##\s*Draft\s*[-—]\s*["“]([^"”]+)["”].*$/m;
const draftMatch = raw.match(draftHeadingPattern);
if (!draftMatch) {
  console.error(`Could not find a "## Draft — "<title>"" heading in ${entryPath}`);
  process.exit(1);
}
const title = draftMatch[1].trim();

// Body is everything after the full Draft heading line (including its
// word-count suffix), up to the next top-level/second-level heading (if
// any) or end of file, stripped of the leading/trailing whitespace the
// draft/word-count wrapper leaves behind.
const bodyStart = draftMatch.index + draftMatch[0].length;
const rest = raw.slice(bodyStart);
const nextHeadingMatch = rest.match(/^\s*\n##\s/m);
const bodyRaw = nextHeadingMatch ? rest.slice(0, nextHeadingMatch.index) : rest;
const content = bodyRaw
  .split(/\n\s*\n/)
  .map((p) => p.trim())
  .filter(Boolean)
  .join("\n\n");

if (!content) {
  console.error(`Draft heading found in ${entryPath}, but no body content followed it.`);
  process.exit(1);
}

// ─── slug ───
function slugify(str) {
  return str
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "") // strip diacritics after NFKD decomposition
    .replace(/['’]/g, "") // drop apostrophes rather than turning them into hyphens
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
const slug = slugify(title);
if (!slug) {
  console.error(`Extracted title "${title}" produced an empty slug.`);
  process.exit(1);
}

// ─── video-meta.json — the source of truth once a video is posted ───
//
// After a flagship video is actually posted to YouTube, a `video-meta.json`
// file lands in that dated folder (see .claude/skills/import-journal-entry/
// SKILL.md for the full shape). When present, it wins over both of the
// fallbacks below: its `youtube_url` is used as-is (no need to go hunting
// through description.txt), and its `posted_at` is used as `entry_date`
// instead of the folder-name date, since "when this actually went live"
// is the more meaningful public-facing date for a journal entry than "when
// the production folder was created".
const videoMetaPath = path.join(MEDIA_PIPELINE_DIR, folderName, "video-meta.json");
let videoMeta = null;
if (fs.existsSync(videoMetaPath)) {
  try {
    videoMeta = JSON.parse(fs.readFileSync(videoMetaPath, "utf-8"));
  } catch (err) {
    console.error(`Failed to parse ${videoMetaPath}: ${err.message}`);
    process.exit(1);
  }
}

// ─── entry_date ───
// Prefer video-meta.json's posted_at; fall back to the dated folder name
// (accepts YYYY-MM-DD as-is, or YYYYMMDD normalized to ISO) if the video
// hasn't been posted yet / video-meta.json doesn't exist.
function normalizeFolderDate(name) {
  if (/^\d{4}-\d{2}-\d{2}$/.test(name)) return name;
  const compact = name.match(/^(\d{4})(\d{2})(\d{2})$/);
  if (compact) return `${compact[1]}-${compact[2]}-${compact[3]}`;
  return null;
}
const entryDate = videoMeta?.posted_at ?? normalizeFolderDate(folderName);
if (!entryDate) {
  console.error(
    `Folder name "${folderName}" isn't YYYY-MM-DD or YYYYMMDD, and no video-meta.json with posted_at exists, can't derive entry_date.`,
  );
  process.exit(1);
}

// ─── youtube_url ───
// Prefer video-meta.json's youtube_url. Otherwise, fall back to scanning
// description.txt/entry.md for a real watch URL — but the webtechhq.com/signup
// and webtechhq.com/yt/<slug> links that show up in description.txt are
// placeholder site-redirects, not the video itself, and don't count.
function findYouTubeUrl(dir) {
  const candidates = ["description.txt", "entry.md"];
  const youtubePattern =
    /https?:\/\/(www\.)?(youtube\.com\/watch\?v=[\w-]+|youtu\.be\/[\w-]+)[^\s)"']*/;
  for (const file of candidates) {
    const filePath = path.join(dir, file);
    if (!fs.existsSync(filePath)) continue;
    const match = fs.readFileSync(filePath, "utf-8").match(youtubePattern);
    if (match) return match[0];
  }
  return null;
}
const youtubeUrl = videoMeta?.youtube_url ?? findYouTubeUrl(path.join(MEDIA_PIPELINE_DIR, folderName));

// ─── DB ───
const resolvedDb = path.resolve(process.cwd(), DB_PATH);
fs.mkdirSync(path.dirname(resolvedDb), { recursive: true });

const db = new Database(resolvedDb);
db.pragma("journal_mode = WAL");

// Idempotent, matches src/lib/db.ts — safe to run standalone even if the
// app's own migrate() hasn't created this table yet.
db.exec(`
  CREATE TABLE IF NOT EXISTS journal_entries (
    id           TEXT PRIMARY KEY,
    slug         TEXT NOT NULL UNIQUE,
    title        TEXT NOT NULL,
    content      TEXT NOT NULL,
    entry_date   TEXT NOT NULL,
    entry_type   TEXT NOT NULL DEFAULT 'weekly',
    youtube_url  TEXT,
    created_at   TEXT NOT NULL,
    updated_at   TEXT NOT NULL
  );

  CREATE INDEX IF NOT EXISTS idx_journal_entries_slug
    ON journal_entries (slug);

  CREATE INDEX IF NOT EXISTS idx_journal_entries_entry_date
    ON journal_entries (entry_date);
`);

const now = new Date().toISOString();
const existing = db.prepare("SELECT id FROM journal_entries WHERE slug = ?").get(slug);

// This script only ever imports from Leo's media-pipeline pipeline, which
// is exclusively the 'weekly' category (see moore-journal skill) — the
// monthly-recap category, when its format is decided, will need its own
// import path, not this one.
if (existing) {
  db.prepare(`
    UPDATE journal_entries
    SET title = ?, content = ?, entry_date = ?, entry_type = 'weekly', youtube_url = ?, updated_at = ?
    WHERE slug = ?
  `).run(title, content, entryDate, youtubeUrl, now, slug);
  console.log(`Updated existing journal entry "${title}" (slug: ${slug})`);
} else {
  db.prepare(`
    INSERT INTO journal_entries (
      id, slug, title, content, entry_date, entry_type, youtube_url, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, 'weekly', ?, ?, ?)
  `).run(crypto.randomUUID(), slug, title, content, entryDate, youtubeUrl, now, now);
  console.log(`Imported new journal entry "${title}" (slug: ${slug})`);
}

console.log(`  entry_date: ${entryDate}`);
console.log(`  youtube_url: ${youtubeUrl ?? "(none found)"}`);
console.log(`  ${content.split(/\n\s*\n/).length} paragraph(s), into ${resolvedDb}`);
