import { NextRequest, NextResponse } from "next/server";
import { markPurchaseCaptured, markPurchaseFailed } from "@/lib/purchases";
import { verifyWebhookSignature } from "@/lib/paypal";

interface PayPalCaptureResource {
  id: string;
  status: string;
  supplementary_data?: { related_ids?: { order_id?: string } };
  payer?: { email_address?: string };
}

interface PayPalWebhookEvent {
  event_type: string;
  resource: PayPalCaptureResource;
}

export async function POST(request: NextRequest) {
  const authAlgo = request.headers.get("paypal-auth-algo");
  const certUrl = request.headers.get("paypal-cert-url");
  const transmissionId = request.headers.get("paypal-transmission-id");
  const transmissionSig = request.headers.get("paypal-transmission-sig");
  const transmissionTime = request.headers.get("paypal-transmission-time");

  if (!authAlgo || !certUrl || !transmissionId || !transmissionSig || !transmissionTime) {
    return NextResponse.json({ error: "Missing PayPal signature headers." }, { status: 401 });
  }

  const event = (await request.json()) as PayPalWebhookEvent;

  const verified = await verifyWebhookSignature({
    authAlgo,
    certUrl,
    transmissionId,
    transmissionSig,
    transmissionTime,
    webhookEvent: event,
  });

  if (!verified) {
    return NextResponse.json({ error: "Signature verification failed." }, { status: 401 });
  }

  const orderId = event.resource.supplementary_data?.related_ids?.order_id;

  if (event.event_type === "PAYMENT.CAPTURE.COMPLETED" && orderId) {
    markPurchaseCaptured(orderId, {
      payerEmail: event.resource.payer?.email_address,
      rawCaptureJson: JSON.stringify(event.resource),
    });
  } else if (
    (event.event_type === "PAYMENT.CAPTURE.DENIED" || event.event_type === "PAYMENT.CAPTURE.DECLINED") &&
    orderId
  ) {
    markPurchaseFailed(orderId);
  }

  // Ack every event, including ones we don't act on — PayPal retries on non-2xx.
  return NextResponse.json({ success: true });
}
