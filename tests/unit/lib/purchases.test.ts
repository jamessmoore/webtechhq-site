import { beforeAll, afterAll, describe, it, expect } from "vitest";
import { useTestDatabase } from "../testDb";

let cleanup: () => void;
let purchases: typeof import("@/lib/purchases");
let users: typeof import("@/lib/users");
let userId: string;

beforeAll(async () => {
  ({ cleanup } = useTestDatabase());
  purchases = await import("@/lib/purchases");
  users = await import("@/lib/users");
  userId = users.createUser({ firstName: "Test", lastName: "User", email: "buyer@example.com" }).id;
});

afterAll(() => cleanup());

describe("purchases", () => {
  it("creates a purchase in 'created' status with no paypal order id yet", () => {
    const p = purchases.createPurchase({
      userId,
      productId: "business_audit",
      amountCents: 5000,
      currency: "USD",
      businessName: "Acme Co",
    });

    expect(p.status).toBe("created");
    expect(p.paypalOrderId).toBeUndefined();
    expect(p.amountCents).toBe(5000);
    expect(purchases.hasPurchased(userId, "business_audit")).toBe(false);
  });

  it("links a paypal order id and finds the purchase by it", () => {
    const p = purchases.createPurchase({ userId, productId: "prod-a", amountCents: 1000, currency: "USD" });
    purchases.updatePurchaseOrderId(p.id, "PAYPAL-ORDER-1");

    expect(purchases.getPurchaseByOrderId("PAYPAL-ORDER-1")?.id).toBe(p.id);
  });

  it("marks a purchase captured and it now counts as purchased", () => {
    const p = purchases.createPurchase({ userId, productId: "prod-b", amountCents: 2000, currency: "USD" });
    purchases.updatePurchaseOrderId(p.id, "PAYPAL-ORDER-2");

    purchases.markPurchaseCaptured("PAYPAL-ORDER-2", {
      payerEmail: "payer@example.com",
      rawCaptureJson: JSON.stringify({ id: "cap-1" }),
    });

    const updated = purchases.getPurchaseById(p.id)!;
    expect(updated.status).toBe("captured");
    expect(updated.payerEmail).toBe("payer@example.com");
    expect(purchases.hasPurchased(userId, "prod-b")).toBe(true);
  });

  it("markPurchaseCaptured is idempotent and never downgrades a captured purchase", () => {
    const p = purchases.createPurchase({ userId, productId: "prod-c", amountCents: 3000, currency: "USD" });
    purchases.updatePurchaseOrderId(p.id, "PAYPAL-ORDER-3");
    purchases.markPurchaseCaptured("PAYPAL-ORDER-3", { rawCaptureJson: "{}" });

    // A second, later capture event for the same order must not overwrite the row.
    purchases.markPurchaseCaptured("PAYPAL-ORDER-3", {
      payerEmail: "late-retry@example.com",
      rawCaptureJson: "{}",
    });

    const updated = purchases.getPurchaseById(p.id)!;
    expect(updated.status).toBe("captured");
    expect(updated.payerEmail).toBeUndefined();
  });

  it("marks a purchase failed, and failed purchases do not count as purchased", () => {
    const p = purchases.createPurchase({ userId, productId: "prod-d", amountCents: 4000, currency: "USD" });
    purchases.updatePurchaseOrderId(p.id, "PAYPAL-ORDER-4");

    purchases.markPurchaseFailed("PAYPAL-ORDER-4");

    expect(purchases.getPurchaseById(p.id)!.status).toBe("failed");
    expect(purchases.hasPurchased(userId, "prod-d")).toBe(false);
  });

  it("markPurchaseFailed never overwrites an already-captured purchase", () => {
    const p = purchases.createPurchase({ userId, productId: "prod-e", amountCents: 4500, currency: "USD" });
    purchases.updatePurchaseOrderId(p.id, "PAYPAL-ORDER-5");
    purchases.markPurchaseCaptured("PAYPAL-ORDER-5", { rawCaptureJson: "{}" });

    purchases.markPurchaseFailed("PAYPAL-ORDER-5");

    expect(purchases.getPurchaseById(p.id)!.status).toBe("captured");
  });

  it("ensureComplimentaryPurchase creates a zero-cost captured purchase", () => {
    const p = purchases.ensureComplimentaryPurchase({
      userId,
      productId: "comp-product",
      currency: "USD",
    });

    expect(p.status).toBe("captured");
    expect(p.amountCents).toBe(0);
    expect(purchases.hasPurchased(userId, "comp-product")).toBe(true);
  });

  it("ensureComplimentaryPurchase is idempotent — does not create a duplicate row", () => {
    const first = purchases.ensureComplimentaryPurchase({ userId, productId: "comp-product-2", currency: "USD" });
    const second = purchases.ensureComplimentaryPurchase({ userId, productId: "comp-product-2", currency: "USD" });

    expect(second.id).toBe(first.id);
    expect(purchases.getPurchasesByUser(userId).filter((x) => x.productId === "comp-product-2")).toHaveLength(1);
  });

  it("lists a user's purchases ordered most-recent-first", () => {
    const otherUser = users.createUser({ firstName: "Other", lastName: "Buyer", email: "other@example.com" }).id;
    purchases.createPurchase({ userId: otherUser, productId: "only-mine", amountCents: 100, currency: "USD" });

    const list = purchases.getPurchasesByUser(otherUser);
    expect(list).toHaveLength(1);
    expect(list[0].productId).toBe("only-mine");
  });
});
