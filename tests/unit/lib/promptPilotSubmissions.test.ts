import { beforeAll, afterAll, describe, it, expect } from "vitest";
import { useTestDatabase } from "../testDb";

let cleanup: () => void;
let promptPilotSubmissions: typeof import("@/lib/tools/promptPilotSubmissions");
let users: typeof import("@/lib/users");
let userId: string;

beforeAll(async () => {
  ({ cleanup } = useTestDatabase());
  promptPilotSubmissions = await import("@/lib/tools/promptPilotSubmissions");
  users = await import("@/lib/users");
  userId = users.createUser({ firstName: "Ada", lastName: "Lovelace", email: "pilot@example.com" }).id;
});

afterAll(() => cleanup());

describe("prompt pilot submissions", () => {
  it("returns null when the user has no submission yet", () => {
    expect(promptPilotSubmissions.getPromptPilotSubmissionByUser(userId)).toBeNull();
  });

  it("creates a submission and reads it back by user id", () => {
    const created = promptPilotSubmissions.createPromptPilotSubmission({
      userId,
      learningGoal: "how to use AI at work",
      startingPoint: "Never used AI",
      why: "Career or job search",
      timeBudget: "Quick primer",
      renderedPrompt: "rendered prompt text",
    });

    expect(created.learningGoal).toBe("how to use AI at work");
    expect(created.renderedPrompt).toBe("rendered prompt text");

    const fetched = promptPilotSubmissions.getPromptPilotSubmissionByUser(userId);
    expect(fetched?.id).toBe(created.id);
    expect(fetched?.startingPoint).toBe("Never used AI");
    expect(fetched?.why).toBe("Career or job search");
    expect(fetched?.timeBudget).toBe("Quick primer");
  });

  it("enforces one submission per user (unique index)", () => {
    expect(() =>
      promptPilotSubmissions.createPromptPilotSubmission({
        userId,
        learningGoal: "a second attempt",
      }),
    ).toThrow(/UNIQUE constraint failed/);
  });
});
