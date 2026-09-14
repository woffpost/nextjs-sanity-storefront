import { NextResponse } from "next/server";
import Stripe from "stripe";

import { client } from "@/sanity/lib/client";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

// Needs write access — separate from the read-only token `sanityFetch` and
// the draft-mode routes use. Never reuse a write token for reads.
const writeClient = client.withConfig({ token: process.env.SANITY_API_WRITE_TOKEN });

type CartLine = { productId: string; quantity: number };

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature!, webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: `Webhook signature verification failed: ${message}` }, { status: 400 });
  }

  if (event.type !== "checkout.session.completed") {
    return NextResponse.json({ received: true });
  }

  const session = event.data.object as Stripe.Checkout.Session;
  const cart: CartLine[] = session.metadata?.cart ? JSON.parse(session.metadata.cart) : [];

  // Idempotency: Stripe retries webhook deliveries. If this session was
  // already recorded, don't create a duplicate order or double-decrement
  // stock.
  const existing = await writeClient.fetch(
    `*[_type == "order" && stripeCheckoutSessionId == $id][0]._id`,
    { id: session.id },
  );
  if (existing) {
    return NextResponse.json({ received: true, alreadyProcessed: true });
  }

  const transaction = writeClient.transaction();

  transaction.create({
    _type: "order",
    stripeCheckoutSessionId: session.id,
    stripePaymentIntentId:
      typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id,
    customerEmail: session.customer_details?.email,
    amountTotal: session.amount_total,
    currency: session.currency,
    status: "paid",
    createdAt: new Date().toISOString(),
    items: cart.map((line) => ({
      _type: "orderItem",
      _key: line.productId,
      product: { _type: "reference", _ref: line.productId },
      quantity: line.quantity,
    })),
  });

  for (const line of cart) {
    transaction.patch(line.productId, (patch) => patch.dec({ stock: line.quantity }));
  }

  await transaction.commit();

  return NextResponse.json({ received: true });
}
