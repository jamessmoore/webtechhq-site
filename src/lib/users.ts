import { randomUUID } from "crypto";
import { getDb } from "./db";
import { type User, type UserRow, rowToUser } from "./types";

export function createUser(data: {
  firstName: string;
  lastName: string;
  email: string;
  passwordHash?: string;
  googleId?: string;
  emailVerified?: boolean;
  verificationToken?: string;
  verificationExpiresAt?: string;
}): User {
  const db = getDb();
  const id = randomUUID();
  const now = new Date().toISOString();

  db.prepare(`
    INSERT INTO users (
      id, first_name, last_name, email, password_hash, google_id,
      email_verified, verification_token, verification_expires_at, created_at
    ) VALUES (
      ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
    )
  `).run(
    id,
    data.firstName,
    data.lastName,
    data.email,
    data.passwordHash ?? null,
    data.googleId ?? null,
    data.emailVerified ? 1 : 0,
    data.verificationToken ?? null,
    data.verificationExpiresAt ?? null,
    now,
  );

  return getUserById(id)!;
}

export function getUserById(id: string): User | null {
  const db = getDb();
  const row = db.prepare("SELECT * FROM users WHERE id = ?").get(id) as UserRow | undefined;
  return row ? rowToUser(row) : null;
}

export function getUserByEmail(email: string): User | null {
  const db = getDb();
  const row = db.prepare("SELECT * FROM users WHERE email = ?").get(email) as UserRow | undefined;
  return row ? rowToUser(row) : null;
}

export function getUserByGoogleId(googleId: string): User | null {
  const db = getDb();
  const row = db.prepare("SELECT * FROM users WHERE google_id = ?").get(googleId) as UserRow | undefined;
  return row ? rowToUser(row) : null;
}

export function getUserByVerificationToken(token: string): User | null {
  const db = getDb();
  const row = db.prepare("SELECT * FROM users WHERE verification_token = ?").get(token) as UserRow | undefined;
  return row ? rowToUser(row) : null;
}

export function verifyUserEmail(userId: string): void {
  const db = getDb();
  db.prepare(`
    UPDATE users
    SET email_verified = 1,
        email_verified_at = ?,
        verification_token = NULL,
        verification_expires_at = NULL
    WHERE id = ?
  `).run(new Date().toISOString(), userId);
}

export function linkGoogleAccount(userId: string, googleId: string): void {
  const db = getDb();
  db.prepare("UPDATE users SET google_id = ?, email_verified = 1 WHERE id = ?")
    .run(googleId, userId);
}

/** Raw password_hash for use in bcrypt.compare — not exposed on User type */
export function getUserPasswordHash(email: string): string | null {
  const db = getDb();
  const row = db.prepare("SELECT password_hash FROM users WHERE email = ?").get(email) as
    | { password_hash: string | null }
    | undefined;
  return row?.password_hash ?? null;
}
