import { randomUUID } from "crypto";
import { getDb } from "./db";
import {
  type JournalEntry,
  type JournalEntryRow,
  type JournalEntryType,
  rowToJournalEntry,
} from "./types";

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
