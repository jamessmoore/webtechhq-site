import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import robots from "../../../src/app/robots";

const SITE_URL = "https://webtechhq.com";
const LLMS_TXT_PATH = path.resolve(__dirname, "../../../public/llms.txt");
const APP_DIR = path.resolve(__dirname, "../../../src/app");

function extractLinkedPaths(markdown: string): string[] {
  const linkPattern = /\[[^\]]+\]\((https?:\/\/[^)]+)\)/g;
  const paths: string[] = [];
  let match: RegExpExecArray | null;
  while ((match = linkPattern.exec(markdown)) !== null) {
    const url = match[1];
    if (url.startsWith(SITE_URL)) {
      const routePath = url.slice(SITE_URL.length) || "/";
      paths.push(routePath);
    }
  }
  return paths;
}

function routeExists(routePath: string): boolean {
  const filePath =
    routePath === "/"
      ? path.join(APP_DIR, "page.tsx")
      : path.join(APP_DIR, ...routePath.split("/").filter(Boolean), "page.tsx");
  return fs.existsSync(filePath);
}

describe("public/llms.txt", () => {
  const markdown = fs.readFileSync(LLMS_TXT_PATH, "utf-8");
  const linkedPaths = extractLinkedPaths(markdown);

  it("links to at least one page (sanity check the parse itself)", () => {
    expect(linkedPaths.length).toBeGreaterThan(0);
  });

  it("every linked webtechhq.com path resolves to a real route", () => {
    for (const routePath of linkedPaths) {
      expect(routeExists(routePath), `llms.txt links to ${routePath}, but no src/app/**/page.tsx route exists for it`).toBe(true);
    }
  });

  it("no linked path is disallowed for the named AI-crawler rules in robots.ts", () => {
    const result = robots();
    const rules = Array.isArray(result.rules) ? result.rules : [result.rules];
    const aiCrawlerRules = rules.filter((rule) => rule.userAgent !== "*");

    // Guards the exact regression Argus caught: llms.txt pointing an AI
    // crawler at a page robots.ts tells that same crawler not to fetch.
    expect(aiCrawlerRules.length).toBeGreaterThan(0);
    for (const rule of aiCrawlerRules) {
      const disallow = Array.isArray(rule.disallow) ? rule.disallow : rule.disallow ? [rule.disallow] : [];
      for (const routePath of linkedPaths) {
        const isBlocked = disallow.some((blocked) => routePath === blocked || routePath.startsWith(`${blocked}/`));
        expect(
          isBlocked,
          `llms.txt links to ${routePath}, but robots.ts disallows it for ${rule.userAgent}`,
        ).toBe(false);
      }
    }
  });
});
