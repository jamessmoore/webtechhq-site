import { beforeAll, afterAll, beforeEach, describe, it, expect, vi } from "vitest";
import { NextRequest } from "next/server";
import { useTestDatabase } from "../testDb";

// The route auto-logs the user in via next-auth's signIn() once verification
// succeeds. Real signIn() throws a special NEXT_REDIRECT digest error that
// only Next.js's own runtime knows how to turn into a redirect response —
// there's no such runtime here, so we mock it out and assert on the call
// instead of the (unreachable-in-tests) real redirect it would trigger.
vi.mock("next-auth", () => ({ AuthError: class AuthError extends Error {} }));
vi.mock("@/auth", () => ({ signIn: vi.fn().mockResolvedValue(undefined) }));

let cleanup: () => void;
let GET: typeof import("../../../src/app/api/verify/[token]/route").GET;
let users: typeof import("@/lib/users");
let auth: { signIn: ReturnType<typeof vi.fn> };

beforeAll(async () => {
  ({ cleanup } = useTestDatabase());
  ({ GET } = await import("@/app/api/verify/[token]/route"));
  users = await import("@/lib/users");
  auth = (await import("@/auth")) as unknown as typeof auth;
});

beforeEach(() => {
  auth.signIn.mockClear();
});

afterAll(() => cleanup());

function request(token: string, next?: string) {
  const url = new URL(`http://localhost:3000/api/verify/${token}`);
  if (next) url.searchParams.set("next", next);
  return GET(new NextRequest(url), { params: Promise.resolve({ token }) });
}

describe("GET /api/verify/[token]", () => {
  it("redirects to /verify?error=invalid for an unknown token", async () => {
    const res = await request("does-not-exist");
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toMatch(/\/verify\?error=invalid$/);
  });

  it("redirects to /verify?error=expired for an expired token", async () => {
    users.createUser({
      firstName: "Expired",
      lastName: "Verify",
      email: "expired.verify@example.com",
      verificationToken: "expired-verify-tok",
      verificationExpiresAt: new Date(Date.now() - 1000).toISOString(),
    });

    const res = await request("expired-verify-tok");
    expect(res.headers.get("location")).toMatch(/\/verify\?error=expired$/);
  });

  it("verifies the user and auto-logs them in via signIn", async () => {
    const user = users.createUser({
      firstName: "Good",
      lastName: "Verify",
      email: "good.verify@example.com",
      verificationToken: "good-verify-tok",
      verificationExpiresAt: new Date(Date.now() + 60_000).toISOString(),
    });

    // signIn() is mocked to resolve instead of throwing its real NEXT_REDIRECT
    // digest error, so the route falls through to its own fallback redirect
    // here — in production, signIn() throwing is what actually redirects the
    // browser straight to /tools/opportunity-finder instead.
    const res = await request("good-verify-tok");
    expect(res.headers.get("location")).toMatch(/\/verify\?success=1$/);
    expect(users.getUserById(user.id)!.emailVerified).toBe(true);

    expect(auth.signIn).toHaveBeenCalledWith(
      "verified-login",
      expect.objectContaining({ token: expect.any(String), redirectTo: "/tools/opportunity-finder" }),
    );
  });

  it("honors a ?next= override, e.g. to send the user straight to finish-signup", async () => {
    users.createUser({
      firstName: "Next",
      lastName: "Verify",
      email: "next.verify@example.com",
      verificationToken: "next-verify-tok",
      verificationExpiresAt: new Date(Date.now() + 60_000).toISOString(),
    });

    await request("next-verify-tok", "/tools/finish-signup");

    expect(auth.signIn).toHaveBeenCalledWith(
      "verified-login",
      expect.objectContaining({ redirectTo: "/tools/finish-signup" }),
    );
  });

  it("ignores a ?next= value that isn't a relative path, as an open-redirect guard", async () => {
    users.createUser({
      firstName: "Unsafe",
      lastName: "Verify",
      email: "unsafe.verify@example.com",
      verificationToken: "unsafe-verify-tok",
      verificationExpiresAt: new Date(Date.now() + 60_000).toISOString(),
    });

    await request("unsafe-verify-tok", "https://evil.example.com");

    expect(auth.signIn).toHaveBeenCalledWith(
      "verified-login",
      expect.objectContaining({ redirectTo: "/tools/opportunity-finder" }),
    );
  });
});
