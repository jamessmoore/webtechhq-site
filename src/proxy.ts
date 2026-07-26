import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Cookie names used by NextAuth v5 (JWT strategy)
const SESSION_COOKIES = [
  "authjs.session-token",
  "__Secure-authjs.session-token",
];

function hasSession(request: NextRequest): boolean {
  return SESSION_COOKIES.some((name) => request.cookies.has(name));
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/admin")) {
    if (!hasSession(request)) {
      return NextResponse.redirect(new URL("/signin", request.url));
    }
  }

  // Opportunity Finder and Prompt Pilot (dashboard root included) are usable
  // anonymously now - the questionnaire/form renders and produces a result
  // with no account required, and saving that result is offered only after
  // the fact (see the claim-submission flow).
  //
  // /tools/business-audit is also let through anonymously, but for a
  // different reason: an anonymous visitor has no Opportunity Finder
  // submission yet, so the page component itself renders its existing
  // "Finish the Opportunity Finder first" gate screen rather than the real
  // audit flow. Letting the middleware bounce these visitors to /signup
  // instead just produces a silent redirect with no explanation. Only the
  // base route is ungated here; any genuinely account-gated sub-route added
  // under /tools/business-audit later (there are none today) should NOT be
  // added to this list and should keep requiring a session.
  //
  // Every other /tools route (finish-signup, report sub-pages, etc.) still
  // requires a session before the page component ever runs.
  const isUngatedToolsPath =
    pathname === "/tools" ||
    pathname.startsWith("/tools/opportunity-finder") ||
    pathname.startsWith("/tools/prompt-pilot") ||
    pathname === "/tools/business-audit";

  if (
    (pathname.startsWith("/business-audit") || pathname.startsWith("/tools")) &&
    !isUngatedToolsPath
  ) {
    if (!hasSession(request)) {
      return NextResponse.redirect(new URL("/signup", request.url));
    }
  }

  if (pathname === "/signin") {
    if (hasSession(request)) {
      return NextResponse.redirect(new URL("/tools", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/business-audit/:path*", "/admin/:path*", "/tools/:path*", "/signin"],
};
