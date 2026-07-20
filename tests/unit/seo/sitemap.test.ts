import { describe, it, expect } from "vitest";
import sitemap from "../../../src/app/sitemap";

describe("sitemap()", () => {
  const entries = sitemap();
  const paths = entries.map((e) => e.url.replace("https://webtechhq.com", "") || "/");

  it("includes every public marketing page", () => {
    expect(paths).toEqual(
      expect.arrayContaining(["/", "/about", "/services", "/use-cases", "/portfolio", "/contact", "/privacy", "/terms"]),
    );
  });

  it("excludes gated and auth/utility routes", () => {
    const gatedOrUtility = [
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
    for (const path of gatedOrUtility) {
      expect(paths.some((p) => p === path || p.startsWith(`${path}/`))).toBe(false);
    }
  });

  it("gives the homepage the highest priority", () => {
    const home = entries.find((e) => e.url === "https://webtechhq.com");
    expect(home?.priority).toBe(1);
  });
});
