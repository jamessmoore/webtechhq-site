import { beforeAll, afterAll, describe, it, expect } from "vitest";
import { useTestDatabase } from "../testDb";

// Deliberately its own file (and therefore its own fresh module registry /
// db connection) so the prompt_pilot_template table genuinely has zero rows,
// unlike promptPilotTemplates.test.ts which seeds rows in beforeAll.
let cleanup: () => void;
let renderPromptPilotTemplate: typeof import("@/lib/tools/promptPilotTemplates").renderPromptPilotTemplate;

beforeAll(async () => {
  ({ cleanup } = useTestDatabase());
  ({ renderPromptPilotTemplate } = await import("@/lib/tools/promptPilotTemplates"));
});

afterAll(() => cleanup());

describe("renderPromptPilotTemplate with no templates seeded", () => {
  it("returns null rather than throwing", () => {
    expect(
      renderPromptPilotTemplate({
        learningGoal: "anything",
        startingPoint: "Never used AI",
        why: "Personal curiosity",
        timeBudget: "Quick primer",
      }),
    ).toBeNull();
  });
});
