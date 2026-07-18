import { getDb } from "./db";

export const MAX_SIGNUP_IP_ATTEMPTS = 3;

// Fixed window per IP: the count resets once this much time has passed
// since the window's first attempt, rather than being a lifetime cap like
// the per-email counter in signupAttempts.ts. IP address is a new category
// of data collection for this site (see CLAUDE.md), so it's deliberately
// not retained any longer than this rate-limit check actually needs it for
// - once a window expires, the prior attempts for that IP are no longer
// consulted by getSignupIpAttemptCount and the next attempt overwrites the
// row rather than accumulating history.
export const SIGNUP_IP_WINDOW_MS = 60 * 60 * 1000; // 1 hour

interface IpAttemptRow {
  attempt_count: number;
  window_started_at: string;
}

function isWindowExpired(windowStartedAt: string): boolean {
  return Date.now() - new Date(windowStartedAt).getTime() > SIGNUP_IP_WINDOW_MS;
}

function getRow(ip: string): IpAttemptRow | undefined {
  const db = getDb();
  return db
    .prepare("SELECT attempt_count, window_started_at FROM signup_ip_attempts WHERE ip_address = ?")
    .get(ip) as IpAttemptRow | undefined;
}

/** Current attempt count for this IP's active window (0 if none or expired). */
export function getSignupIpAttemptCount(ip: string): number {
  const row = getRow(ip);
  if (!row || isWindowExpired(row.window_started_at)) return 0;
  return row.attempt_count;
}

/**
 * Records a signup-endpoint attempt (whether it results in a new account,
 * a resend, or a blocked "already exists" response) from this IP and
 * returns the new count for its current window. Starts a fresh window if
 * this IP has none yet or its previous window has expired.
 */
export function recordSignupIpAttempt(ip: string): number {
  const db = getDb();
  const now = new Date().toISOString();
  const row = getRow(ip);

  if (!row || isWindowExpired(row.window_started_at)) {
    db.prepare(`
      INSERT INTO signup_ip_attempts (ip_address, attempt_count, window_started_at, updated_at)
      VALUES (?, 1, ?, ?)
      ON CONFLICT(ip_address) DO UPDATE SET
        attempt_count = 1,
        window_started_at = excluded.window_started_at,
        updated_at = excluded.updated_at
    `).run(ip, now, now);
    return 1;
  }

  db.prepare(`
    UPDATE signup_ip_attempts SET attempt_count = attempt_count + 1, updated_at = ?
    WHERE ip_address = ?
  `).run(now, ip);

  return getSignupIpAttemptCount(ip);
}
