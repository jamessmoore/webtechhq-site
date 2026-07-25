import { getDb } from "@/lib/db";
import type { PromptPilotStartingPoint, PromptPilotWhy, PromptPilotTimeBudget } from "@/lib/types";

// Matching/substitution logic only — the actual "have AI teach you AI"
// template copy lives in the `prompt_pilot_template` SQLite table, seeded
// from a gitignored local file (see scripts/seed-prompt-pilot-templates.js).
// This file must never contain template text. Mirrors
// src/lib/tools/promptTemplates.ts's pattern for Opportunity Finder.

export interface PromptPilotTemplateVars {
  learningGoal: string;
  startingPoint?: PromptPilotStartingPoint;
  why?: PromptPilotWhy;
  timeBudget?: PromptPilotTimeBudget;
}

function getTemplateText(
  startingPoint?: PromptPilotStartingPoint,
  why?: PromptPilotWhy,
  timeBudget?: PromptPilotTimeBudget,
): string | null {
  const db = getDb();

  if (startingPoint && why && timeBudget) {
    const row = db
      .prepare(
        `SELECT template_text FROM prompt_pilot_template
         WHERE trigger_starting_point = ? AND trigger_why = ? AND trigger_time_budget = ?
           AND is_fallback = 0`,
      )
      .get(startingPoint, why, timeBudget) as { template_text: string } | undefined;
    if (row) return row.template_text;
  }

  const fallback = db
    .prepare(`SELECT template_text FROM prompt_pilot_template WHERE is_fallback = 1 LIMIT 1`)
    .get() as { template_text: string } | undefined;

  return fallback?.template_text ?? null;
}

function substitute(text: string, vars: Record<string, string>): string {
  return text.replace(/\{(\w+)\}/g, (match, key: string) =>
    Object.prototype.hasOwnProperty.call(vars, key) ? vars[key] : match,
  );
}

/**
 * Selects the Prompt Pilot template matching (startingPoint, why,
 * timeBudget) — falling back to the single is_fallback row when there's no
 * exact match or any trigger answer is missing — then substitutes
 * placeholders with the submission's free-text learning goal.
 * Returns null only if no template rows have been seeded yet.
 */
export function renderPromptPilotTemplate(params: PromptPilotTemplateVars): string | null {
  const template = getTemplateText(params.startingPoint, params.why, params.timeBudget);
  if (template === null) return null;

  return substitute(template, {
    learning_goal: params.learningGoal,
    starting_point: params.startingPoint ?? "not specified",
    why: params.why ?? "not specified",
    time_budget: params.timeBudget ?? "not specified",
  });
}
