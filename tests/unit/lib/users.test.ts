import { beforeAll, afterAll, describe, it, expect } from "vitest";
import { useTestDatabase } from "../testDb";

let cleanup: () => void;
let users: typeof import("@/lib/users");

beforeAll(async () => {
  ({ cleanup } = useTestDatabase());
  users = await import("@/lib/users");
});

afterAll(() => cleanup());

describe("users", () => {
  it("creates a user and reads it back by id and email", () => {
    const created = users.createUser({
      firstName: "Ada",
      lastName: "Lovelace",
      email: "ada@example.com",
      passwordHash: "hash",
    });

    expect(users.getUserById(created.id)?.email).toBe("ada@example.com");
    expect(users.getUserByEmail("ada@example.com")?.id).toBe(created.id);
  });

  it("enforces unique email at the database level", () => {
    users.createUser({ firstName: "A", lastName: "One", email: "dupe@example.com" });
    expect(() =>
      users.createUser({ firstName: "B", lastName: "Two", email: "dupe@example.com" }),
    ).toThrow();
  });

  it("verifies a user's email and clears the verification token", () => {
    const user = users.createUser({
      firstName: "Grace",
      lastName: "Hopper",
      email: "grace@example.com",
      verificationToken: "tok-123",
      verificationExpiresAt: new Date(Date.now() + 60_000).toISOString(),
    });

    expect(users.getUserByVerificationToken("tok-123")?.id).toBe(user.id);

    users.verifyUserEmail(user.id);

    const updated = users.getUserById(user.id)!;
    expect(updated.emailVerified).toBe(true);
    expect(updated.verificationToken).toBeUndefined();
    expect(users.getUserByVerificationToken("tok-123")).toBeNull();
  });

  it("links a Google account and marks email verified", () => {
    const user = users.createUser({ firstName: "Tim", lastName: "Berners-Lee", email: "tim@example.com" });
    expect(user.emailVerified).toBe(false);

    users.linkGoogleAccount(user.id, "google-abc");

    const updated = users.getUserById(user.id)!;
    expect(updated.googleId).toBe("google-abc");
    expect(updated.emailVerified).toBe(true);
    expect(users.getUserByGoogleId("google-abc")?.id).toBe(user.id);
  });

  it("sets and consumes a password reset token", () => {
    const user = users.createUser({
      firstName: "Margaret",
      lastName: "Hamilton",
      email: "margaret@example.com",
      passwordHash: "old-hash",
    });

    const expiresAt = new Date(Date.now() + 60_000).toISOString();
    users.setPasswordResetToken(user.id, "reset-tok", expiresAt);
    expect(users.getUserByResetToken("reset-tok")?.id).toBe(user.id);

    users.resetUserPassword(user.id, "new-hash");

    expect(users.getUserPasswordHash("margaret@example.com")).toBe("new-hash");
    expect(users.getUserByResetToken("reset-tok")).toBeNull();
  });

  it("deletes a user", () => {
    const user = users.createUser({ firstName: "X", lastName: "Y", email: "deleteme@example.com" });
    users.deleteUser(user.id);
    expect(users.getUserById(user.id)).toBeNull();
  });
});
