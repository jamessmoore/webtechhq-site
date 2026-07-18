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

// Each call gets its own default source IP unless a test explicitly passes
// one, so pre-existing per-email tests below aren't incidentally affected
// by the new per-IP cap (added by tests further down, which deliberately
// reuse an `ip` across calls to exercise that cap).
let ipCounter = 0;
function signupRequest(body: unknown, ip: string = `10.0.0.${++ipCounter}`) {
  return new NextRequest("http://localhost:3000/api/auth/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-forwarded-for": ip },
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

  it("rejects an email that fails basic format validation", async () => {
    const res = await POST(signupRequest({ ...validBody, email: "not-an-email" }));
    expect(res.status).toBe(400);
    expect(users.getUserByEmail("not-an-email")).toBeNull();
  });

  it("rejects a mailto-injection-shaped email (extra @ used as a bcc target)", async () => {
    const malicious = "real@x.com?bcc=attacker@evil.com&subject=hi";
    const res = await POST(signupRequest({ ...validBody, email: malicious }));
    expect(res.status).toBe(400);
    expect(users.getUserByEmail(malicious.toLowerCase())).toBeNull();
  });

  // Single-@ mailto injection shapes: the local part is RFC 5322-legal but
  // carries mailto: URI query syntax (?, &, =), which a browser's mailto:
  // parser splits on when the address is later rendered as a raw
  // `mailto:${email}` href in the admin users table.
  it("rejects a single-@ email whose local part smuggles mailto subject/body params", async () => {
    const malicious = "victim?subject=Hi&body=whatever@x.com";
    const res = await POST(signupRequest({ ...validBody, email: malicious }));
    expect(res.status).toBe(400);
    expect(users.getUserByEmail(malicious.toLowerCase())).toBeNull();
  });

  it("rejects a single-@ email whose local part smuggles a mailto cc param", async () => {
    const malicious = "victim?cc=someone-else-entirely@x.com";
    const res = await POST(signupRequest({ ...validBody, email: malicious }));
    expect(res.status).toBe(400);
    expect(users.getUserByEmail(malicious.toLowerCase())).toBeNull();
  });

  it("rejects a name longer than the length cap", async () => {
    const res = await POST(signupRequest({ ...validBody, name: "a".repeat(101), email: "toolongname@example.com" }));
    expect(res.status).toBe(400);
    expect(users.getUserByEmail("toolongname@example.com")).toBeNull();
  });

  it("accepts a name at exactly the length cap", async () => {
    const res = await POST(signupRequest({ ...validBody, name: "a".repeat(100), email: "exactlength@example.com" }));
    expect(res.status).toBe(200);
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

  it("resends the verification email to the existing record instead of creating a duplicate when the same email (unverified, incomplete) signs up again", async () => {
    const email1 = "incomplete.signup@example.com";
    const first = await POST(signupRequest({ ...validBody, email: email1 }));
    expect(first.status).toBe(200);
    const firstUser = users.getUserByEmail(email1)!;
    const firstToken = firstUser.verificationToken;

    const second = await POST(signupRequest({ ...validBody, email: email1, name: "New Name" }));
    expect(second.status).toBe(200);
    const secondBody = (await second.json()) as Record<string, unknown>;
    // The client-visible response must be indistinguishable from a
    // brand-new signup - no `resent` (or any other) field that would let
    // an unauthenticated caller tell "new account created" apart from "we
    // found your existing, unverified signup and resent the link". That
    // distinction would let anyone enumerate an email's account status.
    expect(secondBody).toEqual({ success: true });

    // Same underlying account - not deleted/recreated - and the original
    // name is left alone rather than being overwritten by the duplicate
    // request's payload.
    const secondUser = users.getUserByEmail(email1)!;
    expect(secondUser.id).toBe(firstUser.id);
    expect(secondUser.firstName).toBe("Ada Lovelace");
    expect(secondUser.emailVerified).toBe(false);

    // A fresh token was issued and the (mocked) verification email was
    // resent using it.
    expect(secondUser.verificationToken).toBeTruthy();
    expect(secondUser.verificationToken).not.toBe(firstToken);
    expect(email.sendVerificationEmail).toHaveBeenCalledWith(
      email1,
      "Ada Lovelace",
      secondUser.verificationToken,
    );

    expect(users.getAllUsers().filter((u) => u.email === email1)).toHaveLength(1);
  });

  it("returns byte-identical response bodies for a brand-new signup and a resend-to-existing-unverified signup (account enumeration guard)", async () => {
    const freshEmail = "brand-new.signup@example.com";
    const freshRes = await POST(signupRequest({ ...validBody, email: freshEmail }));
    expect(freshRes.status).toBe(200);
    const freshBody = await freshRes.json();

    const existingEmail = "already-unverified.signup@example.com";
    await POST(signupRequest({ ...validBody, email: existingEmail }));
    const resendRes = await POST(signupRequest({ ...validBody, email: existingEmail }));
    expect(resendRes.status).toBe(200);
    const resendBody = await resendRes.json();

    // An unauthenticated caller must not be able to distinguish "your
    // account was just created" from "we found your existing, unverified
    // signup and resent the link" - either response shape leaking that
    // distinction would let anyone enumerate an email's account status.
    expect(resendBody).toEqual(freshBody);
  });

  it("rejects signup and does not resend anything when the existing account has already verified its email (but never set a password)", async () => {
    const email1 = "verified.incomplete.signup@example.com";
    const first = await POST(signupRequest({ ...validBody, email: email1 }));
    expect(first.status).toBe(200);

    const user = users.getUserByEmail(email1)!;
    // Simulate having clicked the verification link without yet finishing
    // account setup (setting a password).
    users.verifyUserEmail(user.id);

    email.sendVerificationEmail.mockClear();

    const second = await POST(signupRequest({ ...validBody, email: email1 }));
    expect(second.status).toBe(409);
    const secondBody = (await second.json()) as { error?: string };
    expect(secondBody.error).toMatch(/already exists/i);

    expect(email.sendVerificationEmail).not.toHaveBeenCalled();
    const stillSameUser = users.getUserByEmail(email1)!;
    expect(stillSameUser.id).toBe(user.id);
    expect(users.getAllUsers().filter((u) => u.email === email1)).toHaveLength(1);
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

  describe("per-source-IP rate limiting", () => {
    const IP_BLOCK_MESSAGE = "Further retries are not allowed. Please contact us for assistance.";

    it("allows 3 attempts from one IP (mixing target emails) then blocks the 4th with the exact message", async () => {
      const ip = "203.0.113.10";

      const first = await POST(
        signupRequest({ ...validBody, email: "ip-cap-1@example.com" }, ip),
      );
      expect(first.status).toBe(200);

      const second = await POST(
        signupRequest({ ...validBody, email: "ip-cap-2@example.com" }, ip),
      );
      expect(second.status).toBe(200);

      // Same target email as the first attempt - still just counts as one
      // more attempt from this IP, same as a different email would.
      const third = await POST(
        signupRequest({ ...validBody, email: "ip-cap-1@example.com" }, ip),
      );
      expect(third.status).toBe(200);

      const fourth = await POST(
        signupRequest({ ...validBody, email: "ip-cap-3@example.com" }, ip),
      );
      expect(fourth.status).toBe(429);
      const fourthBody = (await fourth.json()) as { error?: string; ipBlocked?: boolean };
      expect(fourthBody.error).toBe(IP_BLOCK_MESSAGE);
      expect(fourthBody.ipBlocked).toBe(true);

      // The blocked email was never touched.
      expect(users.getUserByEmail("ip-cap-3@example.com")).toBeNull();
    });

    it("does not let one IP's attempts affect a different IP", async () => {
      const busyIp = "203.0.113.20";
      const otherIp = "203.0.113.21";

      for (let i = 0; i < 3; i++) {
        const res = await POST(
          signupRequest({ ...validBody, email: `busy-ip-${i}@example.com` }, busyIp),
        );
        expect(res.status).toBe(200);
      }
      // busyIp is now capped.
      const blocked = await POST(
        signupRequest({ ...validBody, email: "busy-ip-4@example.com" }, busyIp),
      );
      expect(blocked.status).toBe(429);

      // A fresh IP is unaffected by busyIp's count.
      const unaffected = await POST(
        signupRequest({ ...validBody, email: "other-ip-1@example.com" }, otherIp),
      );
      expect(unaffected.status).toBe(200);
    });

    it("shows the plain generic message (no retry language) for an already-verified account, unaffected by this IP's in-progress attempt count", async () => {
      const ip = "203.0.113.30";
      const targetEmail = "ip-verified-target@example.com";

      // Attempt 1 on this IP: create + verify the account out of band.
      const created = await POST(signupRequest({ ...validBody, email: targetEmail }, ip));
      expect(created.status).toBe(200);
      const user = users.getUserByEmail(targetEmail)!;
      users.verifyUserEmail(user.id);

      // Attempt 2 on this IP: still under the 3-attempt cap, so the
      // verified-account block itself is untouched by the IP feature.
      const res = await POST(signupRequest({ ...validBody, email: targetEmail }, ip));
      expect(res.status).toBe(409);
      const body = (await res.json()) as { error?: string; ipBlocked?: boolean };
      expect(body.error).toBe("An account with this email already exists. Try signing in instead.");
      expect(body.ipBlocked).toBeFalsy();
      expect(body.error).not.toMatch(/retr(y|ies)/i);
    });

    it("blocks with the IP-cap message (not the verified-account message) once a capped IP retries against a verified email", async () => {
      const ip = "203.0.113.31";
      const targetEmail = "ip-capped-verified-target@example.com";

      const created = await POST(signupRequest({ ...validBody, email: targetEmail }, ip));
      expect(created.status).toBe(200);
      const user = users.getUserByEmail(targetEmail)!;
      users.verifyUserEmail(user.id);

      // Attempt 2 and 3 use up the rest of this IP's cap.
      await POST(signupRequest({ ...validBody, email: "ip-capped-filler-1@example.com" }, ip));
      await POST(signupRequest({ ...validBody, email: "ip-capped-filler-2@example.com" }, ip));

      // Attempt 4, against the verified email: the IP cap wins outright -
      // the two block reasons are never conflated into a hybrid message.
      const res = await POST(signupRequest({ ...validBody, email: targetEmail }, ip));
      expect(res.status).toBe(429);
      const body = (await res.json()) as { error?: string; ipBlocked?: boolean };
      expect(body.error).toBe(IP_BLOCK_MESSAGE);
      expect(body.ipBlocked).toBe(true);
    });
  });
});
