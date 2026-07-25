import { beforeAll, afterAll, describe, it, expect } from "vitest";
import { useTestDatabase } from "../testDb";

let cleanup: () => void;
let sitemap: typeof import("../../../src/app/sitemap").default;
let journal: typeof import("@/lib/journal");

beforeAll(async () => {
  ({ cleanup } = useTestDatabase());
  sitemap = (await import("../../../src/app/sitemap")).default;
  journal = await import("@/lib/journal");

  journal.createJournalEntry({
    slug: "first-entry",
    title: "First Entry",
    content: "Some body text.",
    entryDate: "2026-06-01",
  });
  journal.createJournalEntry({
    slug: "second-entry",
    title: "Second Entry",
    content: "More body text.",
    entryDate: "2026-06-15",
  });
});

afterAll(() => cleanup());

describe("sitemap()", () => {
  const getEntries = () => sitemap();
  const getPaths = () => getEntries().map((e) => e.url.replace("https://webtechhq.com", "") || "/");

  it("includes every public marketing page", () => {
    expect(getPaths()).toEqual(
      expect.arrayContaining(["/", "/about", "/services", "/use-cases", "/faq", "/portfolio", "/contact", "/privacy", "/terms"]),
    );
  });

  it("excludes gated and auth/utility routes", () => {
    // Every /tools/* route except the two public tools below is still
    // gated/excluded. Checked against a precise list of known gated
    // subpaths (plus a bare, exact-only "/tools" for the dashboard itself)
    // rather than a blanket "/tools" prefix match, since a startsWith match
    // on "/tools" would also (wrongly) flag /tools/opportunity-finder and
    // /tools/prompt-pilot, which are deliberately NOT excluded (see the
    // next test).
    const gatedOrUtility = [
      "/admin",
      "/tools/business-audit",
      "/tools/finish-signup",
      "/business-audit",
      "/signin",
      "/signup",
      "/forgot-password",
      "/reset-password",
      "/verify",
      "/share",
    ];
    const paths = getPaths();
    expect(paths).not.toContain("/tools");
    for (const path of gatedOrUtility) {
      expect(paths.some((p) => p === path || p.startsWith(`${path}/`))).toBe(false);
    }
  });

  it("includes Opportunity Finder and Prompt Pilot, which are usable anonymously and are now their own tool landing pages", () => {
    expect(getPaths()).toEqual(
      expect.arrayContaining(["/tools/opportunity-finder", "/tools/prompt-pilot"]),
    );
  });

  it("gives the homepage the highest priority", () => {
    const home = getEntries().find((e) => e.url === "https://webtechhq.com");
    expect(home?.priority).toBe(1);
  });

  it("includes one sitemap entry per journal entry, using its real entryDate as lastModified", () => {
    const entries = getEntries();

    const first = entries.find((e) => e.url === "https://webtechhq.com/journal/first-entry");
    const second = entries.find((e) => e.url === "https://webtechhq.com/journal/second-entry");

    expect(first).toBeDefined();
    expect(second).toBeDefined();
    expect(first?.lastModified).toEqual(new Date("2026-06-01"));
    expect(second?.lastModified).toEqual(new Date("2026-06-15"));
    expect(first?.changeFrequency).toBe("monthly");
    expect(first?.priority).toBe(0.5);
  });
});
