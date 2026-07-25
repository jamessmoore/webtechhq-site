import { randomUUID } from "crypto";
import { getDb } from "./db";
import {
  type Submission,
  type SubmissionRow,
  type SubmissionWithUser,
  type ValidationFlag,
  rowToSubmission,
} from "./types";

export function createSubmission(data: {
  /** Omit for an anonymous submission (see `claimToken`); the Opportunity Finder no longer requires an account up front. */
  userId?: string;
  businessType?: string;
  teamSize?: string;
  layer1Problem?: string;
  layer1Elimination?: string;
  layer2Hours?: number;
  layer2Salary?: string;
  layer3Repetitive?: string;
  layer3Compliance?: string;
  layer3ComplianceDetail?: string;
  layer3Data?: string;
  additionalNotes?: string;
  renderedPrompt?: string;
  validationFlags?: ValidationFlag[];
  /** Opaque token set on anonymous submissions so they can be claimed later; leave unset for a submission created with a real userId. */
  claimToken?: string;
}): Submission {
  const db = getDb();
  const id = randomUUID();
  const now = new Date().toISOString();

  db.prepare(`
    INSERT INTO submissions (
      id, user_id, business_type, team_size,
      layer1_problem, layer1_elimination,
      layer2_hours, layer2_salary,
      layer3_repetitive, layer3_compliance, layer3_compliance_detail, layer3_data,
      additional_notes, rendered_prompt, submitted_at, created_at, validation_flags, approval_status,
      claim_token
    ) VALUES (
      ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending_review', ?
    )
  `).run(
    id,
    data.userId ?? null,
    data.businessType ?? null,
    data.teamSize ?? null,
    data.layer1Problem ?? null,
    data.layer1Elimination ?? null,
    data.layer2Hours ?? null,
    data.layer2Salary ?? null,
    data.layer3Repetitive ?? null,
    data.layer3Compliance ?? null,
    data.layer3ComplianceDetail ?? null,
    data.layer3Data ?? null,
    data.additionalNotes ?? null,
    data.renderedPrompt ?? null,
    now,
    now,
    JSON.stringify(data.validationFlags ?? []),
    data.claimToken ?? null,
  );

  return getSubmissionById(id)!;
}

export function getSubmissionById(id: string): Submission | null {
  const db = getDb();
  const row = db.prepare("SELECT * FROM submissions WHERE id = ?").get(id) as SubmissionRow | undefined;
  return row ? rowToSubmission(row) : null;
}

export function getSubmissionWithUser(id: string): SubmissionWithUser | null {
  const db = getDb();
  const row = db.prepare(`
    SELECT s.*, u.first_name, u.last_name, u.email
    FROM submissions s
    JOIN users u ON u.id = s.user_id
    WHERE s.id = ?
  `).get(id) as (SubmissionRow & { first_name: string; last_name: string | null; email: string }) | undefined;
  if (!row) return null;
  return {
    ...rowToSubmission(row),
    user: { firstName: row.first_name, lastName: row.last_name ?? undefined, email: row.email },
  };
}

export function getSubmissionByClaimToken(claimToken: string): Submission | null {
  const db = getDb();
  const row = db.prepare("SELECT * FROM submissions WHERE claim_token = ?").get(claimToken) as
    | SubmissionRow
    | undefined;
  return row ? rowToSubmission(row) : null;
}

/**
 * Links an anonymous submission (found by its claim_token) to a real
 * account and clears the token so it can't be claimed again. Returns null
 * if the token doesn't match a pending (unclaimed) submission. Throws the
 * same SQLite UNIQUE constraint error as `createSubmission` if the target
 * user already has a submission on file (idx_submissions_user_unique) -
 * callers should catch that the same way the submit route does.
 */
export function claimSubmission(claimToken: string, userId: string): Submission | null {
  const db = getDb();
  const existing = getSubmissionByClaimToken(claimToken);
  if (!existing) return null;

  db.prepare("UPDATE submissions SET user_id = ?, claim_token = NULL WHERE id = ?").run(
    userId,
    existing.id,
  );

  return getSubmissionById(existing.id);
}

export function getSubmissionsByUser(userId: string): Submission[] {
  const db = getDb();
  const rows = db.prepare("SELECT * FROM submissions WHERE user_id = ? ORDER BY submitted_at DESC").all(userId) as SubmissionRow[];
  return rows.map(rowToSubmission);
}

export function getAllSubmissions(): SubmissionWithUser[] {
  const db = getDb();
  const rows = db.prepare(`
    SELECT
      s.*,
      u.first_name, u.last_name, u.email
    FROM submissions s
    JOIN users u ON u.id = s.user_id
    ORDER BY s.submitted_at DESC
  `).all() as (SubmissionRow & { first_name: string; last_name: string | null; email: string })[];

  return rows.map((row) => ({
    ...rowToSubmission(row),
    user: { firstName: row.first_name, lastName: row.last_name ?? undefined, email: row.email },
  }));
}

export function updateSubmissionNotes(id: string, notes: string): void {
  const db = getDb();
  db.prepare("UPDATE submissions SET admin_notes = ? WHERE id = ?").run(notes, id);
}

export function addValidationFlag(id: string, flag: ValidationFlag): void {
  const db = getDb();
  const row = db.prepare("SELECT validation_flags FROM submissions WHERE id = ?").get(id) as
    | { validation_flags: string }
    | undefined;
  if (!row) return;
  const flags: ValidationFlag[] = JSON.parse(row.validation_flags);
  if (!flags.includes(flag)) {
    flags.push(flag);
    db.prepare("UPDATE submissions SET validation_flags = ? WHERE id = ?").run(
      JSON.stringify(flags),
      id,
    );
  }
}
