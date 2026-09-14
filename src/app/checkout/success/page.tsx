import Link from "next/link";
import Stripe from "stripe";

import { ClearCartOnMount } from "@/components/clear-cart-on-mount";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export default async function CheckoutSuccessPage(props: PageProps<"/checkout/success">) {
  const { session_id: sessionId } = await props.searchParams;
  const session =
    typeof sessionId === "string" ? await stripe.checkout.sessions.retrieve(sessionId) : null;

  return (
    <div className="mx-auto max-w-lg px-6 py-20 text-center">
      <ClearCartOnMount />
      <h1 className="text-2xl font-semibold tracking-tight">Thank you!</h1>
      <p className="mt-3 text-neutral-600">
        {session?.customer_details?.email
          ? `A confirmation was sent to ${session.customer_details.email}.`
          : "Your order was placed."}
      </p>
      {session?.amount_total != null && (
        <p className="mt-1 text-neutral-600">
          Total charged: ${(session.amount_total / 100).toFixed(2)}
        </p>
      )}
      <p className="mt-6 text-sm text-neutral-500">
        This order was written to Sanity as an <code>order</code> document by the Stripe webhook —
        check the Studio&apos;s Orders list.
      </p>
      <Link href="/" className="mt-8 inline-block underline underline-offset-4">
        Continue shopping
      </Link>
    </div>
  );
}
