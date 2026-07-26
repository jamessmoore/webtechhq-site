import { beforeAll, afterAll, beforeEach, describe, it, expect, vi } from "vitest";
import { useTestDatabase } from "../testDb";
import type { AuditReport } from "@/lib/types";

vi.mock("@/auth", () => ({ auth: vi.fn() }));

let cleanup: () => void;
let POST: typeof import("../../../src/app/api/tools/business-audit/move-forward/route").POST;
let users: typeof import("@/lib/users");
let purchases: typeof import("@/lib/purchases");
let auditReports: typeof import("@/lib/auditReports");
let moveForwardRequests: typeof import("@/lib/moveForwardRequests");
let auth: { auth: ReturnType<typeof vi.fn> };

let userId: string;

const minimalReport: AuditReport = {
  businessName: "Acme Co",
  ownerFirstName: "Test",
  auditDate: "2026-07-25",
  openingNote: "Thanks for the interest.",
  opportunities: [],
  totalTimeSavedLabel: "0 hrs",
  totalMonthlyValueLabel: "$0",
  recommendedOpportunityRank: 1,
  recommendedReasoning: "N/A",
  questionsRaised: [],
};

beforeAll(async () => {
  ({ cleanup } = useTestDatabase());
  ({ POST } = await import("@/app/api/tools/business-audit/move-forward/route"));
  users = await import("@/lib/users");
  purchases = await import("@/lib/purchases");
  auditReports = await import("@/lib/auditReports");
  moveForwardRequests = await import("@/lib/moveForwardRequests");
  auth = (await import("@/auth")) as unknown as typeof auth;

  userId = users.createUser({ firstName: "Queue", lastName: "Tester", email: "queue.tester@example.com" }).id;
});

afterAll(() => cleanup());

beforeEach(() => {
  auth.auth.mockReset();
  auth.auth.mockResolvedValue({ user: { id: userId } });
});

function capturePurchase(uid: string) {
  const purchase = purchases.createPurchase({ userId: uid, productId: "business_audit", amountCents: 5000, currency: "USD" });
  purchases.updatePurchaseOrderId(purchase.id, `ORDER-${purchase.id}`);
  purchases.markPurchaseCaptured(`ORDER-${purchase.id}`, { rawCaptureJson: "{}" });
  return purchase;
}

function readyReportFor(uid: string) {
  const purchase = capturePurchase(uid);
  const record = auditReports.createPendingAuditReport({ purchaseId: purchase.id, userId: uid, productId: "business_audit" });
  auditReports.markAuditReportReady(record.id, minimalReport);
}

describe("POST /api/tools/business-audit/move-forward", () => {
  it("returns 401 when there is no session", async () => {
    auth.auth.mockResolvedValue(null);
    const res = await POST();
    expect(res.status).toBe(401);
  });

  it("returns 403 when the user hasn't purchased a Business Audit", async () => {
    const noPurchaseUser = users.createUser({ firstName: "No", lastName: "Purchase", email: "no.purchase@example.com" }).id;
    auth.auth.mockResolvedValue({ user: { id: noPurchaseUser } });

    const res = await POST();
    expect(res.status).toBe(403);
  });

  it("returns 409 when the audit report isn't ready yet", async () => {
    const generatingUser = users.createUser({ firstName: "Still", lastName: "Generating", email: "still.generating@example.com" }).id;
    auth.auth.mockResolvedValue({ user: { id: generatingUser } });
    const purchase = capturePurchase(generatingUser);
    auditReports.createPendingAuditReport({ purchaseId: purchase.id, userId: generatingUser, productId: "business_audit" });

    const res = await POST();
    expect(res.status).toBe(409);
  });

  it("creates a waiting queue entry once purchased and the report is ready", async () => {
    readyReportFor(userId);

    const res = await POST();
    expect(res.status).toBe(200);
    const body = (await res.json()) as { status: string };
    expect(body.status).toBe("waiting");

    const stored = moveForwardRequests.getMoveForwardRequestByUser(userId);
    expect(stored).not.toBeNull();
    expect(stored!.status).toBe("waiting");
  });

  it("is idempotent: a repeat request returns the same entry instead of creating a duplicate", async () => {
    const first = moveForwardRequests.getMoveForwardRequestByUser(userId);

    const res = await POST();
    expect(res.status).toBe(200);

    const second = moveForwardRequests.getMoveForwardRequestByUser(userId);
    expect(second!.id).toBe(first!.id);
  });
});
