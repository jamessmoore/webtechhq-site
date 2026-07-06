import { beforeAll, afterAll, beforeEach, describe, it, expect, vi } from "vitest";
import { NextRequest } from "next/server";
import { useTestDatabase } from "../testDb";

vi.mock("@/auth", () => ({ auth: vi.fn() }));
vi.mock("@/lib/paypal", () => ({ createOrder: vi.fn() }));

let cleanup: () => void;
let POST: typeof import("../../../src/app/api/payments/paypal/create-order/route").POST;
let users: typeof import("@/lib/users");
let submissions: typeof import("@/lib/submissions");
let purchases: typeof import("@/lib/purchases");
let auth: { auth: ReturnType<typeof vi.fn> };
let paypal: { createOrder: ReturnType<typeof vi.fn> };

let userId: string;
let incompleteUserId: string;

beforeAll(async () => {
  ({ cleanup } = useTestDatabase());
  ({ POST } = await import("@/app/api/payments/paypal/create-order/route"));
  users = await import("@/lib/users");
  submissions = await import("@/lib/submissions");
  purchases = await import("@/lib/purchases");
  auth = (await import("@/auth")) as unknown as typeof auth;
  paypal = (await import("@/lib/paypal")) as unknown as typeof paypal;

  const buyer = users.createUser({ firstName: "Buyer", lastName: "Test", email: "buyer.create@example.com" });
  users.completeAccountSignup(buyer.id, "hashed-password");
  userId = buyer.id;

  incompleteUserId = users.createUser({ firstName: "Incomplete", email: "incomplete.buyer@example.com" }).id;
});

afterAll(() => cleanup());

beforeEach(() => {
  auth.auth.mockReset();
  paypal.createOrder.mockReset();
});

function request(body: unknown) {
  return new NextRequest("http://localhost:3000/api/payments/paypal/create-order", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/payments/paypal/create-order", () => {
  it("returns 401 when there is no session", async () => {
    auth.auth.mockResolvedValue(null);
    const res = await POST(request({ productId: "business_audit" }));
    expect(res.status).toBe(401);
  });

  it("returns 401 when the session user no longer exists in the db", async () => {
    auth.auth.mockResolvedValue({ user: { id: "ghost-user" } });
    const res = await POST(request({ productId: "business_audit" }));
    expect(res.status).toBe(401);
  });

  it("returns 400 for an unknown product", async () => {
    auth.auth.mockResolvedValue({ user: { id: userId } });
    const res = await POST(request({ productId: "not-a-real-product" }));
    expect(res.status).toBe(400);
  });

  it("returns 403 when the user has no Opportunity Finder submission on file", async () => {
    auth.auth.mockResolvedValue({ user: { id: userId } });
    const res = await POST(request({ productId: "business_audit", businessName: "Acme" }));
    expect(res.status).toBe(403);
  });

  it("returns 403 when the account hasn't been completed with a password", async () => {
    submissions.createSubmission({ userId: incompleteUserId });
    auth.auth.mockResolvedValue({ user: { id: incompleteUserId } });

    const res = await POST(request({ productId: "business_audit", businessName: "Acme" }));
    expect(res.status).toBe(403);
  });

  it("returns 400 when business_audit is purchased without a business name", async () => {
    submissions.createSubmission({ userId });
    auth.auth.mockResolvedValue({ user: { id: userId } });

    const res = await POST(request({ productId: "business_audit" }));
    expect(res.status).toBe(400);
  });

  it("creates a purchase, calls PayPal, and persists the returned order id", async () => {
    auth.auth.mockResolvedValue({ user: { id: userId } });
    paypal.createOrder.mockResolvedValue({ id: "PAYPAL-ORDER-XYZ", status: "CREATED" });

    const res = await POST(request({ productId: "business_audit", businessName: "Acme Co" }));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.orderId).toBe("PAYPAL-ORDER-XYZ");

    expect(paypal.createOrder).toHaveBeenCalledWith({ amountCents: 5000, currency: "USD" });
    const purchase = purchases.getPurchaseByOrderId("PAYPAL-ORDER-XYZ")!;
    expect(purchase.userId).toBe(userId);
    expect(purchase.status).toBe("created");
  });

  it("returns 409 when the user already owns this product", async () => {
    // hasPurchased only returns true once the purchase is captured, so capture
    // the order created in the previous test before re-attempting a purchase.
    purchases.markPurchaseCaptured("PAYPAL-ORDER-XYZ", { rawCaptureJson: "{}" });

    auth.auth.mockResolvedValue({ user: { id: userId } });
    const res = await POST(request({ productId: "business_audit", businessName: "Acme Co Again" }));
    expect(res.status).toBe(409);
  });
});
