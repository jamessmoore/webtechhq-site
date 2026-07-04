import { randomUUID } from "crypto";
import { getDb } from "./db";
import { type Purchase, type PurchaseRow, rowToPurchase } from "./types";

export function createPurchase(data: {
  userId: string;
  productId: string;
  amountCents: number;
  currency: string;
  businessName?: string;
}): Purchase {
  const db = getDb();
  const id = randomUUID();
  const now = new Date().toISOString();

  db.prepare(`
    INSERT INTO purchases (id, user_id, product_id, status, amount_cents, currency, business_name, created_at)
    VALUES (?, ?, ?, 'created', ?, ?, ?, ?)
  `).run(id, data.userId, data.productId, data.amountCents, data.currency, data.businessName ?? null, now);

  return getPurchaseById(id)!;
}

export function getPurchaseById(id: string): Purchase | null {
  const db = getDb();
  const row = db.prepare("SELECT * FROM purchases WHERE id = ?").get(id) as PurchaseRow | undefined;
  return row ? rowToPurchase(row) : null;
}

export function updatePurchaseOrderId(id: string, paypalOrderId: string): void {
  const db = getDb();
  db.prepare("UPDATE purchases SET paypal_order_id = ? WHERE id = ?").run(paypalOrderId, id);
}

export function getPurchaseByOrderId(paypalOrderId: string): Purchase | null {
  const db = getDb();
  const row = db.prepare("SELECT * FROM purchases WHERE paypal_order_id = ?").get(paypalOrderId) as
    | PurchaseRow
    | undefined;
  return row ? rowToPurchase(row) : null;
}

export function getPurchasesByUser(userId: string): Purchase[] {
  const db = getDb();
  const rows = db.prepare("SELECT * FROM purchases WHERE user_id = ? ORDER BY created_at DESC").all(
    userId,
  ) as PurchaseRow[];
  return rows.map(rowToPurchase);
}

/** Idempotent: safe to call from both the synchronous capture route and the webhook. */
export function markPurchaseCaptured(
  paypalOrderId: string,
  data: { payerEmail?: string; rawCaptureJson: string },
): void {
  const db = getDb();
  db.prepare(`
    UPDATE purchases
    SET status = 'captured', payer_email = ?, raw_capture_json = ?, captured_at = ?
    WHERE paypal_order_id = ? AND status != 'captured'
  `).run(data.payerEmail ?? null, data.rawCaptureJson, new Date().toISOString(), paypalOrderId);
}

export function markPurchaseFailed(paypalOrderId: string): void {
  const db = getDb();
  db.prepare("UPDATE purchases SET status = 'failed' WHERE paypal_order_id = ? AND status != 'captured'").run(
    paypalOrderId,
  );
}

/** The single entitlement check every paid tool reuses. */
export function hasPurchased(userId: string, productId: string): boolean {
  const db = getDb();
  const row = db
    .prepare("SELECT 1 FROM purchases WHERE user_id = ? AND product_id = ? AND status = 'captured' LIMIT 1")
    .get(userId, productId);
  return row !== undefined;
}
