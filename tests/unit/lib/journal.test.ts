import { beforeAll, afterAll, describe, it, expect } from "vitest";
import { useTestDatabase } from "../testDb";

let cleanup: () => void;
let journal: typeof import("@/lib/journal");

beforeAll(async () => {
  ({ cleanup } = useTestDatabase());
  journal = await import("@/lib/journal");
});

afterAll(() => cleanup());

describe("journal", () => {
  it("creates an entry and reads it back by slug", () => {
    const entry = journal.createJournalEntry({
      slug: "first-entry",
      title: "First Entry",
      content: "Some body text.",
      entryDate: "2026-06-01",
    });

    expect(entry.slug).toBe("first-entry");
    expect(entry.entryType).toBe("weekly");
    expect(entry.youtubeUrl).toBeUndefined();

    const fetched = journal.getJournalEntryBySlug("first-entry");
    expect(fetched?.id).toBe(entry.id);
    expect(fetched?.title).toBe("First Entry");
  });

  it("returns null for a slug that doesn't exist", () => {
    expect(journal.getJournalEntryBySlug("does-not-exist")).toBeNull();
  });

  it("createJournalEntry accepts an explicit entryType and youtubeUrl", () => {
    const entry = journal.createJournalEntry({
      slug: "recap-entry",
      title: "Recap Entry",
      content: "Recap body.",
      entryDate: "2026-06-15",
      entryType: "monthly-recap",
      youtubeUrl: "https://www.youtube.com/watch?v=abc123",
    });

    expect(entry.entryType).toBe("monthly-recap");
    expect(entry.youtubeUrl).toBe("https://www.youtube.com/watch?v=abc123");
  });

  it("upsertJournalEntryBySlug creates a new row when the slug doesn't exist yet", () => {
    const entry = journal.upsertJournalEntryBySlug({
      slug: "upserted-new",
      title: "Upserted New",
      content: "Body.",
      entryDate: "2026-06-20",
    });

    expect(entry.title).toBe("Upserted New");
    expect(journal.getJournalEntryBySlug("upserted-new")?.id).toBe(entry.id);
  });

  it("upsertJournalEntryBySlug updates the existing row in place instead of duplicating it", () => {
    const original = journal.upsertJournalEntryBySlug({
      slug: "upserted-existing",
      title: "Original Title",
      content: "Original body.",
      entryDate: "2026-06-25",
    });

    const updated = journal.upsertJournalEntryBySlug({
      slug: "upserted-existing",
      title: "Revised Title",
      content: "Revised body.",
      entryDate: "2026-06-26",
    });

    expect(updated.id).toBe(original.id);
    expect(updated.title).toBe("Revised Title");
    expect(updated.entryDate).toBe("2026-06-26");

    const all = journal.getAllJournalEntries().filter((e) => e.slug === "upserted-existing");
    expect(all).toHaveLength(1);
  });

  it("getAllJournalEntries orders entries by entry_date descending", () => {
    journal.createJournalEntry({
      slug: "order-a",
      title: "Order A",
      content: "Body.",
      entryDate: "2020-01-01",
    });
    journal.createJournalEntry({
      slug: "order-b",
      title: "Order B",
      content: "Body.",
      entryDate: "2030-01-01",
    });

    const all = journal.getAllJournalEntries();
    const indexA = all.findIndex((e) => e.slug === "order-a");
    const indexB = all.findIndex((e) => e.slug === "order-b");
    expect(indexB).toBeLessThan(indexA);
  });
});
