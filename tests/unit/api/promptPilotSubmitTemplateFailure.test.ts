import { beforeAll, afterAll, describe, it, expect, vi } from "vitest";
import { NextRequest } from "next/server";
import { useTestDatabase } from "../testDb";

// Deliberately its own file (own fresh module registry / db connection), so
// the prompt_pilot_template table genuinely has zero rows - mirrors
// tests/unit/lib/promptPilotTemplatesEmpty.test.ts's isolation reasoning.
// This is the production data-seeding gap scenario: renderPromptPilotTemplate()
// returns null, and the route must surface a real error rather than the old
// {success:true, renderedPrompt:null} behavior.
vi.mock("@/auth", () => ({ auth: vi.fn() }));

let cleanup: () => void;
let POST: typeof import("../../../src/app/api/prompt-pilot/submit/route").POST;
let users: typeof import("@/lib/users");
let promptPilotSubmissions: typeof import("@/lib/tools/promptPilotSubmissions");
let auth: { auth: ReturnType<typeof vi.fn> };

beforeAll(async () => {
  ({ cleanup } = useTestDatabase());
  ({ POST } = await import("@/app/api/prompt-pilot/submit/route"));
  users = await import("@/lib/users");
  promptPilotSubmissions = await import("@/lib/tools/promptPilotSubmissions");
  auth = (await import("@/auth")) as unknown as typeof auth;
});

afterAll(() => cleanup());

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

describe("POST /api/prompt-pilot/submit with no templates seeded", () => {
  it("returns a 500 error instead of a fake success, and does not persist a submission", async () => {
    auth.auth.mockResolvedValue(null);
    const res = await POST(request(validBody));
    expect(res.status).toBe(500);
    const data = (await res.json()) as { error?: string; success?: boolean };
    expect(data.success).toBeUndefined();
    expect(data.error).toBeTruthy();
  });

  it("does not create a row for a signed-in user either", async () => {
    const user = users.createUser({
      firstName: "No",
      lastName: "Template",
      email: "no.template@example.com",
      emailVerified: true,
    });
    auth.auth.mockResolvedValue({ user: { id: user.id } });

    const res = await POST(request(validBody));
    expect(res.status).toBe(500);
    expect(promptPilotSubmissions.getPromptPilotSubmissionByUser(user.id)).toBeNull();
  });
});
