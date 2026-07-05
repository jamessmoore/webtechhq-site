import { beforeAll, afterAll, beforeEach, describe, it, expect, vi } from "vitest";
import { NextRequest } from "next/server";
import { useTestDatabase } from "../testDb";

vi.mock("@/lib/email", () => ({
  sendPasswordResetEmail: vi.fn().mockResolvedValue(undefined),
  sendGoogleAccountNoticeEmail: vi.fn().mockResolvedValue(undefined),
}));

let cleanup: () => void;
let POST: typeof import("../../../src/app/api/auth/forgot-password/route").POST;
let users: typeof import("@/lib/users");
let email: {
  sendPasswordResetEmail: ReturnType<typeof vi.fn>;
  sendGoogleAccountNoticeEmail: ReturnType<typeof vi.fn>;
};

beforeAll(async () => {
  ({ cleanup } = useTestDatabase());
  ({ POST } = await import("@/app/api/auth/forgot-password/route"));
  users = await import("@/lib/users");
  email = (await import("@/lib/email")) as unknown as typeof email;
});

afterAll(() => cleanup());

beforeEach(() => {
  email.sendPasswordResetEmail.mockClear();
  email.sendGoogleAccountNoticeEmail.mockClear();
});

function request(body: unknown) {
  return new NextRequest("http://localhost:3000/api/auth/forgot-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/auth/forgot-password", () => {
  it("returns a generic success response for an email with no account (no enumeration)", async () => {
    const res = await request({ email: "nobody@example.com", recaptchaToken: "x" });
    const response = await POST(res);
    expect(response.status).toBe(200);
    expect((await response.json()).success).toBe(true);
    expect(email.sendPasswordResetEmail).not.toHaveBeenCalled();
  });

  it("sets a reset token and emails a reset link for a password-based account", async () => {
    users.createUser({ firstName: "Reset", lastName: "Me", email: "reset.me@example.com", passwordHash: "hash" });

    const response = await POST(request({ email: "reset.me@example.com", recaptchaToken: "x" }));
    expect(response.status).toBe(200);

    const user = users.getUserByEmail("reset.me@example.com")!;
    expect(user.resetToken).toBeTruthy();
    expect(email.sendPasswordResetEmail).toHaveBeenCalledWith("reset.me@example.com", "Reset", user.resetToken);
    expect(email.sendGoogleAccountNoticeEmail).not.toHaveBeenCalled();
  });

  it("sends a Google-account notice instead of a reset link for Google-only accounts", async () => {
    users.createUser({
      firstName: "Google",
      lastName: "Only",
      email: "google.only@example.com",
      googleId: "g-1",
      emailVerified: true,
    });

    await POST(request({ email: "google.only@example.com", recaptchaToken: "x" }));

    expect(email.sendGoogleAccountNoticeEmail).toHaveBeenCalledWith("google.only@example.com", "Google");
    expect(email.sendPasswordResetEmail).not.toHaveBeenCalled();
  });

  it("rejects a missing email with 400", async () => {
    const response = await POST(request({ email: "  ", recaptchaToken: "x" }));
    expect(response.status).toBe(400);
  });
});
