import { randomUUID } from "crypto";

const EXPIRY_HOURS = 24;

export function generateVerificationToken(): {
  token: string;
  expiresAt: string;
} {
  const token = randomUUID();
  const expiresAt = new Date(
    Date.now() + EXPIRY_HOURS * 60 * 60 * 1000,
  ).toISOString();
  return { token, expiresAt };
}

export function isTokenExpired(expiresAt: string): boolean {
  return new Date(expiresAt) < new Date();
}
