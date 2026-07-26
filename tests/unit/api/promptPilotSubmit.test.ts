import { randomUUID } from "crypto";
import { beforeAll, afterAll, beforeEach, describe, it, expect, vi } from "vitest";
import { NextRequest } from "next/server";
import { useTestDatabase } from "../testDb";

vi.mock("@/auth", () => ({ auth: vi.fn() }));

let cleanup: () => void;
let POST: typeof import("../../../src/app/api/prompt-pilot/submit/route").POST;
let users: typeof import("@/lib/users");
let promptPilotSubmissions: typeof import("@/lib/tools/promptPilotSubmissions");
let getDb: typeof import("@/lib/db").getDb;
let auth: { auth: ReturnType<typeof vi.fn> };

let verifiedUserId: string;
let unverifiedUserId: string;

// Mirrors tests/unit/lib/promptPilotTemplates.test.ts's helper - this file's
// route calls the real renderPromptPilotTemplate(), which returns null (and,
// since the fix, the route now turns that into a 500) unless at least a
// fallback row exists. Seeding one fallback row here means every trigger
// combination below renders something real, matching production once
// templates are actually seeded.
function insertFallbackTemplate() {
  const db = getDb();
  const now = new Date().toISOString();
  db.prepare(`
    INSERT INTO prompt_pilot_template
      (id, trigger_starting_point, trigger_why, trigger_time_budget, is_fallback, version, template_text, created_at, updated_at)
    VALUES (?, NULL, NULL, NULL, 1, 1, ?, ?, ?)
  `).run(randomUUID(), "Fallback prompt about {learning_goal}.", now, now);
}

beforeAll(async () => {
  ({ cleanup } = useTestDatabase());
  ({ POST } = await import("@/app/api/prompt-pilot/submit/route"));
  users = await import("@/lib/users");
  promptPilotSubmissions = await import("@/lib/tools/promptPilotSubmissions");
  ({ getDb } = await import("@/lib/db"));
  auth = (await import("@/auth")) as unknown as typeof auth;

  insertFallbackTemplate();

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
  it("creates an anonymous submission and sets a claim cookie when there is no session", async () => {
    auth.auth.mockResolvedValue(null);
    const res = await POST(request(validBody));
    expect(res.status).toBe(200);
    const data = (await res.json()) as { success: boolean; renderedPrompt: string | null };
    expect(data.success).toBe(true);
    expect(data.renderedPrompt).toBeTruthy();
    expect(res.cookies.get("pp_claim_token")?.value).toBeTruthy();
  });

  it("falls back to the anonymous flow when the session user no longer exists in the db", async () => {
    auth.auth.mockResolvedValue({ user: { id: "ghost-user" } });
    const res = await POST(request(validBody));
    expect(res.status).toBe(200);
    const data = (await res.json()) as { success: boolean; renderedPrompt: string | null };
    expect(data.success).toBe(true);
    expect(res.cookies.get("pp_claim_token")?.value).toBeTruthy();
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

  it("creates a submission and returns the rendered prompt and why answer", async () => {
    auth.auth.mockResolvedValue({ user: { id: verifiedUserId } });
    const res = await POST(request(validBody));
    expect(res.status).toBe(200);
    const data = (await res.json()) as { success: boolean; renderedPrompt: string | null; why: string | null };
    expect(data.success).toBe(true);
    expect(data.renderedPrompt).toBeTruthy();
    expect(data.why).toBe("Career or job search");

    const stored = promptPilotSubmissions.getPromptPilotSubmissionByUser(verifiedUserId);
    expect(stored?.learningGoal).toBe("how to use AI in my daily work");
    expect(stored?.startingPoint).toBe("Never used AI");
    expect(stored?.timeBudget).toBe("Quick primer");
  });

  it("overwrites the existing submission (rather than 409ing) when the same user resubmits", async () => {
    auth.auth.mockResolvedValue({ user: { id: verifiedUserId } });
    const firstRes = await POST(request(validBody));
    expect(firstRes.status).toBe(200);
    const firstStored = promptPilotSubmissions.getPromptPilotSubmissionByUser(verifiedUserId);

    const secondRes = await POST(
      request({ ...validBody, learningGoal: "how to automate my invoicing" }),
    );
    expect(secondRes.status).toBe(200);
    const secondData = (await secondRes.json()) as { success: boolean };
    expect(secondData.success).toBe(true);

    const secondStored = promptPilotSubmissions.getPromptPilotSubmissionByUser(verifiedUserId);
    expect(secondStored?.learningGoal).toBe("how to automate my invoicing");
    // Same row, updated in place - not a second row (there can only be one
    // per idx_prompt_pilot_submissions_user_unique, and this proves it's
    // the upsert path rather than a create that happened to succeed).
    expect(secondStored?.id).toBe(firstStored?.id);
  });
});
