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
  firstName: "Ada",
  lastName: "Lovelace",
  email: "ada.signup@example.com",
  password: "supersecret1",
  recaptchaToken: "irrelevant-when-unconfigured",
};

describe("POST /api/auth/signup", () => {
  it("rejects missing required fields", async () => {
    const res = await POST(signupRequest({ ...validBody, firstName: "" }));
    expect(res.status).toBe(400);
  });

  it("rejects short passwords", async () => {
    const res = await POST(signupRequest({ ...validBody, email: "short@example.com", password: "short" }));
    expect(res.status).toBe(400);
    expect((await res.json()).error).toMatch(/at least 8 characters/);
  });

  it("creates a user, hashes the password, and sends a verification email", async () => {
    const res = await POST(signupRequest(validBody));
    expect(res.status).toBe(200);
    expect((await res.json()).success).toBe(true);

    const user = users.getUserByEmail("ada.signup@example.com")!;
    expect(user).not.toBeNull();
    expect(user.emailVerified).toBe(false);
    expect(user.passwordHash).not.toBe(validBody.password);
    expect(user.verificationToken).toBeTruthy();

    expect(email.sendVerificationEmail).toHaveBeenCalledWith(
      "ada.signup@example.com",
      "Ada",
      user.verificationToken,
    );
  });

  it("lowercases and trims the email before storing/checking", async () => {
    await POST(signupRequest({ ...validBody, email: "  Mixed.Case@Example.com  " }));
    expect(users.getUserByEmail("mixed.case@example.com")).not.toBeNull();
  });

  it("rejects signup for an email that already has an account", async () => {
    const first = await POST(signupRequest({ ...validBody, email: "dupe.signup@example.com" }));
    expect(first.status).toBe(200);

    const second = await POST(signupRequest({ ...validBody, email: "dupe.signup@example.com" }));
    expect(second.status).toBe(409);
  });

  it("does not fail the request if the verification email fails to send", async () => {
    email.sendVerificationEmail.mockRejectedValueOnce(new Error("SendGrid down"));
    const res = await POST(signupRequest({ ...validBody, email: "emailfails@example.com" }));
    expect(res.status).toBe(200);
  });
});
