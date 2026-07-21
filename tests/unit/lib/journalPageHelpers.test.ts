import { describe, it, expect } from "vitest";
import { monthKey, monthLabel, firstSentenceOf, groupByMonth } from "@/app/journal/page";
import type { JournalEntry } from "@/lib/types";

function makeEntry(overrides: Partial<JournalEntry>): JournalEntry {
  return {
    id: "id",
    slug: "slug",
    title: "Title",
    content: "Body.",
    entryDate: "2026-06-01",
    entryType: "weekly",
    createdAt: "2026-06-01T00:00:00.000Z",
    updatedAt: "2026-06-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("monthKey", () => {
  it("extracts a YYYY-MM key from a YYYY-MM-DD date", () => {
    expect(monthKey("2026-07-20")).toBe("2026-07");
  });
});

describe("monthLabel", () => {
  it("formats a month/year label in UTC regardless of local timezone", () => {
    expect(monthLabel("2026-01-15")).toBe("JANUARY 2026");
    expect(monthLabel("2026-12-01")).toBe("DECEMBER 2026");
  });
});

describe("firstSentenceOf", () => {
  it("returns just the first sentence of the first paragraph", () => {
    const content = "First sentence. Second sentence.\n\nSecond paragraph.";
    expect(firstSentenceOf(content)).toBe("First sentence.");
  });

  it("falls back to the whole first paragraph when there's no sentence-ending punctuation", () => {
    const content = "No terminal punctuation here\n\nSecond paragraph.";
    expect(firstSentenceOf(content)).toBe("No terminal punctuation here");
  });

  it("truncates a long first sentence to 220 characters with an ellipsis", () => {
    const longSentence = `${"a".repeat(250)}.`;
    const result = firstSentenceOf(longSentence);
    expect(result.endsWith("...")).toBe(true);
    expect(result.length).toBe(223);
  });
});

describe("groupByMonth", () => {
  it("groups consecutive same-month entries and preserves order", () => {
    const entries = [
      makeEntry({ slug: "a", entryDate: "2026-07-20" }),
      makeEntry({ slug: "b", entryDate: "2026-07-10" }),
      makeEntry({ slug: "c", entryDate: "2026-06-01" }),
    ];

    const groups = groupByMonth(entries);

    expect(groups).toHaveLength(2);
    expect(groups[0].key).toBe("2026-07");
    expect(groups[0].label).toBe("JULY 2026");
    expect(groups[0].entries.map((e) => e.slug)).toEqual(["a", "b"]);
    expect(groups[1].key).toBe("2026-06");
    expect(groups[1].entries.map((e) => e.slug)).toEqual(["c"]);
  });

  it("returns an empty array for no entries", () => {
    expect(groupByMonth([])).toEqual([]);
  });

  it("starts a new group for non-consecutive entries sharing the same month", () => {
    // groupByMonth only merges into the *running* group, so if entries aren't
    // pre-sorted by entry_date DESC (the DB query's contract), same-month
    // entries separated by a different month produce two separate groups
    // rather than being merged back together.
    const entries = [
      makeEntry({ slug: "a", entryDate: "2026-07-20" }),
      makeEntry({ slug: "b", entryDate: "2026-06-01" }),
      makeEntry({ slug: "c", entryDate: "2026-07-10" }),
    ];

    const groups = groupByMonth(entries);

    expect(groups).toHaveLength(3);
    expect(groups.map((g) => g.key)).toEqual(["2026-07", "2026-06", "2026-07"]);
  });
});
