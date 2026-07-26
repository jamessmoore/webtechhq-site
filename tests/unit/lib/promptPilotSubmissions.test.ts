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

  describe("upsertPromptPilotSubmission", () => {
    it("creates a submission when the user has none yet", () => {
      const otherUserId = users.createUser({
        firstName: "Grace",
        lastName: "Hopper",
        email: "pilot-upsert@example.com",
      }).id;

      const created = promptPilotSubmissions.upsertPromptPilotSubmission({
        userId: otherUserId,
        learningGoal: "how to automate reporting",
        startingPoint: "Never used AI",
        why: "I run a business",
        timeBudget: "Go deep",
        renderedPrompt: "first rendered prompt",
      });

      expect(created.learningGoal).toBe("how to automate reporting");
      expect(created.renderedPrompt).toBe("first rendered prompt");

      const fetched = promptPilotSubmissions.getPromptPilotSubmissionByUser(otherUserId);
      expect(fetched?.id).toBe(created.id);
    });

    it("overwrites the existing row in place (same id) when the user already has a submission", () => {
      // `userId` already has a submission from the "creates a submission
      // and reads it back by user id" test above.
      const before = promptPilotSubmissions.getPromptPilotSubmissionByUser(userId)!;

      const updated = promptPilotSubmissions.upsertPromptPilotSubmission({
        userId,
        learningGoal: "a resubmitted learning goal",
        startingPoint: "Used it, want to go deeper",
        why: "Personal curiosity",
        timeBudget: "Go deep",
        renderedPrompt: "a resubmitted rendered prompt",
      });

      expect(updated.id).toBe(before.id);
      expect(updated.learningGoal).toBe("a resubmitted learning goal");
      expect(updated.startingPoint).toBe("Used it, want to go deeper");
      expect(updated.renderedPrompt).toBe("a resubmitted rendered prompt");

      const fetched = promptPilotSubmissions.getPromptPilotSubmissionByUser(userId);
      expect(fetched?.id).toBe(before.id);
      expect(fetched?.learningGoal).toBe("a resubmitted learning goal");
    });
  });

  describe("deletePromptPilotSubmissionByUser", () => {
    it("deletes the user's submission so a subsequent lookup returns null", () => {
      const deleteUserId = users.createUser({
        firstName: "Margaret",
        lastName: "Hamilton",
        email: "pilot-delete@example.com",
      }).id;

      promptPilotSubmissions.createPromptPilotSubmission({
        userId: deleteUserId,
        learningGoal: "how to reset my result",
        renderedPrompt: "rendered prompt text",
      });
      expect(promptPilotSubmissions.getPromptPilotSubmissionByUser(deleteUserId)).not.toBeNull();

      promptPilotSubmissions.deletePromptPilotSubmissionByUser(deleteUserId);

      expect(promptPilotSubmissions.getPromptPilotSubmissionByUser(deleteUserId)).toBeNull();
    });

    it("is a no-op (doesn't throw) when the user has no submission on file", () => {
      const noSubmissionUserId = users.createUser({
        firstName: "Katherine",
        lastName: "Johnson",
        email: "pilot-no-submission@example.com",
      }).id;

      expect(() =>
        promptPilotSubmissions.deletePromptPilotSubmissionByUser(noSubmissionUserId),
      ).not.toThrow();
    });
  });

  describe("deletePromptPilotSubmissionByClaimToken", () => {
    it("deletes the anonymous submission matching the claim token", () => {
      const claimToken = "test-claim-token-delete";
      promptPilotSubmissions.createPromptPilotSubmission({
        learningGoal: "an anonymous submission",
        renderedPrompt: "rendered prompt text",
        claimToken,
      });
      expect(promptPilotSubmissions.getPromptPilotSubmissionByClaimToken(claimToken)).not.toBeNull();

      promptPilotSubmissions.deletePromptPilotSubmissionByClaimToken(claimToken);

      expect(promptPilotSubmissions.getPromptPilotSubmissionByClaimToken(claimToken)).toBeNull();
    });

    it("is a no-op (doesn't throw) when the token doesn't match anything", () => {
      expect(() =>
        promptPilotSubmissions.deletePromptPilotSubmissionByClaimToken("no-such-token"),
      ).not.toThrow();
    });
  });
});
