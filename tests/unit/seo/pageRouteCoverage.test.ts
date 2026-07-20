import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import sitemap from "../../../src/app/sitemap";

// Routes that are intentionally excluded from the public sitemap because
// they're gated behind a session (see src/proxy.ts) or are auth/utility
// pages noindexed for content-quality reasons (see robots.ts and the
// per-page/layout `robots: { index: false, follow: false }` metadata).
// Kept in sync with the equivalent list in sitemap.test.ts and
// noindexCoverage.test.ts.
const GATED_OR_UTILITY_PREFIXES = [
  "/admin",
  "/tools",
  "/business-audit",
  "/signin",
  "/signup",
  "/forgot-password",
  "/reset-password",
  "/verify",
  "/share",
];

const APP_DIR = path.resolve(__dirname, "../../../src/app");

/** Walk src/app and return every route (as a URL path) that has a page.tsx. */
function findPageRoutes(dir: string, base = ""): string[] {
  const routes: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      routes.push(...findPageRoutes(path.join(dir, entry.name), `${base}/${entry.name}`));
    } else if (entry.name === "page.tsx") {
      routes.push(base === "" ? "/" : base);
    }
  }
  return routes;
}

function isGatedOrUtility(route: string): boolean {
  return GATED_OR_UTILITY_PREFIXES.some((prefix) => route === prefix || route.startsWith(`${prefix}/`));
}

function isDynamicSegment(route: string): boolean {
  return route.includes("[");
}

/** Does this route's own page.tsx (not an ancestor layout) declare noindex? */
function hasOwnNoindex(route: string): boolean {
  const filePath = route === "/" ? path.join(APP_DIR, "page.tsx") : path.join(APP_DIR, ...route.split("/").filter(Boolean), "page.tsx");
  if (!fs.existsSync(filePath)) return false;
  const source = fs.readFileSync(filePath, "utf-8");
  return /robots:\s*{\s*index:\s*false\s*,\s*follow:\s*false\s*}/.test(source);
}

describe("public page route coverage", () => {
  const allRoutes = findPageRoutes(APP_DIR);
  const candidateRoutes = allRoutes.filter((route) => !isDynamicSegment(route) && !isGatedOrUtility(route));

  it("found at least the known public routes (sanity check the walk itself)", () => {
    expect(candidateRoutes).toEqual(
      expect.arrayContaining(["/", "/about", "/services", "/use-cases", "/portfolio", "/contact", "/privacy", "/terms"]),
    );
  });

  it("every genuinely public route is either in sitemap.ts or explicitly noindexed", () => {
    const sitemapPaths = sitemap().map((entry) => entry.url.replace("https://webtechhq.com", "") || "/");

    for (const route of candidateRoutes) {
      const inSitemap = sitemapPaths.includes(route);
      const noindexed = hasOwnNoindex(route);
      expect(
        inSitemap || noindexed,
        `${route} is a public, non-dynamic, non-gated route but is missing from sitemap.ts and has no page-level noindex metadata. ` +
          `Add it to src/app/sitemap.ts, or give it explicit \`robots: { index: false, follow: false }\` metadata if it truly shouldn't be crawled.`,
      ).toBe(true);
    }
  });
});
