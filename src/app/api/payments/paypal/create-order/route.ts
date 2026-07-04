import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getUserById } from "@/lib/users";
import { getSubmissionsByUser } from "@/lib/submissions";
import { getProduct } from "@/lib/products";
import { createPurchase, hasPurchased, updatePurchaseOrderId } from "@/lib/purchases";
import { createOrder } from "@/lib/paypal";

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const user = getUserById(session.user.id);
  if (!user) {
    return NextResponse.json({ error: "User not found." }, { status: 401 });
  }

  const body = (await request.json()) as { productId?: string };
  const product = body.productId ? getProduct(body.productId) : null;
  if (!product) {
    return NextResponse.json({ error: "Unknown product." }, { status: 400 });
  }

  if (getSubmissionsByUser(user.id).length === 0) {
    return NextResponse.json(
      { error: "Complete the Opportunity Finder before purchasing this tool." },
      { status: 403 },
    );
  }

  if (hasPurchased(user.id, product.id)) {
    return NextResponse.json({ error: "You already own this." }, { status: 409 });
  }

  const purchase = createPurchase({
    userId: user.id,
    productId: product.id,
    amountCents: product.priceCents,
    currency: product.currency,
  });

  const order = await createOrder({ amountCents: product.priceCents, currency: product.currency });
  updatePurchaseOrderId(purchase.id, order.id);

  return NextResponse.json({ success: true, orderId: order.id });
}
