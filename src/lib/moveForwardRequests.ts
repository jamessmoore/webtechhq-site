import { randomUUID } from "crypto";
import { getDb } from "./db";
import {
  type MoveForwardRequest,
  type MoveForwardRequestRow,
  type MoveForwardStatus,
  rowToMoveForwardRequest,
} from "./types";

export function getMoveForwardRequestByUser(userId: string): MoveForwardRequest | null {
  const db = getDb();
  const row = db.prepare("SELECT * FROM move_forward_requests WHERE user_id = ?").get(userId) as
    | MoveForwardRequestRow
    | undefined;
  return row ? rowToMoveForwardRequest(row) : null;
}

/**
 * Idempotent: one row per user (enforced by the unique index on user_id). If
 * a request already exists for this user, returns it unchanged instead of
 * creating a duplicate or throwing - a repeat click on the "move forward" CTA
 * should just show the same confirmation state, not error.
 */
export function createMoveForwardRequest(userId: string): MoveForwardRequest {
  const existing = getMoveForwardRequestByUser(userId);
  if (existing) return existing;

  const db = getDb();
  const id = randomUUID();
  const now = new Date().toISOString();

  db.prepare(`
    INSERT INTO move_forward_requests (id, user_id, status, created_at, updated_at)
    VALUES (?, ?, 'waiting', ?, ?)
  `).run(id, userId, now, now);

  return getMoveForwardRequestByUser(userId)!;
}

export function getAllMoveForwardRequests(): MoveForwardRequest[] {
  const db = getDb();
  const rows = db.prepare("SELECT * FROM move_forward_requests ORDER BY created_at DESC").all() as
    MoveForwardRequestRow[];
  return rows.map(rowToMoveForwardRequest);
}

export function getMoveForwardRequestById(id: string): MoveForwardRequest | null {
  const db = getDb();
  const row = db.prepare("SELECT * FROM move_forward_requests WHERE id = ?").get(id) as
    | MoveForwardRequestRow
    | undefined;
  return row ? rowToMoveForwardRequest(row) : null;
}

export function updateMoveForwardRequestStatus(id: string, status: MoveForwardStatus): void {
  const db = getDb();
  db.prepare(`
    UPDATE move_forward_requests
    SET status = ?, updated_at = ?
    WHERE id = ?
  `).run(status, new Date().toISOString(), id);
}
