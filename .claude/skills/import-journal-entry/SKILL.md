---
name: import-journal-entry
description: Import one James/Leo-approved Journal entry from a dated media-pipeline folder into the journal_entries table, so it appears on webtechhq.com/journal. Use whenever Leo (the media-pipeline content specialist) hands off a newly-approved journal entry, or when James revises the text of an already-imported one.
---

# Import Journal Entry

`webtechhq.com/journal` reads from the `journal_entries` table (`src/lib/db.ts`, `src/lib/journal.ts`), not from files. Every entry Leo produces via the `moore-journal` skill has to be imported into the dev/prod database before it's visible on the site. This skill is that import step.

## When this runs — and when it doesn't

- **Input:** a dated folder under `~/MooreSolutions/media-pipeline/<folder>/journal/entry.md`.
- **Precondition:** James has already explicitly approved that entry's text as final. That approval happens upstream, inside the `moore-journal` skill itself, when James signs off on a draft iteration. This skill's job starts *after* that sign-off — never run it against a draft James hasn't approved yet, and never treat "Leo produced a file" alone as approval.

## Running it

```bash
npm run import:journal-entry -- <folder-name>
```

`<folder-name>` is the media-pipeline folder name exactly as it appears on disk (e.g. `2026-07-03` or `20260707` — both date formats are handled, see below).

- `MEDIA_PIPELINE_DIR=...` to point at a non-default media-pipeline root (default `~/MooreSolutions/media-pipeline`).
- `DATABASE_PATH=...` to target a non-default db file (same convention as the other `scripts/seed-*.js` scripts).

Safe to re-run: it's an **upsert by slug**, so running it again after James revises an already-imported entry updates that row in place instead of creating a duplicate. This matters because Leo/James's iteration loop means an entry can get touched again after its first import.

## Extraction rules — read these before assuming the obvious field mapping is right

`entry.md` has two different quoted titles in it, and they are **not interchangeable**:

- The file's own top-level header, `# Journal Entry — "<hook>" (Video #N)` — this quotes the **video's hook/thumbnail kicker**, not the essay's title. Do not use this string as the journal entry's title.
- The `## Draft — "<title>" (~N words)` heading further down — **this is the actual essay title**, and what this script extracts.

This distinction is easy to miss because on some entries the two strings happen to coincide (e.g. `2026-07-03`, "Not the Best Barbecue"), which can look like confirmation that the header line is the source of truth. It isn't, reliably — on `2026-07-02` the header quotes "STOP WASTING YOUR TIME" while the actual essay (and its Draft heading) is "Rosie Was Onto Something"; on `20260707` the header quotes "AI, But Where? Start Here." while the essay is "I'm a Driver, Not a Mechanic". Always pull the title from the `## Draft — ...` heading, never from the file's own `# Journal Entry — ...` header.

Other extraction rules the script applies:
- **Body content** is everything under the `## Draft — ...` heading (up to the next heading, if any), stripped of the draft/word-count wrapper, paragraphs preserved.
- **The Draft heading's `(~N words)` suffix must not leak into the body.** The heading line is `## Draft — "<title>" (~N words)` — the word-count suffix comes *after* the closing quote, on the same line. The title-match regex only captures up through the closing quote, so body extraction must skip to the end of the whole heading line (not just the end of the regex match) or the word-count text becomes the body's first "paragraph" — and from there, the meta description too, since `excerptOf()` takes the first paragraph. This shipped once already (surfaced as "(~680 words)" rendering as real body text on `/journal/not-the-best-barbecue` and in its `<meta name="description">`) before being caught and fixed; it passed lint/typecheck/build/tests cleanly the whole time because "(~680 words)" is syntactically valid content, just wrong content. Re-run the import for any entry you suspect was affected — it's an upsert by slug, so re-importing fixes already-seeded rows in place.
- **`slug`** is derived from the extracted title (kebab-case, apostrophes dropped rather than turned into hyphens, e.g. "I'm a Driver, Not a Mechanic" → `im-a-driver-not-a-mechanic`).
- **`title.txt`** (when present) is the video's own YouTube title and is never used for anything here — it's a third, distinct string from both quoted titles in `entry.md`.
- **`entry_type`** is always set to `'weekly'` by this script. It only ever handles Leo's HEIT-pipeline output, which is exclusively the weekly category. The `monthly-recap` category (a founder-progress update, format not yet decided as of this writing) needs its own import path when that format exists — don't repurpose this script for it.

### `entry_date` and `youtube_url` — prefer `video-meta.json` once it exists

Once a flagship video is actually posted to YouTube, a `video-meta.json` file lands in that dated folder as the source of truth for that video's YouTube details:
```json
{
  "youtube_url": "https://www.youtube.com/watch?v=VIDEO_ID",
  "youtube_video_id": "VIDEO_ID",
  "youtube_title": "...",
  "posted_at": "YYYY-MM-DD"
}
```
When `<folder>/video-meta.json` exists, this script prefers it over both fallbacks:
- **`entry_date`** comes from its `posted_at` (when the content actually went live — the meaningful public-facing date for a journal entry) rather than the folder-name date (just when the production folder was created).
- **`youtube_url`** comes from its `youtube_url` directly, no need to go hunting through `description.txt`.

If `video-meta.json` doesn't exist yet for a folder (video not posted yet, or the folder predates this convention), fall back to:
- **`entry_date`** derived from the folder name. Both `YYYY-MM-DD` and `YYYYMMDD` formats are accepted and normalized to ISO (`YYYY-MM-DD`).
- **`youtube_url`** left `null` unless a real `youtube.com/watch` or `youtu.be` URL is found in `description.txt` or `entry.md`. The `webtechhq.com/signup?...` and `webtechhq.com/yt/<slug>` links that show up in `description.txt` are **placeholder site-redirects to the Opportunity Finder, not the video itself** — they don't count, even though they live in the same field.

Since imports are re-runnable (upsert by slug), re-run this script for a folder once its `video-meta.json` lands to pick up the real date/URL on an entry that was originally imported without one.

## Verifying

```bash
sqlite3 data/submissions.db "SELECT slug, title, entry_date, entry_type, youtube_url FROM journal_entries ORDER BY entry_date DESC;"
```

Then load `/journal` and `/journal/<slug>` in the dev server to confirm the entry renders with the right title, date, and body paragraphs, and that `youtube_url` only produces a "WATCH THE VIDEO" link when one was genuinely found.

## Notes

- This only ever touches the local `data/submissions.db` you point it at (gitignored) — it has no path to production on its own; a production import is a separate, explicit action.
- The script duplicates the `journal_entries` `CREATE TABLE IF NOT EXISTS`/index statements from `src/lib/db.ts` so it can run standalone even before the app's own `migrate()` has ever created the table (same pattern as `seed-prompt-templates.js`). If you change the schema in `src/lib/db.ts`, mirror the change here too.
