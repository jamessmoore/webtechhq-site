import { beforeAll, afterAll, beforeEach, describe, it, expect, vi } from "vitest";
import { NextRequest } from "next/server";
import { useTestDatabase } from "../testDb";

vi.mock("@/auth", () => ({ auth: vi.fn() }));

let cleanup: () => void;
let POST: typeof import("../../../src/app/api/prompt-pilot/submit/route").POST;
let users: typeof import("@/lib/users");
let promptPilotSubmissions: typeof import("@/lib/tools/promptPilotSubmissions");
let auth: { auth: ReturnType<typeof vi.fn> };

let verifiedUserId: string;
let unverifiedUserId: string;

beforeAll(async () => {
  ({ cleanup } = useTestDatabase());
  ({ POST } = await import("@/app/api/prompt-pilot/submit/route"));
  users = await import("@/lib/users");
  promptPilotSubmissions = await import("@/lib/tools/promptPilotSubmissions");
  auth = (await import("@/auth")) as unknown as typeof auth;

  const verified = users.createUser({
    firstName: "Ada",
    lastName: "Lovelace",
    email: "verified.pilot@example.com",
    emailVerified: true,
  });
  verifiedUserId = verified.id;

  unverifiedUserId = users.createUser({
    firstName: "Grace",
    email: "unverified.pilot@example.com",
    emailVerified: false,
  }).id;
});

afterAll(() => cleanup());

beforeEach(() => {
  auth.auth.mockReset();
});

const validBody = {
  learningGoal: "how to use AI in my daily work",
  startingPoint: "Never used AI",
  why: "Career or job search",
  timeBudget: "Quick primer",
  recaptchaToken: "irrelevant-when-unconfigured",
};

function request(body: unknown) {
  return new NextRequest("http://localhost:3000/api/prompt-pilot/submit", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/prompt-pilot/submit", () => {
  it("returns 401 when there is no session", async () => {
    auth.auth.mockResolvedValue(null);
    const res = await request(validBody);
    expect((await POST(res)).status).toBe(401);
  });

  it("returns 401 when the session user no longer exists in the db", async () => {
    auth.auth.mockResolvedValue({ user: { id: "ghost-user" } });
    const res = await POST(request(validBody));
    expect(res.status).toBe(401);
  });

  it("returns 403 when the user hasn't verified their email", async () => {
    auth.auth.mockResolvedValue({ user: { id: unverifiedUserId } });
    const res = await POST(request(validBody));
    expect(res.status).toBe(403);
  });

  it("returns 400 when learningGoal is missing", async () => {
    auth.auth.mockResolvedValue({ user: { id: verifiedUserId } });
    const res = await POST(request({ ...validBody, learningGoal: "  " }));
    expect(res.status).toBe(400);
  });

  it("creates a submission and returns the rendered prompt and why answer, without templates seeded null is fine", async () => {
    auth.auth.mockResolvedValue({ user: { id: verifiedUserId } });
    const res = await POST(request(validBody));
    expect(res.status).toBe(200);
    const data = (await res.json()) as { success: boolean; renderedPrompt: string | null; why: string | null };
    expect(data.success).toBe(true);
    expect(data.why).toBe("Career or job search");

    const stored = promptPilotSubmissions.getPromptPilotSubmissionByUser(verifiedUserId);
    expect(stored?.learningGoal).toBe("how to use AI in my daily work");
    expect(stored?.startingPoint).toBe("Never used AI");
    expect(stored?.timeBudget).toBe("Quick primer");
  });

  it("returns 409 on a second submission from the same user", async () => {
    auth.auth.mockResolvedValue({ user: { id: verifiedUserId } });
    const res = await POST(request(validBody));
    expect(res.status).toBe(409);
  });
});
