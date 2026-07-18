import { NextRequest } from "next/server";

/**
 * Best-effort source IP for a request, used only by narrow-purpose
 * rate-limit checks (see signupIpAttempts.ts) — not a general logging
 * utility, and not meant to be authoritative for anything beyond that.
 *
 * `deploy/nginx/webtechhq.conf` sits in front of this app on every real
 * deployment and always sets `X-Real-IP` from nginx's own `$remote_addr`,
 * overwriting any value a client tries to send for that header name - so
 * it's the trustworthy signal in production. `X-Forwarded-For` is kept as
 * a fallback (first entry) for local dev / tests where there's no nginx
 * hop in front of the app to set X-Real-IP; that fallback is not
 * spoof-proof on its own, but it's only ever consulted when the trusted
 * header is absent.
 */
export function getClientIp(request: NextRequest): string {
  const realIp = request.headers.get("x-real-ip")?.trim();
  if (realIp) return realIp;

  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    const first = forwardedFor.split(",")[0]?.trim();
    if (first) return first;
  }

  return "unknown";
}
