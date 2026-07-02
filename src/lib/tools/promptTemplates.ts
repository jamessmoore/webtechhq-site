import { getDb } from "@/lib/db";
import type { RepetitiveAnswer, ComplianceAnswer, DataAnswer, TeamSize } from "@/lib/types";

// Matching/substitution logic only — the actual template copy lives in the
// `prompt_template` SQLite table, seeded from a gitignored local file (see
// scripts/seed-prompt-templates.js). This file must never contain template
// text.

export interface PromptTemplateVars {
  businessType?: string;
  teamSize?: TeamSize;
  layer1Problem?: string;
  layer1Elimination?: string;
  layer2Hours?: number;
  layer2Salary?: string;
  complianceDetail?: string;
  additionalNotes?: string;
}

function getTemplateText(
  repetitive?: RepetitiveAnswer,
  compliance?: ComplianceAnswer,
  data?: DataAnswer,
): string | null {
  const db = getDb();

  if (repetitive && compliance && data) {
    const row = db
      .prepare(
        `SELECT template_text FROM prompt_template
         WHERE trigger_repetitive = ? AND trigger_compliance = ? AND trigger_data = ?
           AND is_fallback = 0`,
      )
      .get(repetitive, compliance, data) as { template_text: string } | undefined;
    if (row) return row.template_text;
  }

  const fallback = db
    .prepare(`SELECT template_text FROM prompt_template WHERE is_fallback = 1 LIMIT 1`)
    .get() as { template_text: string } | undefined;

  return fallback?.template_text ?? null;
}

function substitute(text: string, vars: Record<string, string>): string {
  return text.replace(/\{(\w+)\}/g, (match, key: string) =>
    Object.prototype.hasOwnProperty.call(vars, key) ? vars[key] : match,
  );
}

/**
 * Selects the prompt template matching (repetitive, compliance, data) —
 * falling back to the single is_fallback row when there's no exact match or
 * any trigger answer is missing — then substitutes placeholders with the
 * submission's free-text answers.
 * Returns null only if no template rows have been seeded yet.
 */
export function renderPromptTemplate(params: {
  repetitive?: RepetitiveAnswer;
  compliance?: ComplianceAnswer;
  data?: DataAnswer;
  vars: PromptTemplateVars;
}): string | null {
  const template = getTemplateText(params.repetitive, params.compliance, params.data);
  if (template === null) return null;

  return substitute(template, {
    business_type: params.vars.businessType ?? "your business",
    team_size: params.vars.teamSize ?? "not specified",
    layer1_problem: params.vars.layer1Problem ?? "",
    layer1_elimination: params.vars.layer1Elimination ?? "",
    layer2_hours: params.vars.layer2Hours != null ? String(params.vars.layer2Hours) : "an unspecified number of",
    layer2_salary: params.vars.layer2Salary ?? "an unspecified",
    compliance_detail: params.vars.complianceDetail ?? "",
    additional_notes: params.vars.additionalNotes ?? "",
  });
}
