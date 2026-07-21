import { beforeAll, afterAll, beforeEach, afterEach, describe, it, expect } from "vitest";
import { NextRequest } from "next/server";
import { useTestDatabase } from "../testDb";

let cleanup: () => void;
let POST: typeof import("../../../src/app/api/journal/entries/route").POST;
let journal: typeof import("@/lib/journal");

const API_KEY = "test-journal-api-key-123";
let originalKey: string | undefined;

beforeAll(async () => {
  ({ cleanup } = useTestDatabase());
  ({ POST } = await import("@/app/api/journal/entries/route"));
  journal = await import("@/lib/journal");
});

afterAll(() => cleanup());

beforeEach(() => {
  originalKey = process.env.JOURNAL_API_KEY;
  process.env.JOURNAL_API_KEY = API_KEY;
});

afterEach(() => {
  process.env.JOURNAL_API_KEY = originalKey;
});

function request(body: unknown, headers: Record<string, string> = { Authorization: `Bearer ${API_KEY}` }) {
  return new NextRequest("http://localhost:3000/api/journal/entries", {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify(body),
  });
}

const validBody = {
  title: "Rosie Was Onto Something",
  content: "This week I learned something I didn't expect.",
  entryDate: "2026-07-02",
  youtubeUrl: "https://www.youtube.com/watch?v=abc123",
};

describe("POST /api/journal/entries", () => {
  it("creates a new weekly entry with a valid key and body", async () => {
    const res = await POST(request(validBody));
    expect(res.status).toBe(201);

    const json = await res.json();
    expect(json.entry.slug).toBe("rosie-was-onto-something");
    expect(json.entry.entryType).toBe("weekly");
    expect(json.entry.youtubeUrl).toBe(validBody.youtubeUrl);
    expect(json.url).toBe("/journal/rosie-was-onto-something");

    const stored = journal.getJournalEntryBySlug("rosie-was-onto-something");
    expect(stored?.title).toBe(validBody.title);
  });

  it("returns 401 when the Authorization header is missing", async () => {
    const res = await POST(request(validBody, {}));
    expect(res.status).toBe(401);
  });

  it("returns 401 when the bearer token doesn't match JOURNAL_API_KEY", async () => {
    const res = await POST(request(validBody, { Authorization: "Bearer wrong-key" }));
    expect(res.status).toBe(401);
  });

  it("returns 401 when JOURNAL_API_KEY isn't configured at all", async () => {
    delete process.env.JOURNAL_API_KEY;
    const res = await POST(request(validBody));
    expect(res.status).toBe(401);
  });

  it("returns 400 when title is missing", async () => {
    const { title: _omit, ...rest } = validBody;
    const res = await POST(request(rest));
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toMatch(/title/i);
  });

  it("returns 400 when content is missing", async () => {
    const { content: _omit, ...rest } = validBody;
    const res = await POST(request(rest));
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toMatch(/content/i);
  });

  it("returns 400 when entryDate is missing", async () => {
    const { entryDate: _omit, ...rest } = validBody;
    const res = await POST(request(rest));
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toMatch(/entryDate/i);
  });

  it("returns 400 when entryDate is a full ISO timestamp instead of a plain date", async () => {
    const res = await POST(request({ ...validBody, slug: "bad-date-entry", entryDate: "2026-07-02T14:30:00Z" }));
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toMatch(/entryDate/i);
    expect(journal.getJournalEntryBySlug("bad-date-entry")).toBeNull();
  });

  it("returns 400 when entryType is provided and isn't 'weekly'", async () => {
    const res = await POST(request({ ...validBody, slug: "recap-attempt", entryType: "monthly-recap" }));
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toMatch(/entryType/i);
    expect(journal.getJournalEntryBySlug("recap-attempt")).toBeNull();
  });

  it("re-posting the same slug upserts in place instead of duplicating", async () => {
    const first = await POST(request({ ...validBody, slug: "typo-fix", title: "Original Title" }));
    expect(first.status).toBe(201);

    const second = await POST(request({ ...validBody, slug: "typo-fix", title: "Fixed Title" }));
    expect(second.status).toBe(201);
    const secondJson = await second.json();
    expect(secondJson.entry.title).toBe("Fixed Title");

    const all = journal.getAllJournalEntries().filter((e) => e.slug === "typo-fix");
    expect(all).toHaveLength(1);
    expect(all[0].title).toBe("Fixed Title");
  });

  it("derives the slug from the title when no slug is provided", async () => {
    const res = await POST(request({ ...validBody, title: "Not the Best Barbecue" }));
    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json.entry.slug).toBe("not-the-best-barbecue");
  });
});
