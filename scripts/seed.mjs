// Seeds a handful of demo products so the storefront isn't empty on first
// run. Idempotent (fixed document IDs, `createOrReplace`) — safe to re-run.
//
// Usage: node scripts/seed.mjs

import { createClient } from "next-sanity";
import sharp from "sharp";
import { config } from "dotenv";

config({ path: ".env.local" });

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const token = process.env.SANITY_API_WRITE_TOKEN;

if (!projectId || !dataset || !token) {
  console.error(
    "Missing NEXT_PUBLIC_SANITY_PROJECT_ID, NEXT_PUBLIC_SANITY_DATASET, or SANITY_API_WRITE_TOKEN in .env.local.",
  );
  process.exit(1);
}

const client = createClient({
  projectId,
  dataset,
  token,
  apiVersion: "2025-01-01",
  useCdn: false,
});

/** Lightens a hex color toward white by `amount` (0-1) — used for the
 * gradient's top stop so each swatch has a little depth. */
function lighten(hex, amount) {
  const n = parseInt(hex, 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  const mix = (c) => Math.round(c + (255 - c) * amount);
  return `#${[mix(r), mix(g), mix(b)].map((c) => c.toString(16).padStart(2, "0")).join("")}`;
}

/**
 * A quiet, considered placeholder — a duotone "swatch card" in the
 * product's accent color with the name set in a serif italic, standing in
 * for real photography so the catalog isn't empty on first run. 4:5 to
 * match the product card and detail-page aspect ratio.
 */
async function placeholderImage(label, hex) {
  const width = 900;
  const height = 1125;
  const gradientId = `g-${hex}`;
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="${gradientId}" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="${lighten(hex, 0.22)}" />
          <stop offset="100%" stop-color="#${hex}" />
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#${gradientId})" />
      <rect x="28" y="28" width="${width - 56}" height="${height - 56}" fill="none"
            stroke="#ffffff" stroke-opacity="0.35" stroke-width="1" />
      <text x="56" y="${height - 72}" font-family="Georgia, 'Times New Roman', serif"
            font-style="italic" font-size="46" fill="#fdfcfa">${label}</text>
      <text x="56" y="${height - 40}" font-family="Menlo, Consolas, monospace"
            font-size="13" letter-spacing="2" fill="#fdfcfa" fill-opacity="0.75">SAMPLE — PLACEHOLDER</text>
    </svg>
  `;
  return sharp(Buffer.from(svg)).png().toBuffer();
}

async function uploadImage(label, hex) {
  const buffer = await placeholderImage(label, hex);
  const asset = await client.assets.upload("image", buffer, {
    filename: `${label.toLowerCase().replace(/\s+/g, "-")}.png`,
  });
  return { _type: "image", asset: { _type: "reference", _ref: asset._id } };
}

const categories = [
  { _id: "category-everyday-carry", title: "Everyday carry", slug: "everyday-carry" },
  { _id: "category-desk", title: "Desk", slug: "desk" },
];

const products = [
  {
    _id: "product-field-notebook",
    name: "Field Notebook",
    slug: "field-notebook",
    category: "category-everyday-carry",
    priceUsd: 18,
    stock: 42,
    featured: true,
    color: "2f6f4f",
    excerpt: "A pocket notebook that survives actual pockets.",
  },
  {
    _id: "product-brass-pen",
    name: "Brass Pen",
    slug: "brass-pen",
    category: "category-everyday-carry",
    priceUsd: 34,
    stock: 17,
    featured: true,
    color: "8a6d3b",
    excerpt: "Machined brass, ages with a patina instead of scratches.",
  },
  {
    _id: "product-desk-lamp",
    name: "Desk Lamp",
    slug: "desk-lamp",
    category: "category-desk",
    priceUsd: 128,
    stock: 6,
    featured: true,
    color: "3c4a5c",
    excerpt: "Warm, dimmable, and quiet — no capacitive touch nonsense.",
  },
  {
    _id: "product-cable-tray",
    name: "Cable Tray",
    slug: "cable-tray",
    category: "category-desk",
    priceUsd: 42,
    stock: 0,
    featured: false,
    color: "6b5b73",
    excerpt: "Where cables go to stop being a problem.",
  },
];

async function main() {
  console.log("Seeding categories...");
  for (const category of categories) {
    await client.createOrReplace({
      _id: category._id,
      _type: "category",
      title: category.title,
      slug: { _type: "slug", current: category.slug },
    });
  }

  console.log("Seeding settings...");
  await client.createOrReplace({
    _id: "settings",
    _type: "settings",
    storeName: "Storefront",
    storeDescription: "A small, honest catalog — this is a demo, not a real shop.",
    supportEmail: "hello@example.com",
  });

  console.log("Seeding products (uploading placeholder images)...");
  for (const product of products) {
    const image = await uploadImage(product.name, product.color);
    await client.createOrReplace({
      _id: product._id,
      _type: "product",
      name: product.name,
      slug: { _type: "slug", current: product.slug },
      images: [image],
      excerpt: product.excerpt,
      category: { _type: "reference", _ref: product.category },
      priceUsd: product.priceUsd,
      stock: product.stock,
      featured: product.featured,
    });
    console.log(`  - ${product.name}`);
  }

  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
