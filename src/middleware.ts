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

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/admin")) {
    if (!hasSession(request)) {
      return NextResponse.redirect(new URL("/signin", request.url));
    }
  }

  if (pathname.startsWith("/questionnaire")) {
    if (!hasSession(request)) {
      return NextResponse.redirect(new URL("/signup", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/questionnaire/:path*", "/admin/:path*"],
};
