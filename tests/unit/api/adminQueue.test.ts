import { beforeAll, afterAll, beforeEach, describe, it, expect, vi } from "vitest";
import { NextRequest } from "next/server";
import { useTestDatabase } from "../testDb";

vi.mock("@/auth", () => ({ auth: vi.fn() }));

const ADMIN_EMAIL = "admin@example.com";

let cleanup: () => void;
let PATCH: typeof import("../../../src/app/api/admin/queue/[id]/route").PATCH;
let users: typeof import("@/lib/users");
let moveForwardRequests: typeof import("@/lib/moveForwardRequests");
let auth: { auth: ReturnType<typeof vi.fn> };

let userId: string;
let requestId: string;

beforeAll(async () => {
  ({ cleanup } = useTestDatabase());
  process.env.ADMIN_EMAIL = ADMIN_EMAIL;
  ({ PATCH } = await import("@/app/api/admin/queue/[id]/route"));
  users = await import("@/lib/users");
  moveForwardRequests = await import("@/lib/moveForwardRequests");
  auth = (await import("@/auth")) as unknown as typeof auth;

  userId = users.createUser({ firstName: "Queue", lastName: "Member", email: "queue.member@example.com" }).id;
  requestId = moveForwardRequests.createMoveForwardRequest(userId).id;
});

afterAll(() => {
  cleanup();
  delete process.env.ADMIN_EMAIL;
});

beforeEach(() => {
  auth.auth.mockReset();
  auth.auth.mockResolvedValue({ user: { email: ADMIN_EMAIL } });
});

function patch(id: string, body: unknown) {
  return PATCH(
    new NextRequest(`http://localhost:3000/api/admin/queue/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }),
    { params: Promise.resolve({ id }) },
  );
}

describe("PATCH /api/admin/queue/[id]", () => {
  it("returns 403 when the session isn't the admin", async () => {
    auth.auth.mockResolvedValue({ user: { email: "not.admin@example.com" } });
    const res = await patch(requestId, { status: "contacted" });
    expect(res.status).toBe(403);
  });

  it("returns 403 when there is no session", async () => {
    auth.auth.mockResolvedValue(null);
    const res = await patch(requestId, { status: "contacted" });
    expect(res.status).toBe(403);
  });

  it("returns 404 for an unknown queue entry", async () => {
    const res = await patch("does-not-exist", { status: "contacted" });
    expect(res.status).toBe(404);
  });

  it("returns 400 for an invalid status", async () => {
    const res = await patch(requestId, { status: "bogus" });
    expect(res.status).toBe(400);
  });

  it("updates the status for a valid request", async () => {
    const res = await patch(requestId, { status: "contacted" });
    expect(res.status).toBe(200);

    const updated = moveForwardRequests.getMoveForwardRequestById(requestId);
    expect(updated!.status).toBe("contacted");
  });

  it("allows moving all the way to converted", async () => {
    const res = await patch(requestId, { status: "converted" });
    expect(res.status).toBe(200);

    const updated = moveForwardRequests.getMoveForwardRequestById(requestId);
    expect(updated!.status).toBe("converted");
  });
});
