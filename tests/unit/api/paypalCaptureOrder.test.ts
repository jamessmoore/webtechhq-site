import { beforeAll, afterAll, beforeEach, describe, it, expect, vi } from "vitest";
import { NextRequest } from "next/server";
import { useTestDatabase } from "../testDb";

vi.mock("@/auth", () => ({ auth: vi.fn() }));
vi.mock("@/lib/paypal", () => ({ captureOrder: vi.fn() }));
vi.mock("@/lib/tools/auditReportGenerator", () => ({ generateAuditReport: vi.fn() }));

let cleanup: () => void;
let POST: typeof import("../../../src/app/api/payments/paypal/capture-order/route").POST;
let users: typeof import("@/lib/users");
let submissions: typeof import("@/lib/submissions");
let purchases: typeof import("@/lib/purchases");
let auditReports: typeof import("@/lib/auditReports");
let auth: { auth: ReturnType<typeof vi.fn> };
let paypal: { captureOrder: ReturnType<typeof vi.fn> };
let generator: { generateAuditReport: ReturnType<typeof vi.fn> };

let userId: string;

beforeAll(async () => {
  ({ cleanup } = useTestDatabase());
  ({ POST } = await import("@/app/api/payments/paypal/capture-order/route"));
  users = await import("@/lib/users");
  submissions = await import("@/lib/submissions");
  purchases = await import("@/lib/purchases");
  auditReports = await import("@/lib/auditReports");
  auth = (await import("@/auth")) as unknown as typeof auth;
  paypal = (await import("@/lib/paypal")) as unknown as typeof paypal;
  generator = (await import("@/lib/tools/auditReportGenerator")) as unknown as typeof generator;

  userId = users.createUser({ firstName: "Capture", lastName: "Test", email: "capture.test@example.com" }).id;
});

afterAll(() => cleanup());

beforeEach(() => {
  auth.auth.mockReset();
  paypal.captureOrder.mockReset();
  generator.generateAuditReport.mockReset().mockResolvedValue({});
  auth.auth.mockResolvedValue({ user: { id: userId } });
});

function request(body: unknown) {
  return new NextRequest("http://localhost:3000/api/payments/paypal/capture-order", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/payments/paypal/capture-order", () => {
  it("returns 401 when there is no session", async () => {
    auth.auth.mockResolvedValue(null);
    const res = await POST(request({ orderId: "whatever" }));
    expect(res.status).toBe(401);
  });

  it("returns 400 when orderId is missing", async () => {
    const res = await POST(request({}));
    expect(res.status).toBe(400);
  });

  it("returns 404 for an unknown order", async () => {
    const res = await POST(request({ orderId: "does-not-exist" }));
    expect(res.status).toBe(404);
  });

  it("returns 403 when the order belongs to a different user", async () => {
    const otherUser = users.createUser({ firstName: "Other", lastName: "Owner", email: "other.owner@example.com" }).id;
    const purchase = purchases.createPurchase({ userId: otherUser, productId: "prod-x", amountCents: 1000, currency: "USD" });
    purchases.updatePurchaseOrderId(purchase.id, "ORDER-NOT-MINE");

    const res = await POST(request({ orderId: "ORDER-NOT-MINE" }));
    expect(res.status).toBe(403);
  });

  it("marks the purchase failed and returns 402 when PayPal capture doesn't complete", async () => {
    const purchase = purchases.createPurchase({ userId, productId: "prod-y", amountCents: 1000, currency: "USD" });
    purchases.updatePurchaseOrderId(purchase.id, "ORDER-DECLINED");
    paypal.captureOrder.mockResolvedValue({ status: "DECLINED" });

    const res = await POST(request({ orderId: "ORDER-DECLINED" }));
    expect(res.status).toBe(402);
    expect(purchases.getPurchaseById(purchase.id)!.status).toBe("failed");
  });

  it("captures a non-audit purchase without touching audit report generation", async () => {
    const purchase = purchases.createPurchase({ userId, productId: "prod-z", amountCents: 1000, currency: "USD" });
    purchases.updatePurchaseOrderId(purchase.id, "ORDER-SIMPLE");
    paypal.captureOrder.mockResolvedValue({ status: "COMPLETED", payer: { email_address: "payer@example.com" } });

    const res = await POST(request({ orderId: "ORDER-SIMPLE" }));
    expect(res.status).toBe(200);
    expect(purchases.getPurchaseById(purchase.id)!.status).toBe("captured");
    expect(generator.generateAuditReport).not.toHaveBeenCalled();
  });

  it("captures a business_audit purchase and kicks off audit report generation when a submission exists", async () => {
    submissions.createSubmission({ userId });
    const purchase = purchases.createPurchase({
      userId,
      productId: "business_audit",
      amountCents: 5000,
      currency: "USD",
      businessName: "Acme Co",
    });
    purchases.updatePurchaseOrderId(purchase.id, "ORDER-AUDIT");
    paypal.captureOrder.mockResolvedValue({ status: "COMPLETED", payer: { email_address: "payer@example.com" } });

    const res = await POST(request({ orderId: "ORDER-AUDIT" }));
    expect(res.status).toBe(200);
    expect(purchases.getPurchaseById(purchase.id)!.status).toBe("captured");

    expect(generator.generateAuditReport).toHaveBeenCalledWith(
      expect.objectContaining({ businessName: "Acme Co", ownerFirstName: "Capture" }),
    );

    const report = auditReports.getAuditReportByPurchase(purchase.id);
    expect(report).not.toBeNull();
  });

  it("does not start audit report generation when the user has no Opportunity Finder submission", async () => {
    const noSubmissionUser = users.createUser({
      firstName: "NoSub",
      lastName: "User",
      email: "no.sub@example.com",
    }).id;
    auth.auth.mockResolvedValue({ user: { id: noSubmissionUser } });

    const purchase = purchases.createPurchase({
      userId: noSubmissionUser,
      productId: "business_audit",
      amountCents: 5000,
      currency: "USD",
      businessName: "No Sub Co",
    });
    purchases.updatePurchaseOrderId(purchase.id, "ORDER-NO-SUB");
    paypal.captureOrder.mockResolvedValue({ status: "COMPLETED" });

    const res = await POST(request({ orderId: "ORDER-NO-SUB" }));
    expect(res.status).toBe(200);
    expect(generator.generateAuditReport).not.toHaveBeenCalled();
    expect(auditReports.getAuditReportByPurchase(purchase.id)).toBeNull();
  });
});
