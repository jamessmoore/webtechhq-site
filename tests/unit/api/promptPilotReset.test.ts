import { beforeAll, afterAll, beforeEach, describe, it, expect, vi } from "vitest";
import { NextRequest } from "next/server";
import { useTestDatabase } from "../testDb";

vi.mock("@/auth", () => ({ auth: vi.fn() }));

let cleanup: () => void;
let POST: typeof import("../../../src/app/api/prompt-pilot/reset/route").POST;
let users: typeof import("@/lib/users");
let promptPilotSubmissions: typeof import("@/lib/tools/promptPilotSubmissions");
let auth: { auth: ReturnType<typeof vi.fn> };

let userId: string;

beforeAll(async () => {
  ({ cleanup } = useTestDatabase());
  ({ POST } = await import("@/app/api/prompt-pilot/reset/route"));
  users = await import("@/lib/users");
  promptPilotSubmissions = await import("@/lib/tools/promptPilotSubmissions");
  auth = (await import("@/auth")) as unknown as typeof auth;

  userId = users.createUser({
    firstName: "Hedy",
    lastName: "Lamarr",
    email: "pilot-reset@example.com",
  }).id;
});

afterAll(() => cleanup());

beforeEach(() => {
  auth.auth.mockReset();
});

function request(cookies?: Record<string, string>) {
  const req = new NextRequest("http://localhost:3000/api/prompt-pilot/reset", { method: "POST" });
  if (cookies) {
    for (const [name, value] of Object.entries(cookies)) {
      req.cookies.set(name, value);
    }
  }
  return req;
}

describe("POST /api/prompt-pilot/reset", () => {
  it("deletes the signed-in user's submission", async () => {
    promptPilotSubmissions.createPromptPilotSubmission({
      userId,
      learningGoal: "how to reset my result",
      renderedPrompt: "rendered prompt text",
    });
    expect(promptPilotSubmissions.getPromptPilotSubmissionByUser(userId)).not.toBeNull();

    auth.auth.mockResolvedValue({ user: { id: userId } });
    const res = await POST(request());

    expect(res.status).toBe(200);
    const data = (await res.json()) as { success: boolean };
    expect(data.success).toBe(true);
    expect(promptPilotSubmissions.getPromptPilotSubmissionByUser(userId)).toBeNull();
  });

  it("succeeds (no-op) for a signed-in user with nothing on file", async () => {
    const emptyUserId = users.createUser({
      firstName: "Radia",
      lastName: "Perlman",
      email: "pilot-reset-empty@example.com",
    }).id;

    auth.auth.mockResolvedValue({ user: { id: emptyUserId } });
    const res = await POST(request());

    expect(res.status).toBe(200);
  });

  it("deletes the anonymous submission matching the claim cookie and clears it", async () => {
    const claimToken = "pp-reset-claim-token";
    promptPilotSubmissions.createPromptPilotSubmission({
      learningGoal: "an anonymous submission",
      renderedPrompt: "rendered prompt text",
      claimToken,
    });
    expect(promptPilotSubmissions.getPromptPilotSubmissionByClaimToken(claimToken)).not.toBeNull();

    auth.auth.mockResolvedValue(null);
    const res = await POST(request({ pp_claim_token: claimToken }));

    expect(res.status).toBe(200);
    expect(promptPilotSubmissions.getPromptPilotSubmissionByClaimToken(claimToken)).toBeNull();
    expect(res.cookies.get("pp_claim_token")?.value).toBe("");
  });

  it("succeeds (no-op) for an anonymous visitor with no claim cookie", async () => {
    auth.auth.mockResolvedValue(null);
    const res = await POST(request());

    expect(res.status).toBe(200);
  });
});
