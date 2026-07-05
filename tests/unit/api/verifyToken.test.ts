import { beforeAll, afterAll, describe, it, expect } from "vitest";
import { NextRequest } from "next/server";
import { useTestDatabase } from "../testDb";

let cleanup: () => void;
let GET: typeof import("../../../src/app/api/verify/[token]/route").GET;
let users: typeof import("@/lib/users");

beforeAll(async () => {
  ({ cleanup } = useTestDatabase());
  ({ GET } = await import("@/app/api/verify/[token]/route"));
  users = await import("@/lib/users");
});

afterAll(() => cleanup());

function request(token: string) {
  return GET(new NextRequest(`http://localhost:3000/api/verify/${token}`), {
    params: Promise.resolve({ token }),
  });
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

  it("verifies the user and redirects to /verify?success=1", async () => {
    const user = users.createUser({
      firstName: "Good",
      lastName: "Verify",
      email: "good.verify@example.com",
      verificationToken: "good-verify-tok",
      verificationExpiresAt: new Date(Date.now() + 60_000).toISOString(),
    });

    const res = await request("good-verify-tok");
    expect(res.headers.get("location")).toMatch(/\/verify\?success=1$/);
    expect(users.getUserById(user.id)!.emailVerified).toBe(true);
  });
});
