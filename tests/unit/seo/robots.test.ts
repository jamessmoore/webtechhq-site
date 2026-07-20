import { describe, it, expect } from "vitest";
import robots from "../../../src/app/robots";

describe("robots()", () => {
  const result = robots();
  const rules = Array.isArray(result.rules) ? result.rules : [result.rules];

  it("points crawlers at the sitemap", () => {
    expect(result.sitemap).toBe("https://webtechhq.com/sitemap.xml");
  });

  it("disallows gated/utility paths for every rule", () => {
    for (const rule of rules) {
      expect(rule.disallow).toEqual(
        expect.arrayContaining([
          "/admin",
          "/api",
          "/signin",
          "/signup",
          "/forgot-password",
          "/reset-password",
          "/verify",
        ]),
      );
    }
  });

  it("explicitly names the major AI answer-engine crawlers", () => {
    const agents = rules.map((rule) => rule.userAgent);
    expect(agents).toEqual(
      expect.arrayContaining([
        "*",
        "GPTBot",
        "ChatGPT-User",
        "ClaudeBot",
        "anthropic-ai",
        "PerplexityBot",
        "Google-Extended",
        "CCBot",
        "Applebot-Extended",
      ]),
    );
  });

  it("allows the root path for every rule", () => {
    for (const rule of rules) {
      expect(rule.allow).toBe("/");
    }
  });
});
