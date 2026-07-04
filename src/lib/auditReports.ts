import { randomUUID } from "crypto";
import { getDb } from "./db";
import {
  type AuditReport,
  type AuditReportRecord,
  type AuditReportRow,
  rowToAuditReport,
} from "./types";

export function createPendingAuditReport(data: {
  purchaseId: string;
  userId: string;
  productId: string;
}): AuditReportRecord {
  const db = getDb();
  const id = randomUUID();
  const now = new Date().toISOString();

  db.prepare(`
    INSERT INTO audit_reports (id, purchase_id, user_id, product_id, status, created_at)
    VALUES (?, ?, ?, ?, 'generating', ?)
  `).run(id, data.purchaseId, data.userId, data.productId, now);

  return getAuditReportById(id)!;
}

export function getAuditReportById(id: string): AuditReportRecord | null {
  const db = getDb();
  const row = db.prepare("SELECT * FROM audit_reports WHERE id = ?").get(id) as AuditReportRow | undefined;
  return row ? rowToAuditReport(row) : null;
}

export function markAuditReportReady(id: string, report: AuditReport): void {
  const db = getDb();
  db.prepare(`
    UPDATE audit_reports
    SET status = 'ready', report_json = ?, completed_at = ?
    WHERE id = ?
  `).run(JSON.stringify(report), new Date().toISOString(), id);
}

export function markAuditReportFailed(id: string, errorMessage: string): void {
  const db = getDb();
  db.prepare(`
    UPDATE audit_reports
    SET status = 'failed', error_message = ?, completed_at = ?
    WHERE id = ?
  `).run(errorMessage, new Date().toISOString(), id);
}

export function getAuditReportByPurchase(purchaseId: string): AuditReportRecord | null {
  const db = getDb();
  const row = db.prepare("SELECT * FROM audit_reports WHERE purchase_id = ?").get(purchaseId) as
    | AuditReportRow
    | undefined;
  return row ? rowToAuditReport(row) : null;
}

export function getLatestAuditReportForUser(userId: string, productId: string): AuditReportRecord | null {
  const db = getDb();
  const row = db
    .prepare(
      "SELECT * FROM audit_reports WHERE user_id = ? AND product_id = ? ORDER BY created_at DESC LIMIT 1",
    )
    .get(userId, productId) as AuditReportRow | undefined;
  return row ? rowToAuditReport(row) : null;
}
