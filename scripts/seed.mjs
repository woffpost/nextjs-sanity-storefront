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

/** A flat-color placeholder square with a centered label — stands in for
 * real product photography so the catalog isn't empty out of the box. */
async function placeholderImage(label, hex) {
  const size = 1000;
  const svg = `
    <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#${hex}" />
      <text x="50%" y="50%" font-family="system-ui, sans-serif" font-size="48"
            fill="#ffffff" text-anchor="middle" dominant-baseline="middle">${label}</text>
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
