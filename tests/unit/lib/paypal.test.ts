import { beforeEach, afterEach, describe, it, expect, vi } from "vitest";
import type * as PaypalModule from "@/lib/paypal";

let paypal: typeof PaypalModule;
let fetchMock: ReturnType<typeof vi.fn>;

function jsonResponse(body: unknown, ok = true, status = 200) {
  return { ok, status, json: async () => body } as Response;
}

beforeEach(async () => {
  vi.resetModules();
  process.env.PAYPAL_CLIENT_ID = "client-id";
  process.env.PAYPAL_CLIENT_SECRET = "client-secret";
  process.env.PAYPAL_ENVIRONMENT = "sandbox";
  process.env.PAYPAL_WEBHOOK_ID = "webhook-id";

  fetchMock = vi.fn();
  vi.stubGlobal("fetch", fetchMock);

  paypal = await import("@/lib/paypal");
});

afterEach(() => {
  vi.unstubAllGlobals();
  delete process.env.PAYPAL_CLIENT_ID;
  delete process.env.PAYPAL_CLIENT_SECRET;
  delete process.env.PAYPAL_ENVIRONMENT;
  delete process.env.PAYPAL_WEBHOOK_ID;
});

describe("createOrder", () => {
  it("fetches an access token, hits the sandbox host, and returns the order", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ access_token: "tok" }))
      .mockResolvedValueOnce(jsonResponse({ id: "ORDER-1", status: "CREATED" }));

    const order = await paypal.createOrder({ amountCents: 5000, currency: "USD" });

    expect(order).toEqual({ id: "ORDER-1", status: "CREATED" });
    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      "https://api-m.sandbox.paypal.com/v1/oauth2/token",
      expect.objectContaining({ method: "POST" }),
    );
    const [orderUrl, orderInit] = fetchMock.mock.calls[1];
    expect(orderUrl).toBe("https://api-m.sandbox.paypal.com/v2/checkout/orders");
    expect(orderInit.headers.Authorization).toBe("Bearer tok");
    const body = JSON.parse(orderInit.body);
    expect(body.purchase_units[0].amount).toEqual({ currency_code: "USD", value: "50.00" });
  });

  it("hits the live host when PAYPAL_ENVIRONMENT=live", async () => {
    process.env.PAYPAL_ENVIRONMENT = "live";
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ access_token: "tok" }))
      .mockResolvedValueOnce(jsonResponse({ id: "ORDER-1", status: "CREATED" }));

    await paypal.createOrder({ amountCents: 100, currency: "USD" });

    expect(fetchMock.mock.calls[0][0]).toBe("https://api-m.paypal.com/v1/oauth2/token");
  });

  it("throws when the OAuth token request fails", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({}, false, 401));

    await expect(paypal.createOrder({ amountCents: 100, currency: "USD" })).rejects.toThrow(
      "PayPal OAuth token request failed: 401",
    );
  });

  it("throws when the create-order request fails", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ access_token: "tok" }))
      .mockResolvedValueOnce(jsonResponse({}, false, 500));

    await expect(paypal.createOrder({ amountCents: 100, currency: "USD" })).rejects.toThrow(
      "PayPal create order failed: 500",
    );
  });

  it("throws a clear error when credentials are missing", async () => {
    delete process.env.PAYPAL_CLIENT_ID;
    await expect(paypal.createOrder({ amountCents: 100, currency: "USD" })).rejects.toThrow(
      "PAYPAL_CLIENT_ID/PAYPAL_CLIENT_SECRET is not set",
    );
  });
});

describe("captureOrder", () => {
  it("returns the capture payload regardless of status (caller decides success)", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ access_token: "tok" }))
      .mockResolvedValueOnce(jsonResponse({ id: "cap-1", status: "COMPLETED" }));

    const capture = await paypal.captureOrder("ORDER-1");
    expect(capture.status).toBe("COMPLETED");
    expect(fetchMock.mock.calls[1][0]).toBe(
      "https://api-m.sandbox.paypal.com/v2/checkout/orders/ORDER-1/capture",
    );
  });
});

describe("verifyWebhookSignature", () => {
  const params = {
    authAlgo: "SHA256withRSA",
    certUrl: "https://api.paypal.com/cert",
    transmissionId: "tid",
    transmissionSig: "sig",
    transmissionTime: "2026-01-01T00:00:00Z",
    webhookEvent: { event_type: "PAYMENT.CAPTURE.COMPLETED" },
  };

  it("returns true when PayPal reports SUCCESS", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ access_token: "tok" }))
      .mockResolvedValueOnce(jsonResponse({ verification_status: "SUCCESS" }));

    expect(await paypal.verifyWebhookSignature(params)).toBe(true);
  });

  it("returns false when PayPal reports FAILURE", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ access_token: "tok" }))
      .mockResolvedValueOnce(jsonResponse({ verification_status: "FAILURE" }));

    expect(await paypal.verifyWebhookSignature(params)).toBe(false);
  });

  it("returns false (not a throw) when the verify request itself fails", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ access_token: "tok" }))
      .mockResolvedValueOnce(jsonResponse({}, false, 500));

    expect(await paypal.verifyWebhookSignature(params)).toBe(false);
  });

  it("throws when PAYPAL_WEBHOOK_ID is not configured", async () => {
    delete process.env.PAYPAL_WEBHOOK_ID;
    await expect(paypal.verifyWebhookSignature(params)).rejects.toThrow(
      "PAYPAL_WEBHOOK_ID is not set",
    );
  });
});
