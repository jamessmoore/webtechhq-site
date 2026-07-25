import { randomUUID } from "crypto";
import { getDb } from "@/lib/db";
import {
  type PromptPilotSubmission,
  type PromptPilotSubmissionRow,
  rowToPromptPilotSubmission,
} from "@/lib/types";

export function createPromptPilotSubmission(data: {
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
      rendered_prompt, submitted_at, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
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

  return getPromptPilotSubmissionById(id)!;
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
