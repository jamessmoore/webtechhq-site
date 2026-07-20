import { NextRequest, NextResponse } from "next/server";
import { notFound } from "next/navigation";

// Built from NEXTAUTH_URL rather than the incoming request URL: behind the
// Nginx reverse proxy, request.url resolves to the internal localhost:3000
// address next start binds to, not the public domain.
const BASE_URL = process.env.NEXTAUTH_URL ?? "http://localhost:3000";

// Short, brandable per-source links for social post descriptions/captions:
//   /yt/<slug>    -> YouTube flagship video description
//   /short/<slug> -> YouTube Shorts
//   /ig/<slug>    -> Instagram Reels
//   /x/<slug>     -> X/Twitter posts
//   /li/<slug>    -> LinkedIn carousel posts
// All five redirect to /signup?utm_source=<source>&utm_medium=<medium>&utm_campaign=<slug>
// for any slug, so future posts don't need a code change or a new
// next.config.js redirects() entry per campaign.
//
// This is an allow-listed set of top-level path prefixes, not an open
// catch-all: an unrecognized first segment falls through to the site's
// normal 404 rather than being treated as a redirect source, since this
// route sits at the root alongside real pages (About, Services, etc.) and
// an unrestricted catch-all here would be an open-redirect-shaped surface.
const SOURCES: Record<string, { utm_source: string; utm_medium: string }> = {
  yt: { utm_source: "youtube", utm_medium: "description" },
  short: { utm_source: "youtube", utm_medium: "short" },
  ig: { utm_source: "instagram", utm_medium: "reel" },
  x: { utm_source: "x", utm_medium: "post" },
  li: { utm_source: "linkedin", utm_medium: "carousel" },
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ source: string; slug: string }> },
) {
  const { source, slug } = await params;

  const mapping = SOURCES[source];
  if (!mapping) {
    notFound();
  }

  const destination = new URL("/signup", BASE_URL);
  destination.searchParams.set("utm_source", mapping.utm_source);
  destination.searchParams.set("utm_medium", mapping.utm_medium);
  destination.searchParams.set("utm_campaign", slug);

  // Let any query params an explicit caller appended (e.g. ?utm_medium=email)
  // override the hardcoded defaults above, rather than being dropped.
  request.nextUrl.searchParams.forEach((value, key) => {
    destination.searchParams.set(key, value);
  });

  return NextResponse.redirect(destination, 301);
}
