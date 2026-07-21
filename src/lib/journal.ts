import { randomUUID } from "crypto";
import { getDb } from "./db";
import {
  type JournalEntry,
  type JournalEntryRow,
  type JournalEntryType,
  rowToJournalEntry,
} from "./types";

/**
 * Same normalization as scripts/import-journal-entry.js's local slugify()
 * (that script is a standalone CLI on `require`, so it can't import this
 * module directly - keep the two in sync by hand if either changes). Used
 * both to derive a slug from a title and to normalize a caller-supplied
 * slug (e.g. from the Journal entries API route) into the same shape.
 */
export function slugify(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "") // strip diacritics after NFKD decomposition
    .replace(/['’]/g, "") // drop apostrophes rather than turning them into hyphens
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * entry_date is stored and rendered as a bare "YYYY-MM-DD" string (see
 * src/app/journal/page.tsx's monthKey/monthLabel and
 * src/app/journal/[slug]/page.tsx's formatEntryDate, both of which split it
 * on "-" without validating the shape). A full ISO timestamp would pass a
 * looser check but silently render as "Invalid Date" on the live page -
 * same failure mode scripts/import-journal-entry.js's isPlainIsoDate guard
 * exists to catch at import time. The API route needs the same guard,
 * since it can't trust a machine caller (Leo) any more than a hand-edited
 * video-meta.json.
 */
export function isPlainIsoDate(value: unknown): value is string {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

export function getAllJournalEntries(): JournalEntry[] {
  const db = getDb();
  const rows = db
    .prepare("SELECT * FROM journal_entries ORDER BY entry_date DESC")
    .all() as JournalEntryRow[];
  return rows.map(rowToJournalEntry);
}

export function getJournalEntryBySlug(slug: string): JournalEntry | null {
  const db = getDb();
  const row = db
    .prepare("SELECT * FROM journal_entries WHERE slug = ?")
    .get(slug) as JournalEntryRow | undefined;
  return row ? rowToJournalEntry(row) : null;
}

export function createJournalEntry(data: {
  slug: string;
  title: string;
  content: string;
  entryDate: string;
  entryType?: JournalEntryType;
  youtubeUrl?: string;
}): JournalEntry {
  const db = getDb();
  const id = randomUUID();
  const now = new Date().toISOString();

  db.prepare(`
    INSERT INTO journal_entries (
      id, slug, title, content, entry_date, entry_type, youtube_url, created_at, updated_at
    ) VALUES (
      ?, ?, ?, ?, ?, ?, ?, ?, ?
    )
  `).run(
    id,
    data.slug,
    data.title,
    data.content,
    data.entryDate,
    data.entryType ?? "weekly",
    data.youtubeUrl ?? null,
    now,
    now,
  );

  return getJournalEntryBySlug(data.slug)!;
}

/**
 * Insert-or-replace by slug. The import-journal-entry script needs this to
 * be safely re-runnable when James/Leo revise an already-imported entry
 * (same slug, updated content) without creating a duplicate row.
 */
export function upsertJournalEntryBySlug(data: {
  slug: string;
  title: string;
  content: string;
  entryDate: string;
  entryType?: JournalEntryType;
  youtubeUrl?: string;
}): JournalEntry {
  const db = getDb();
  const now = new Date().toISOString();
  const existing = getJournalEntryBySlug(data.slug);

  if (existing) {
    db.prepare(`
      UPDATE journal_entries
      SET title = ?, content = ?, entry_date = ?, entry_type = ?, youtube_url = ?, updated_at = ?
      WHERE slug = ?
    `).run(
      data.title,
      data.content,
      data.entryDate,
      data.entryType ?? "weekly",
      data.youtubeUrl ?? null,
      now,
      data.slug,
    );
    return getJournalEntryBySlug(data.slug)!;
  }

  return createJournalEntry(data);
}
