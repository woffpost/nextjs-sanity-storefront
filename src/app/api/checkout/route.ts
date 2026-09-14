import { NextResponse } from "next/server";
import Stripe from "stripe";

import { client } from "@/sanity/lib/client";
import { productsForCheckoutQuery } from "@/sanity/lib/queries";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

type CheckoutLine = { productId: string; quantity: number };

export async function POST(request: Request) {
  const body = (await request.json()) as { lines?: CheckoutLine[] };
  const lines = body.lines?.filter((line) => line.quantity > 0) ?? [];

  if (lines.length === 0) {
    return NextResponse.json({ error: "Cart is empty." }, { status: 400 });
  }

  // The client sent product IDs and quantities only. Prices and stock come
  // from a fresh Sanity read here — never from the request body — so a
  // tampered cart can never change what a customer is charged.
  const ids = lines.map((line) => line.productId);
  const products = await client.fetch(productsForCheckoutQuery, { ids });

  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];
  for (const line of lines) {
    const product = products.find((p: { _id: string }) => p._id === line.productId);
    if (!product) {
      return NextResponse.json(
        { error: `Product ${line.productId} no longer exists.` },
        { status: 400 },
      );
    }
    if (product.stock < line.quantity) {
      return NextResponse.json(
        { error: `Not enough stock for "${product.name}".` },
        { status: 409 },
      );
    }
    lineItems.push({
      quantity: line.quantity,
      price_data: {
        currency: "usd",
        unit_amount: Math.round(product.priceUsd * 100),
        product_data: { name: product.name, metadata: { sanityProductId: product._id } },
      },
    });
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: lineItems,
    success_url: `${siteUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${siteUrl}/checkout/cancel`,
    metadata: {
      cart: JSON.stringify(lines),
    },
  });

  return NextResponse.json({ url: session.url });
}
