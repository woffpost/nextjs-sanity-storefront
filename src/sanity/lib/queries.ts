import { defineQuery } from "next-sanity";

/**
 * GROQ notes (the short version — the case study has the long one):
 *
 * 1. Project, don't spread. `{ name, slug, priceUsd }` instead of `{ ... }`
 *    keeps the response to what the card actually renders — on a 60-product
 *    grid, skipping unused portable-text/description fields is the
 *    difference between a payload in the tens of KB and one in the
 *    hundreds.
 * 2. Dereference (`->`) only for references you need a *field* from — a
 *    category title, say. An `image` field is NOT a reference you need to
 *    dereference to render: `urlForImage()` builds the CDN URL from the
 *    asset `_ref` string alone, so `images[0]` (no `->`) avoids an
 *    unnecessary join entirely. Dereferencing an image here is the most
 *    common unnecessary-join mistake in Sanity queries.
 * 3. One query beats a waterfall. `productBySlugQuery` below pulls the
 *    product's own fields, its category's title, and the three fields
 *    Vision/every card needs from related products (for "you might also
 *    like") in a single round trip — not a product fetch followed by a
 *    client-side related-products fetch.
 */

export const PRODUCT_CARD_PROJECTION = /* groq */ `{
  _id,
  name,
  "slug": slug.current,
  priceUsd,
  "image": images[0],
  "categoryTitle": category->title
}`;

export const productListQuery = defineQuery(
  `*[_type == "product"] | order(name asc) ${PRODUCT_CARD_PROJECTION}`,
);

export const featuredProductsQuery = defineQuery(
  `*[_type == "product" && featured == true] | order(name asc) [0...4] ${PRODUCT_CARD_PROJECTION}`,
);

export const productsByCategoryQuery = defineQuery(
  `*[_type == "product" && category->slug.current == $categorySlug] | order(name asc) ${PRODUCT_CARD_PROJECTION}`,
);

export const productBySlugQuery = defineQuery(`
  *[_type == "product" && slug.current == $slug][0]{
    _id,
    name,
    "slug": slug.current,
    priceUsd,
    stock,
    excerpt,
    description,
    images,
    "category": category->{ title, "slug": slug.current },
    "related": *[
      _type == "product" &&
      category._ref == ^.category._ref &&
      slug.current != ^.slug.current
    ] | order(name asc) [0...3] ${PRODUCT_CARD_PROJECTION}
  }
`);

export const categoriesQuery = defineQuery(
  `*[_type == "category"] | order(title asc) { title, "slug": slug.current }`,
);

export const settingsQuery = defineQuery(
  `*[_type == "settings"][0]{ storeName, storeDescription, supportEmail }`,
);

/**
 * Used only by the Stripe checkout route (`/api/checkout`). Deliberately the
 * narrowest possible projection: the price and stock, nothing the storefront
 * pages need. The client's cart sends product IDs and quantities; this
 * query is what re-derives the actual price server-side so a tampered
 * client payload can never change what Stripe charges.
 */
export const productsForCheckoutQuery = defineQuery(
  `*[_type == "product" && _id in $ids]{ _id, name, priceUsd, stock }`,
);
