import { describe, it, expect } from "vitest";
import {
  generateVerificationToken,
  generateResetToken,
  isTokenExpired,
} from "@/lib/tokens";

describe("tokens", () => {
  it("generates a verification token expiring ~24 hours out", () => {
    const { token, expiresAt } = generateVerificationToken();
    expect(token).toMatch(/^[0-9a-f-]{36}$/);
    const hours = (new Date(expiresAt).getTime() - Date.now()) / (60 * 60 * 1000);
    expect(hours).toBeGreaterThan(23.9);
    expect(hours).toBeLessThan(24.1);
  });

  it("generates a reset token expiring ~1 hour out", () => {
    const { expiresAt } = generateResetToken();
    const hours = (new Date(expiresAt).getTime() - Date.now()) / (60 * 60 * 1000);
    expect(hours).toBeGreaterThan(0.9);
    expect(hours).toBeLessThan(1.1);
  });

  it("generates unique tokens on each call", () => {
    const a = generateResetToken();
    const b = generateResetToken();
    expect(a.token).not.toBe(b.token);
  });

  it("treats a past timestamp as expired", () => {
    expect(isTokenExpired(new Date(Date.now() - 1000).toISOString())).toBe(true);
  });

  it("treats a future timestamp as not expired", () => {
    expect(isTokenExpired(new Date(Date.now() + 1000 * 60).toISOString())).toBe(false);
  });
});
