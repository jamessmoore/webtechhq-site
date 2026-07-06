import { randomUUID } from "crypto";

const EXPIRY_HOURS = 24;
const RESET_EXPIRY_HOURS = 1;
const LOGIN_EXPIRY_HOURS = 1 / 6; // 10 minutes - single-use, consumed immediately after email verification

function generateToken(hours: number): { token: string; expiresAt: string } {
  const token = randomUUID();
  const expiresAt = new Date(Date.now() + hours * 60 * 60 * 1000).toISOString();
  return { token, expiresAt };
}

export function generateVerificationToken(): {
  token: string;
  expiresAt: string;
} {
  return generateToken(EXPIRY_HOURS);
}

export function generateResetToken(): {
  token: string;
  expiresAt: string;
} {
  return generateToken(RESET_EXPIRY_HOURS);
}

export function generateLoginToken(): {
  token: string;
  expiresAt: string;
} {
  return generateToken(LOGIN_EXPIRY_HOURS);
}

export function isTokenExpired(expiresAt: string): boolean {
  return new Date(expiresAt) < new Date();
}
