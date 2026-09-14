# Storefront — Next.js + Sanity + Stripe

A small, open-source commerce demo built to be read, not just run. It exists to show
three specific things well rather than a feature-complete store:

1. A **Sanity schema** shaped around what the storefront actually queries, not a
   generic "CMS" model.
2. **GROQ** written for the response payload it produces, not for convenience.
3. **Live Preview** wired end-to-end — an editor can see an unpublished draft render
   on the real storefront before it goes live.

Stripe Checkout and a webhook that writes orders back into Sanity close the loop from
"catalog" to "sale."

## Stack

| Concern | Choice |
| --- | --- |
| Framework | Next.js 16, App Router, TypeScript |
| Content | Sanity (embedded Studio at `/studio`) |
| Payments | Stripe Checkout (hosted page, not custom Elements) |
| Styling | Tailwind CSS |
| Live Preview | `next-sanity`'s Live Content API + Presentation tool |

## Why these choices

- **Stripe Checkout over custom Elements** — a demo's job is to be readable in an
  afternoon. A hosted Checkout session is a fraction of the integration surface of
  a custom payment form and covers the same core flow (server creates a session,
  redirects, webhook confirms).
- **No cart/order accounts** — the cart is a client-side, `localStorage`-backed
  list of product IDs and quantities. There's no user auth. This keeps the two
  things worth demonstrating (Sanity querying, Stripe's server-side flow) unobscured
  by a third concern that doesn't need to be there for either story.
- **Price re-fetched server-side at checkout, always** — the client cart only ever
  sends `{ productId, quantity }`. The `/api/checkout` route re-reads `priceUsd` and
  `stock` from Sanity by ID before creating the Stripe session. A tampered client
  request can change *what* is in the cart, never *what it costs*.

## Getting started

Requires Node 20+, a free [Sanity account](https://www.sanity.io/manage), and a
[Stripe account](https://dashboard.stripe.com/register) in test mode.

```sh
npm install
npx sanity login          # opens a browser to authenticate the CLI
npx sanity init --env     # creates a project + dataset, writes NEXT_PUBLIC_SANITY_* to .env.local
cp .env.example .env.local   # if you didn't use --env above, fill this in by hand
```

Then, from [manage.sanity.io](https://www.sanity.io/manage) → your project → API →
Tokens, create:
- a **Viewer** token → `SANITY_API_READ_TOKEN`
- an **Editor** token → `SANITY_API_WRITE_TOKEN`

And from the [Stripe dashboard](https://dashboard.stripe.com/test/apikeys) (test
mode):
- the secret key → `STRIPE_SECRET_KEY`

```sh
npm run dev              # http://localhost:3000
npm run stripe:listen    # separate terminal — see below
```

`npm run stripe:listen` runs the [Stripe CLI](https://docs.stripe.com/stripe-cli) in
webhook-forwarding mode and prints a `whsec_...` value the first time you run it —
put that in `STRIPE_WEBHOOK_SECRET` and restart `next dev`. Without this, checkout
still works, but the webhook that writes `order` documents and decrements stock
never fires locally (Stripe can't reach `localhost` directly).

Add a product or two in the Studio (`/studio`) before visiting `/` — the homepage
renders "no products yet" with a link there if the dataset is empty. Or run
`npm run seed` to populate four sample products (with generated placeholder
images) instead of adding them by hand.

## Troubleshooting

**I changed content outside the Studio (a script, `npm run seed`, a direct API
call) and the site is still showing the old version.** `sanityFetch`'s cache
invalidation is push-based, not time-based: the Live Content API tells
already-connected pages to revalidate when content changes, but a write made
with no page's `<SanityLive />` connection open has no listener to notify, so
Next's fetch cache can keep serving the pre-write response indefinitely — a
plain restart isn't enough to fix this, since the persisted cache survives it.
Delete the whole build cache and restart: `rm -rf .next && npm run dev`.
Content edited through the Studio UI while a browser tab is open doesn't hit
this — that path already has a live connection to push the invalidation
through.

## The GROQ, and why it's written this way

`src/sanity/lib/queries.ts` has the full comments; the short version:

**Project, don't spread.** `productListQuery` asks for exactly the five fields a
product card renders — never `{ ... }`. On a catalog page, that's the difference
between a response in the tens of KB and one carrying every product's full
Portable Text description, every image's full asset metadata, and every other
field the card never touches.

**Dereference only what you need a field from.** `category->title` needs the
arrow — you're pulling a field off a referenced document. An `image` field
doesn't: `urlForImage()` builds the CDN URL algorithmically from the asset
`_ref` string, so `images[0]` (no `->`) is enough. Dereferencing an image anyway
is the single most common unnecessary join we've seen in Sanity queries in the
wild.

**One query beats a waterfall.** `productBySlugQuery` fetches the product, its
category's title, and three related-product cards in one round trip — using GROQ's
`^` parent-scope operator to reference the current document from inside its own
"related" projection. The alternative — fetch the product, then fetch related
products in a second request once you know the category — is the N+1 pattern
that's easy to reach for and easy to avoid here.

**The narrowest possible query for the highest-stakes read.** `productsForCheckoutQuery`
(used only by `/api/checkout`) returns `_id`, `priceUsd`, `stock` — nothing else.
It's the one query in the app where "just fetch the whole document, it's simpler"
would be actively worse: less to review for correctness in the one place a bug
means charging the wrong amount.

## Live Preview, end to end

"Live Preview" here means two connected pieces:

1. **The Live Content API** (`src/sanity/lib/live.ts`, `defineLive`). Every page
   fetches through `sanityFetch`, which opens a server-sent-events subscription. In
   draft mode, on the drafts perspective, a change saved in the Studio re-renders
   the page it appears on with no manual refresh — that's `<SanityLive />`, mounted
   once in the root layout.
2. **The Presentation tool** (`sanity.config.ts`). Opens the storefront in an
   iframe next to the document editor and wires click-to-navigate: the `resolve.locations`
   config tells the tool which frontend URL a `product` or `category` document maps
   to, so editing a product's Studio document also lets you jump straight to its
   page in the preview pane.

Draft mode itself is a standard Next.js mechanism — `src/app/api/draft-mode/enable`
and `/disable` are the handshake routes the Presentation tool calls when you open
or close a preview session. `VisualEditing` (mounted in the root layout, only while
draft mode is on) is what turns those draft-mode reads into the click-to-edit
overlays you see when hovering content in the preview iframe.

Try it: open `/studio/presentation`, pick a product, edit its name, and watch the
preview pane update as you type — before you've clicked "Publish."

## Stripe: checkout → webhook → order

```
Cart (client)            /api/checkout                 Stripe                /api/webhooks/stripe
──────────────           ──────────────                ──────                ─────────────────────
{productId, qty} ──POST──▶ re-fetch priceUsd/stock
                           from Sanity by _id
                           create Checkout Session ────▶ hosted checkout page
                                                          customer pays
                                                          checkout.session.completed ──▶ verify signature
                                                                                          idempotency check
                                                                                          write `order` doc
                                                                                          decrement stock
```

The webhook is idempotent by construction: it looks up an existing `order` with the
same `stripeCheckoutSessionId` before writing anything, because Stripe retries
webhook deliveries and this route has no other way to deduplicate a `checkout.session.completed`
it's already processed.

## Project structure

```
sanity.config.ts             Studio config: schema, structure, Presentation tool
sanity.cli.ts                 CLI config (project ID / dataset for `sanity` commands)
src/sanity/
  schemaTypes/                 product, category, order, settings
  structure.ts                  Studio nav — pins `settings` as a singleton
  lib/
    client.ts                    cached, CDN-served read client
    live.ts                      `sanityFetch` + `<SanityLive />` (Live Content API)
    queries.ts                   every GROQ query in the app, with the "why"
    image.ts                     image URL builder
    types.ts                     hand-written result types matching the queries
src/app/
  page.tsx                       catalog (homepage)
  products/[slug]/page.tsx       product detail + related products
  cart/page.tsx                  client-side cart
  checkout/success, /cancel      post-Stripe-redirect pages
  studio/[[...tool]]/            embedded Sanity Studio
  api/checkout/                  creates the Stripe Checkout Session
  api/webhooks/stripe/           order fulfillment
  api/draft-mode/                Presentation tool handshake
```

## Deliberately out of scope

This is a demo, not a store you should deploy as-is. Left out on purpose:

- **User accounts / order history.** No auth. The success page shows the one order
  just placed; nothing lists past orders back to a customer.
- **Inventory beyond a stock count.** No reservations, no handling for two
  customers checking out the last unit at once beyond the stock check at session
  creation (a real store needs a reservation/hold strategy here).
- **Sanity typegen.** Query result types in `src/sanity/lib/types.ts` are hand-written
  to match the GROQ, not generated. A real project should run
  `sanity schema extract && sanity typegen generate` and import the generated types
  instead — see [Sanity's TypeGen docs](https://www.sanity.io/docs/apis-and-sdks/sanity-typegen).
- **Refunds, subscriptions, tax, shipping.** Out of scope for what this repo is
  trying to show.

## License

MIT — see [LICENSE](./LICENSE).
