import { getDb } from "./db";

export const MAX_SIGNUP_ATTEMPTS = 5;

function normalize(email: string): string {
  return email.toLowerCase().trim();
}

export function getSignupAttemptCount(email: string): number {
  const db = getDb();
  const row = db
    .prepare("SELECT attempt_count FROM signup_attempts WHERE email = ?")
    .get(normalize(email)) as { attempt_count: number } | undefined;
  return row?.attempt_count ?? 0;
}

/** Records a lightweight-signup request for this email and returns the new count. */
export function recordSignupAttempt(email: string): number {
  const db = getDb();
  const normalized = normalize(email);
  const now = new Date().toISOString();

  db.prepare(`
    INSERT INTO signup_attempts (email, attempt_count, updated_at)
    VALUES (?, 1, ?)
    ON CONFLICT(email) DO UPDATE SET
      attempt_count = attempt_count + 1,
      updated_at = excluded.updated_at
  `).run(normalized, now);

  return getSignupAttemptCount(normalized);
}
