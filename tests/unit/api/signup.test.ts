import { beforeAll, afterAll, beforeEach, describe, it, expect, vi } from "vitest";
import { NextRequest } from "next/server";
import { useTestDatabase } from "../testDb";

vi.mock("@/lib/email", () => ({
  sendVerificationEmail: vi.fn().mockResolvedValue(undefined),
}));

let cleanup: () => void;
let POST: typeof import("../../../src/app/api/auth/signup/route").POST;
let users: typeof import("@/lib/users");
let email: { sendVerificationEmail: ReturnType<typeof vi.fn> };

beforeAll(async () => {
  ({ cleanup } = useTestDatabase());
  ({ POST } = await import("@/app/api/auth/signup/route"));
  users = await import("@/lib/users");
  email = (await import("@/lib/email")) as unknown as typeof email;
});

afterAll(() => cleanup());

beforeEach(() => {
  email.sendVerificationEmail.mockClear();
});

function signupRequest(body: unknown) {
  return new NextRequest("http://localhost:3000/api/auth/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

const validBody = {
  name: "Ada Lovelace",
  email: "ada.signup@example.com",
  recaptchaToken: "irrelevant-when-unconfigured",
};

describe("POST /api/auth/signup", () => {
  it("rejects missing required fields", async () => {
    const res = await POST(signupRequest({ ...validBody, name: "" }));
    expect(res.status).toBe(400);
  });

  it("creates a lightweight user (no password) and sends a verification email", async () => {
    const res = await POST(signupRequest(validBody));
    expect(res.status).toBe(200);
    expect((await res.json()).success).toBe(true);

    const user = users.getUserByEmail("ada.signup@example.com")!;
    expect(user).not.toBeNull();
    expect(user.emailVerified).toBe(false);
    expect(user.passwordHash).toBeFalsy();
    expect(user.verificationToken).toBeTruthy();

    expect(email.sendVerificationEmail).toHaveBeenCalledWith(
      "ada.signup@example.com",
      "Ada Lovelace",
      user.verificationToken,
    );
  });

  it("lowercases and trims the email before storing/checking", async () => {
    await POST(signupRequest({ ...validBody, email: "  Mixed.Case@Example.com  " }));
    expect(users.getUserByEmail("mixed.case@example.com")).not.toBeNull();
  });

  it("rejects signup for an email that already has a completed account", async () => {
    const email1 = "completed.signup@example.com";
    const first = await POST(signupRequest({ ...validBody, email: email1 }));
    expect(first.status).toBe(200);

    const user = users.getUserByEmail(email1)!;
    users.completeAccountSignup(user.id, "hashed-password");

    const second = await POST(signupRequest({ ...validBody, email: email1 }));
    expect(second.status).toBe(409);
  });

  it("resets an incomplete account when the same email signs up again", async () => {
    const email1 = "incomplete.signup@example.com";
    const first = await POST(signupRequest({ ...validBody, email: email1 }));
    expect(first.status).toBe(200);
    const firstUser = users.getUserByEmail(email1)!;

    const second = await POST(signupRequest({ ...validBody, email: email1, name: "New Name" }));
    expect(second.status).toBe(200);
    const secondUser = users.getUserByEmail(email1)!;
    expect(secondUser.id).not.toBe(firstUser.id);
    expect(secondUser.firstName).toBe("New Name");
  });

  it("blocks further requests once the retry cap is reached", async () => {
    const email1 = "capped.signup@example.com";
    for (let i = 0; i < 5; i++) {
      const res = await POST(signupRequest({ ...validBody, email: email1 }));
      expect(res.status).toBe(200);
    }

    const res = await POST(signupRequest({ ...validBody, email: email1 }));
    expect(res.status).toBe(429);
  });

  it("does not fail the request if the verification email fails to send", async () => {
    email.sendVerificationEmail.mockRejectedValueOnce(new Error("SendGrid down"));
    const res = await POST(signupRequest({ ...validBody, email: "emailfails@example.com" }));
    expect(res.status).toBe(200);
  });
});
