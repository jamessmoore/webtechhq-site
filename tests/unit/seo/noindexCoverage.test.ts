import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";

const APP_DIR = path.resolve(__dirname, "../../../src/app");
const NOINDEX_PATTERN = /robots:\s*{\s*index:\s*false\s*,\s*follow:\s*false\s*}/;

function fileDeclaresNoindex(relativeFile: string): boolean {
  const filePath = path.join(APP_DIR, relativeFile);
  if (!fs.existsSync(filePath)) return false;
  return NOINDEX_PATTERN.test(fs.readFileSync(filePath, "utf-8"));
}

// Each gated/utility route, and the file that actually carries its
// `robots: { index: false, follow: false }` metadata — either the page
// itself, or (for whole gated subtrees) the nearest layout. Kept in sync
// with GATED_OR_UTILITY_PREFIXES in sitemap.test.ts / pageRouteCoverage.test.ts.
const NOINDEX_COVERAGE: { route: string; file: string }[] = [
  { route: "/admin", file: "admin/layout.tsx" },
  { route: "/tools", file: "tools/layout.tsx" },
  { route: "/business-audit", file: "business-audit/page.tsx" },
  { route: "/signin", file: "signin/page.tsx" },
  { route: "/signup", file: "signup/page.tsx" },
  { route: "/forgot-password", file: "forgot-password/page.tsx" },
  { route: "/reset-password", file: "reset-password/[token]/page.tsx" },
  { route: "/verify", file: "verify/page.tsx" },
  { route: "/share", file: "share/page.tsx" },
];

describe("gated/utility routes are noindexed", () => {
  for (const { route, file } of NOINDEX_COVERAGE) {
    it(`${route} resolves to \`robots: { index: false, follow: false }\` via ${file}`, () => {
      expect(
        fileDeclaresNoindex(file),
        `${route} (via ${file}) is expected to declare robots: { index: false, follow: false } but doesn't`,
      ).toBe(true);
    });
  }
});
