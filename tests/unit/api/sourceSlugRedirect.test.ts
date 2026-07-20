import { describe, it, expect } from "vitest";
import { NextRequest } from "next/server";
import { GET } from "../../../src/app/[source]/[slug]/route";

function request(source: string, slug: string, query?: Record<string, string>) {
  const url = new URL(`http://localhost:3000/${source}/${slug}`);
  for (const [key, value] of Object.entries(query ?? {})) {
    url.searchParams.set(key, value);
  }
  return GET(new NextRequest(url), { params: Promise.resolve({ source, slug }) });
}

describe("GET /[source]/[slug]", () => {
  it.each([
    ["yt", "youtube", "description"],
    ["short", "youtube", "short"],
    ["ig", "instagram", "reel"],
    ["x", "x", "post"],
    ["li", "linkedin", "carousel"],
  ])("301-redirects /%s/<slug> to /signup with utm_source=%s, utm_medium=%s", async (source, utmSource, utmMedium) => {
    const res = await request(source, "not-the-best-barbecue");

    expect(res.status).toBe(301);
    const location = new URL(res.headers.get("location")!);
    expect(location.pathname).toBe("/signup");
    expect(location.searchParams.get("utm_source")).toBe(utmSource);
    expect(location.searchParams.get("utm_medium")).toBe(utmMedium);
    expect(location.searchParams.get("utm_campaign")).toBe("not-the-best-barbecue");
  });

  it("works for any slug without code changes", async () => {
    const res = await request("yt", "some-other-video");

    const location = new URL(res.headers.get("location")!);
    expect(location.searchParams.get("utm_campaign")).toBe("some-other-video");
  });

  it("lets an explicit query param override the hardcoded default", async () => {
    const res = await request("yt", "foo", { utm_medium: "bar" });

    const location = new URL(res.headers.get("location")!);
    expect(location.searchParams.get("utm_medium")).toBe("bar");
    expect(location.searchParams.get("utm_campaign")).toBe("foo");
  });

  it("404s for a source not on the allow-list instead of treating it as a redirect source", async () => {
    await expect(request("not-a-real-source", "foo")).rejects.toThrow();
  });
});
