import { randomUUID } from "crypto";
import { beforeAll, afterAll, describe, it, expect } from "vitest";
import { useTestDatabase } from "../testDb";

let cleanup: () => void;
let getDb: typeof import("@/lib/db").getDb;
let renderPromptPilotTemplate: typeof import("@/lib/tools/promptPilotTemplates").renderPromptPilotTemplate;

function insertTemplate(row: {
  startingPoint?: string | null;
  why?: string | null;
  timeBudget?: string | null;
  isFallback?: boolean;
  templateText: string;
}) {
  const db = getDb();
  const now = new Date().toISOString();
  db.prepare(`
    INSERT INTO prompt_pilot_template
      (id, trigger_starting_point, trigger_why, trigger_time_budget, is_fallback, version, template_text, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, 1, ?, ?, ?)
  `).run(
    randomUUID(),
    row.startingPoint ?? null,
    row.why ?? null,
    row.timeBudget ?? null,
    row.isFallback ? 1 : 0,
    row.templateText,
    now,
    now,
  );
}

beforeAll(async () => {
  ({ cleanup } = useTestDatabase());
  ({ getDb } = await import("@/lib/db"));
  ({ renderPromptPilotTemplate } = await import("@/lib/tools/promptPilotTemplates"));

  insertTemplate({
    startingPoint: "Never used AI",
    why: "Personal curiosity",
    timeBudget: "Quick primer",
    templateText: "Teach a beginner about {learning_goal}, curiosity-driven, quick primer.",
  });
  insertTemplate({
    isFallback: true,
    templateText: "Fallback prompt about {learning_goal}.",
  });
});

afterAll(() => cleanup());

describe("renderPromptPilotTemplate", () => {
  it("selects the exact-match template and substitutes the learning goal", () => {
    const result = renderPromptPilotTemplate({
      learningGoal: "content marketing",
      startingPoint: "Never used AI",
      why: "Personal curiosity",
      timeBudget: "Quick primer",
    });
    expect(result).toBe("Teach a beginner about content marketing, curiosity-driven, quick primer.");
  });

  it("falls back when there's no exact match for the trigger combination", () => {
    const result = renderPromptPilotTemplate({
      learningGoal: "prompt engineering",
      startingPoint: "Used it, want to go deeper",
      why: "I run a business",
      timeBudget: "Go deep",
    });
    expect(result).toBe("Fallback prompt about prompt engineering.");
  });

  it("falls back when a trigger answer is missing entirely", () => {
    const result = renderPromptPilotTemplate({ learningGoal: "automation" });
    expect(result).toBe("Fallback prompt about automation.");
  });
});
