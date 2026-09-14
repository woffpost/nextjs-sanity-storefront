import { TrolleyIcon } from "@sanity/icons/Trolley";
import { defineField, defineType } from "sanity";

/**
 * Orders are never created in the Studio by hand — they're written by the
 * Stripe webhook handler (`src/app/api/webhooks/stripe/route.ts`) once a
 * checkout session completes. Sanity is the system of record for the
 * catalog; this document is what closes the loop back from Stripe.
 */
export const orderType = defineType({
  name: "order",
  title: "Order",
  type: "document",
  icon: TrolleyIcon,
  readOnly: true,
  fields: [
    defineField({ name: "stripeCheckoutSessionId", type: "string" }),
    defineField({ name: "stripePaymentIntentId", type: "string" }),
    defineField({ name: "customerEmail", type: "string" }),
    defineField({ name: "amountTotal", type: "number" }),
    defineField({ name: "currency", type: "string" }),
    defineField({
      name: "status",
      type: "string",
      options: { list: ["paid", "unpaid", "refunded"] },
      initialValue: "paid",
    }),
    defineField({
      name: "items",
      type: "array",
      of: [
        {
          type: "object",
          name: "orderItem",
          fields: [
            defineField({ name: "product", type: "reference", to: [{ type: "product" }] }),
            defineField({ name: "quantity", type: "number" }),
            defineField({
              name: "priceUsdAtPurchase",
              title: "Price at purchase (USD)",
              type: "number",
            }),
          ],
        },
      ],
    }),
    defineField({ name: "createdAt", type: "datetime" }),
  ],
  preview: {
    select: { title: "customerEmail", subtitle: "amountTotal", status: "status" },
    prepare({ title, subtitle, status }) {
      return {
        title: title || "Unknown customer",
        subtitle: `$${((subtitle ?? 0) / 100).toFixed(2)} · ${status}`,
      };
    },
  },
});
