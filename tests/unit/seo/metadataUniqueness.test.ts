import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";

// Extracted by parsing source text rather than importing the page modules
// on purpose: several public pages (e.g. contact/page.tsx) import
// server-only modules (auth, db) at module scope, which isn't safe to
// evaluate in a plain vitest node environment. Reading the `metadata`
// export's `title`/`description` string literals out of the source is
// enough to catch the regression this test exists for: a page that
// forgets to override title/description and silently inherits the root
// layout's.
const APP_DIR = path.resolve(__dirname, "../../../src/app");

// The genuinely public, statically-rendered pages. Kept in sync with
// sitemap.ts / sitemap.test.ts. The root layout is included because the
// homepage (src/app/page.tsx) exports no metadata of its own and so is
// effectively represented by the layout's title/description.
const PUBLIC_PAGES: { route: string; file: string }[] = [
  { route: "/ (root layout)", file: "layout.tsx" },
  { route: "/about", file: "about/page.tsx" },
  { route: "/services", file: "services/page.tsx" },
  { route: "/use-cases", file: "use-cases/page.tsx" },
  { route: "/portfolio", file: "portfolio/page.tsx" },
  { route: "/contact", file: "contact/page.tsx" },
  { route: "/privacy", file: "privacy/page.tsx" },
  { route: "/terms", file: "terms/page.tsx" },
];

function extractMetadataBlock(source: string): string {
  const start = source.indexOf("export const metadata");
  if (start === -1) throw new Error("no `export const metadata` export found");
  // Find the matching closing brace for the object literal that follows.
  const braceStart = source.indexOf("{", start);
  let depth = 0;
  for (let i = braceStart; i < source.length; i++) {
    if (source[i] === "{") depth++;
    if (source[i] === "}") depth--;
    if (depth === 0) return source.slice(braceStart, i + 1);
  }
  throw new Error("unbalanced braces in metadata export");
}

function extractStringField(block: string, field: string): string | undefined {
  const pattern = new RegExp(`${field}:\\s*\\n?\\s*(['"])((?:\\\\.|(?!\\1).)*)\\1`, "s");
  const match = block.match(pattern);
  return match?.[2];
}

describe("public page metadata uniqueness", () => {
  const parsed = PUBLIC_PAGES.map(({ route, file }) => {
    const source = fs.readFileSync(path.join(APP_DIR, file), "utf-8");
    const block = extractMetadataBlock(source);
    return {
      route,
      title: extractStringField(block, "title"),
      description: extractStringField(block, "description"),
    };
  });

  it("every public page declares its own title and description (sanity check the parse)", () => {
    for (const page of parsed) {
      expect(page.title, `${page.route} has no parsable title`).toBeTruthy();
      expect(page.description, `${page.route} has no parsable description`).toBeTruthy();
    }
  });

  it("no two public pages share an identical title", () => {
    const seen = new Map<string, string>();
    for (const page of parsed) {
      const dup = seen.get(page.title!);
      expect(dup, `${page.route} and ${dup} share the title "${page.title}"`).toBeUndefined();
      seen.set(page.title!, page.route);
    }
  });

  it("no two public pages share an identical description", () => {
    const seen = new Map<string, string>();
    for (const page of parsed) {
      const dup = seen.get(page.description!);
      expect(dup, `${page.route} and ${dup} share a description ("${page.description}") — one of them is likely silently inheriting it`).toBeUndefined();
      seen.set(page.description!, page.route);
    }
  });
});
