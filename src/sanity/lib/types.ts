import type { Image, PortableTextBlock } from "sanity";

/**
 * Hand-written result types matching the GROQ projections in `queries.ts`.
 * (A real long-lived project would run `sanity typegen generate` against
 * the schema and import generated types instead — see the README's "Next
 * steps" section. Kept manual here so the demo has zero required Sanity
 * connection just to type-check.)
 */
export type ProductCardResult = {
  _id: string;
  name: string;
  slug: string;
  priceUsd: number;
  image: Image | null;
  categoryTitle: string | null;
};

export type StoreSettingsResult = {
  storeName: string;
  storeDescription: string | null;
  supportEmail: string | null;
} | null;

export type ProductDetailResult = {
  _id: string;
  name: string;
  slug: string;
  priceUsd: number;
  stock: number;
  excerpt: string | null;
  description: PortableTextBlock[] | null;
  images: Image[];
  category: { title: string; slug: string } | null;
  related: ProductCardResult[];
};
