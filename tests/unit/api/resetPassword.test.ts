import { beforeAll, afterAll, describe, it, expect } from "vitest";
import { NextRequest } from "next/server";
import { useTestDatabase } from "../testDb";

let cleanup: () => void;
let POST: typeof import("../../../src/app/api/auth/reset-password/route").POST;
let users: typeof import("@/lib/users");

beforeAll(async () => {
  ({ cleanup } = useTestDatabase());
  ({ POST } = await import("@/app/api/auth/reset-password/route"));
  users = await import("@/lib/users");
});

afterAll(() => cleanup());

function request(body: unknown) {
  return new NextRequest("http://localhost:3000/api/auth/reset-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/auth/reset-password", () => {
  it("rejects a missing token or password", async () => {
    const res = await POST(request({ token: "", password: "newpassword1" }));
    expect(res.status).toBe(400);
  });

  it("rejects a password under 8 characters", async () => {
    const res = await POST(request({ token: "tok", password: "short" }));
    expect(res.status).toBe(400);
  });

  it("rejects an unknown token", async () => {
    const res = await POST(request({ token: "does-not-exist", password: "newpassword1" }));
    expect(res.status).toBe(400);
    expect((await res.json()).error).toMatch(/invalid/i);
  });

  it("rejects an expired token", async () => {
    const user = users.createUser({ firstName: "Expired", lastName: "Token", email: "expired@example.com", passwordHash: "old" });
    users.setPasswordResetToken(user.id, "expired-tok", new Date(Date.now() - 1000).toISOString());

    const res = await POST(request({ token: "expired-tok", password: "newpassword1" }));
    expect(res.status).toBe(400);
    expect((await res.json()).error).toMatch(/expired/i);
  });

  it("resets the password and clears the token on success", async () => {
    const user = users.createUser({ firstName: "Valid", lastName: "Token", email: "valid.reset@example.com", passwordHash: "old-hash" });
    users.setPasswordResetToken(user.id, "valid-tok", new Date(Date.now() + 60_000).toISOString());

    const res = await POST(request({ token: "valid-tok", password: "newpassword1" }));
    expect(res.status).toBe(200);

    expect(users.getUserPasswordHash("valid.reset@example.com")).not.toBe("old-hash");
    expect(users.getUserByResetToken("valid-tok")).toBeNull();
  });
});
