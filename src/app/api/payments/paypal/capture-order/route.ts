import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getUserById } from "@/lib/users";
import { getPurchaseByOrderId, markPurchaseCaptured, markPurchaseFailed } from "@/lib/purchases";
import { captureOrder } from "@/lib/paypal";

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const user = getUserById(session.user.id);
  if (!user) {
    return NextResponse.json({ error: "User not found." }, { status: 401 });
  }

  const body = (await request.json()) as { orderId?: string };
  if (!body.orderId) {
    return NextResponse.json({ error: "Missing orderId." }, { status: 400 });
  }

  const purchase = getPurchaseByOrderId(body.orderId);
  if (!purchase) {
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }
  if (purchase.userId !== user.id) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const capture = await captureOrder(body.orderId);

  if (capture.status !== "COMPLETED") {
    markPurchaseFailed(body.orderId);
    return NextResponse.json({ error: "Payment was not completed." }, { status: 402 });
  }

  markPurchaseCaptured(body.orderId, {
    payerEmail: capture.payer?.email_address,
    rawCaptureJson: JSON.stringify(capture),
  });

  return NextResponse.json({ success: true, amountCents: purchase.amountCents });
}
