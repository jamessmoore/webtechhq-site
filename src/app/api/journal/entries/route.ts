import { timingSafeEqual } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { isPlainIsoDate, isValidYouTubeUrl, slugify, upsertJournalEntryBySlug } from "@/lib/journal";

// Machine-to-machine credential for Leo (the Media Pipeline agent) to POST
// new weekly Journal entries directly, replacing the manual
// `npm run import:journal-entry` step. Not tied to any user account - do
// not reuse the auth()/session pattern (src/app/api/admin/*) here, that's
// for human admin login via /admin.
function isAuthorized(request: NextRequest): boolean {
  const expected = process.env.JOURNAL_API_KEY;
  if (!expected) return false;

  const header = request.headers.get("authorization") ?? "";
  const match = header.match(/^Bearer (.+)$/);
  if (!match) return false;

  const provided = match[1];
  const expectedBuf = Buffer.from(expected);
  const providedBuf = Buffer.from(provided);
  if (expectedBuf.length !== providedBuf.length) return false;

  return timingSafeEqual(expectedBuf, providedBuf);
}

interface CreateJournalEntryBody {
  title?: unknown;
  content?: unknown;
  slug?: unknown;
  entryDate?: unknown;
  youtubeUrl?: unknown;
  entryType?: unknown;
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  let body: CreateJournalEntryBody;
  try {
    body = (await request.json()) as CreateJournalEntryBody;
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  // A literal JSON `null`/array/primitive body parses fine (JSON.parse
  // succeeds inside the try/catch above) but the destructuring right below
  // throws outside that try/catch, turning into an uncaught 500 instead of
  // a clean 400. Guard before destructuring (Argus, PR #97 review).
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Request body must be a JSON object." }, { status: 400 });
  }

  const { title, content, entryDate, slug: rawSlug, youtubeUrl, entryType } = body;

  if (typeof title !== "string" || !title.trim()) {
    return NextResponse.json({ error: "title is required and must be a non-empty string." }, { status: 400 });
  }
  if (typeof content !== "string" || !content.trim()) {
    return NextResponse.json({ error: "content is required and must be a non-empty string." }, { status: 400 });
  }

  // entry_date is stored and rendered as a bare "YYYY-MM-DD" string - see
  // lib/journal.ts's isPlainIsoDate doc comment for why this can't be
  // relaxed to "anything Date can parse" without risking a silent
  // "Invalid Date" on the live page (the exact risk Argus flagged in the
  // PR #96 review for a future API caller like this route).
  if (!isPlainIsoDate(entryDate)) {
    return NextResponse.json(
      { error: 'entryDate is required and must be a plain "YYYY-MM-DD" string (no time component).' },
      { status: 400 },
    );
  }

  // This route only ever writes the 'weekly' entry type (see moore-journal
  // skill / Leo's pipeline) - monthly-recap's format isn't decided yet and
  // has no import path anywhere. Reject rather than silently coercing, so
  // a caller that means to send a monthly-recap entry finds out now
  // instead of getting one silently mis-typed as weekly.
  if (entryType !== undefined && entryType !== "weekly") {
    return NextResponse.json(
      { error: 'entryType must be "weekly" (the only type this route supports); omit it to default to "weekly".' },
      { status: 400 },
    );
  }

  if (rawSlug !== undefined && typeof rawSlug !== "string") {
    return NextResponse.json({ error: "slug must be a string if provided." }, { status: 400 });
  }
  if (youtubeUrl !== undefined && typeof youtubeUrl !== "string") {
    return NextResponse.json({ error: "youtubeUrl must be a string if provided." }, { status: 400 });
  }
  // Rendered as a raw anchor href on the public entry page with only
  // rel="noopener noreferrer", which does not stop a javascript:/data: URI
  // from executing - restrict to real https:// YouTube links rather than
  // accepting any string (Argus, PR #97 review; stored-XSS risk if
  // JOURNAL_API_KEY were ever leaked).
  const trimmedYoutubeUrl = typeof youtubeUrl === "string" ? youtubeUrl.trim() : "";
  if (trimmedYoutubeUrl && !isValidYouTubeUrl(trimmedYoutubeUrl)) {
    return NextResponse.json(
      {
        error:
          "youtubeUrl must be a https://youtube.com, https://www.youtube.com, or https://youtu.be video URL.",
      },
      { status: 400 },
    );
  }

  // Always normalized through slugify(), whether the caller supplied an
  // explicit slug or we're deriving one from the title - a hand-supplied
  // slug still needs to be URL-safe and match the shape the public
  // /journal/[slug] route expects.
  const slug = slugify(typeof rawSlug === "string" && rawSlug.trim() ? rawSlug : title);
  if (!slug) {
    return NextResponse.json(
      { error: "Could not derive a non-empty slug from the provided slug/title." },
      { status: 400 },
    );
  }

  // Deliberate upsert-always design, matching scripts/import-journal-entry.js:
  // POSTing an already-existing slug updates that row in place rather than
  // erroring or creating a duplicate. This lets Leo re-post the same weekly
  // entry (e.g. to fix a typo) without a separate "edit" endpoint. It also
  // means a POST with a reused slug but a materially different title will
  // silently overwrite the original entry's content - intentional, not an
  // oversight; there is no separate create-only path.
  const entry = upsertJournalEntryBySlug({
    slug,
    title: title.trim(),
    content: content.trim(),
    entryDate,
    entryType: "weekly",
    youtubeUrl: trimmedYoutubeUrl || undefined,
  });

  return NextResponse.json({ entry, url: `/journal/${entry.slug}` }, { status: 201 });
}
