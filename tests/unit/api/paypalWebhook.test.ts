import { beforeAll, afterAll, beforeEach, describe, it, expect, vi } from "vitest";
import { NextRequest } from "next/server";
import { useTestDatabase } from "../testDb";

vi.mock("@/lib/paypal", () => ({ verifyWebhookSignature: vi.fn() }));

let cleanup: () => void;
let POST: typeof import("../../../src/app/api/webhooks/paypal/route").POST;
let users: typeof import("@/lib/users");
let purchases: typeof import("@/lib/purchases");
let paypal: { verifyWebhookSignature: ReturnType<typeof vi.fn> };

let userId: string;

beforeAll(async () => {
  ({ cleanup } = useTestDatabase());
  ({ POST } = await import("@/app/api/webhooks/paypal/route"));
  users = await import("@/lib/users");
  purchases = await import("@/lib/purchases");
  paypal = (await import("@/lib/paypal")) as unknown as typeof paypal;

  userId = users.createUser({ firstName: "Webhook", lastName: "Test", email: "webhook.test@example.com" }).id;
});

afterAll(() => cleanup());

beforeEach(() => {
  paypal.verifyWebhookSignature.mockReset();
});

const validHeaders = {
  "paypal-auth-algo": "SHA256withRSA",
  "paypal-cert-url": "https://api.paypal.com/cert",
  "paypal-transmission-id": "tid",
  "paypal-transmission-sig": "sig",
  "paypal-transmission-time": "2026-01-01T00:00:00Z",
};

function request(event: unknown, headers: Record<string, string> = validHeaders) {
  return new NextRequest("http://localhost:3000/api/webhooks/paypal", {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify(event),
  });
}

describe("POST /api/webhooks/paypal", () => {
  it("returns 401 when PayPal signature headers are missing", async () => {
    const { "paypal-auth-algo": _omit, ...rest } = validHeaders;
    const res = await POST(request({ event_type: "PAYMENT.CAPTURE.COMPLETED", resource: {} }, rest));
    expect(res.status).toBe(401);
    expect(paypal.verifyWebhookSignature).not.toHaveBeenCalled();
  });

  it("returns 401 when signature verification fails", async () => {
    paypal.verifyWebhookSignature.mockResolvedValue(false);
    const res = await POST(request({ event_type: "PAYMENT.CAPTURE.COMPLETED", resource: {} }));
    expect(res.status).toBe(401);
  });

  it("marks the purchase captured on a verified PAYMENT.CAPTURE.COMPLETED event", async () => {
    paypal.verifyWebhookSignature.mockResolvedValue(true);
    const purchase = purchases.createPurchase({ userId, productId: "prod-wh1", amountCents: 1000, currency: "USD" });
    purchases.updatePurchaseOrderId(purchase.id, "ORDER-WH-1");

    const res = await POST(
      request({
        event_type: "PAYMENT.CAPTURE.COMPLETED",
        resource: {
          id: "cap-1",
          status: "COMPLETED",
          supplementary_data: { related_ids: { order_id: "ORDER-WH-1" } },
          payer: { email_address: "payer@example.com" },
        },
      }),
    );

    expect(res.status).toBe(200);
    const updated = purchases.getPurchaseById(purchase.id)!;
    expect(updated.status).toBe("captured");
    expect(updated.payerEmail).toBe("payer@example.com");
  });

  it("marks the purchase failed on PAYMENT.CAPTURE.DENIED", async () => {
    paypal.verifyWebhookSignature.mockResolvedValue(true);
    const purchase = purchases.createPurchase({ userId, productId: "prod-wh2", amountCents: 1000, currency: "USD" });
    purchases.updatePurchaseOrderId(purchase.id, "ORDER-WH-2");

    const res = await POST(
      request({
        event_type: "PAYMENT.CAPTURE.DENIED",
        resource: { id: "cap-2", status: "DENIED", supplementary_data: { related_ids: { order_id: "ORDER-WH-2" } } },
      }),
    );

    expect(res.status).toBe(200);
    expect(purchases.getPurchaseById(purchase.id)!.status).toBe("failed");
  });

  it("acks (200) an unrecognized event type without mutating any purchase", async () => {
    paypal.verifyWebhookSignature.mockResolvedValue(true);
    const purchase = purchases.createPurchase({ userId, productId: "prod-wh3", amountCents: 1000, currency: "USD" });
    purchases.updatePurchaseOrderId(purchase.id, "ORDER-WH-3");

    const res = await POST(
      request({
        event_type: "CUSTOMER.DISPUTE.CREATED",
        resource: { id: "cap-3", status: "N/A", supplementary_data: { related_ids: { order_id: "ORDER-WH-3" } } },
      }),
    );

    expect(res.status).toBe(200);
    expect(purchases.getPurchaseById(purchase.id)!.status).toBe("created");
  });
});
