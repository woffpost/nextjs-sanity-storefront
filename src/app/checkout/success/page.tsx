import Link from "next/link";
import Stripe from "stripe";

import { ClearCartOnMount } from "@/components/clear-cart-on-mount";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export default async function CheckoutSuccessPage(props: PageProps<"/checkout/success">) {
  const { session_id: sessionId } = await props.searchParams;
  const session =
    typeof sessionId === "string" ? await stripe.checkout.sessions.retrieve(sessionId) : null;

  return (
    <div className="mx-auto max-w-lg px-6 py-28 text-center">
      <ClearCartOnMount />
      <p className="label text-accent">Order confirmed</p>
      <h1 className="font-display mt-4 text-4xl">Thank you.</h1>
      <p className="mt-4 text-lg text-ink-soft">
        {session?.customer_details?.email
          ? `A confirmation was sent to ${session.customer_details.email}.`
          : "Your order was placed."}
      </p>
      {session?.amount_total != null && (
        <p className="label mt-2 text-ink-soft">
          Total charged ${(session.amount_total / 100).toFixed(2)}
        </p>
      )}
      <p className="mx-auto mt-8 max-w-sm text-sm text-ink-faint">
        This order was written to Sanity as an <code>order</code> document by the Stripe webhook —
        check the Studio&apos;s Orders list.
      </p>
      <Link
        href="/"
        className="label mt-10 inline-block text-ink underline decoration-border-strong underline-offset-4"
      >
        Continue shopping
      </Link>
    </div>
  );
}
