import { randomUUID } from "crypto";
import { getDb } from "@/lib/db";
import {
  type PromptPilotSubmission,
  type PromptPilotSubmissionRow,
  rowToPromptPilotSubmission,
} from "@/lib/types";

export function createPromptPilotSubmission(data: {
  /** Omit for an anonymous submission (see `claimToken`); Prompt Pilot no longer requires an account up front. */
  userId?: string;
  learningGoal: string;
  startingPoint?: string;
  why?: string;
  timeBudget?: string;
  renderedPrompt?: string;
  /** Opaque token set on anonymous submissions so they can be claimed later; leave unset for a submission created with a real userId. */
  claimToken?: string;
}): PromptPilotSubmission {
  const db = getDb();
  const id = randomUUID();
  const now = new Date().toISOString();

  db.prepare(`
    INSERT INTO prompt_pilot_submissions (
      id, user_id, learning_goal, starting_point, why, time_budget,
      rendered_prompt, submitted_at, created_at, claim_token
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    data.userId ?? null,
    data.learningGoal,
    data.startingPoint ?? null,
    data.why ?? null,
    data.timeBudget ?? null,
    data.renderedPrompt ?? null,
    now,
    now,
    data.claimToken ?? null,
  );

  return getPromptPilotSubmissionById(id)!;
}

/**
 * Creates a submission for `data.userId`, or overwrites the existing one for
 * that user in place (same `id`/`created_at`, everything else replaced) if
 * they already have one on file. Resubmitting Prompt Pilot is meant to
 * update the user's answers/result, not be blocked by
 * idx_prompt_pilot_submissions_user_unique - see /api/prompt-pilot/submit.
 * `data.userId` must be a real user id here; anonymous submissions
 * (`userId` omitted) should keep using `createPromptPilotSubmission`
 * instead, since SQLite's unique index excludes NULL user_id and there's
 * nothing to conflict on.
 */
export function upsertPromptPilotSubmission(data: {
  userId: string;
  learningGoal: string;
  startingPoint?: string;
  why?: string;
  timeBudget?: string;
  renderedPrompt?: string;
}): PromptPilotSubmission {
  const db = getDb();
  const id = randomUUID();
  const now = new Date().toISOString();

  db.prepare(`
    INSERT INTO prompt_pilot_submissions (
      id, user_id, learning_goal, starting_point, why, time_budget,
      rendered_prompt, submitted_at, created_at, claim_token
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NULL)
    ON CONFLICT(user_id) DO UPDATE SET
      learning_goal = excluded.learning_goal,
      starting_point = excluded.starting_point,
      why = excluded.why,
      time_budget = excluded.time_budget,
      rendered_prompt = excluded.rendered_prompt,
      submitted_at = excluded.submitted_at
  `).run(
    id,
    data.userId,
    data.learningGoal,
    data.startingPoint ?? null,
    data.why ?? null,
    data.timeBudget ?? null,
    data.renderedPrompt ?? null,
    now,
    now,
  );

  return getPromptPilotSubmissionByUser(data.userId)!;
}

export function getPromptPilotSubmissionById(id: string): PromptPilotSubmission | null {
  const db = getDb();
  const row = db.prepare("SELECT * FROM prompt_pilot_submissions WHERE id = ?").get(id) as
    | PromptPilotSubmissionRow
    | undefined;
  return row ? rowToPromptPilotSubmission(row) : null;
}

/** One submission per user, mirroring the Opportunity Finder submissions pattern. */
export function getPromptPilotSubmissionByUser(userId: string): PromptPilotSubmission | null {
  const db = getDb();
  const row = db.prepare("SELECT * FROM prompt_pilot_submissions WHERE user_id = ?").get(userId) as
    | PromptPilotSubmissionRow
    | undefined;
  return row ? rowToPromptPilotSubmission(row) : null;
}

/**
 * Deletes the signed-in user's Prompt Pilot submission, if any - backs the
 * Reset button on the result screen (PromptPilotDisplay / /api/prompt-pilot/
 * reset), scoped to this one tool only. Distinct from
 * resetAllToolDataForUser() in @/lib/testAccount, which wipes every tool's
 * data at once for the gold-standard test account; this is available to any
 * signed-in user resetting just Prompt Pilot. No-op (not an error) if the
 * user has nothing on file.
 */
export function deletePromptPilotSubmissionByUser(userId: string): void {
  const db = getDb();
  db.prepare("DELETE FROM prompt_pilot_submissions WHERE user_id = ?").run(userId);
}

/**
 * Deletes an anonymous (unclaimed) Prompt Pilot submission by its claim
 * token - the anonymous-visitor counterpart to
 * deletePromptPilotSubmissionByUser, used by the same Reset button when
 * there's no session. No-op if the token doesn't match anything.
 */
export function deletePromptPilotSubmissionByClaimToken(claimToken: string): void {
  const db = getDb();
  db.prepare("DELETE FROM prompt_pilot_submissions WHERE claim_token = ?").run(claimToken);
}

export function getPromptPilotSubmissionByClaimToken(claimToken: string): PromptPilotSubmission | null {
  const db = getDb();
  const row = db
    .prepare("SELECT * FROM prompt_pilot_submissions WHERE claim_token = ?")
    .get(claimToken) as PromptPilotSubmissionRow | undefined;
  return row ? rowToPromptPilotSubmission(row) : null;
}

/**
 * Links an anonymous Prompt Pilot submission (found by its claim_token) to
 * a real account and clears the token so it can't be claimed again. Returns
 * null if the token doesn't match a pending (unclaimed) submission. Throws
 * the same SQLite UNIQUE constraint error as `createPromptPilotSubmission`
 * if the target user already has a submission on file
 * (idx_prompt_pilot_submissions_user_unique) - callers should catch that
 * the same way the submit route does.
 */
export function claimPromptPilotSubmission(
  claimToken: string,
  userId: string,
): PromptPilotSubmission | null {
  const db = getDb();
  const existing = getPromptPilotSubmissionByClaimToken(claimToken);
  if (!existing) return null;

  db.prepare("UPDATE prompt_pilot_submissions SET user_id = ?, claim_token = NULL WHERE id = ?").run(
    userId,
    existing.id,
  );

  return getPromptPilotSubmissionById(existing.id);
}
