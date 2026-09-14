import Link from "next/link";

import { ProductCard } from "@/components/product-card";
import { sanityFetch } from "@/sanity/lib/live";
import { productListQuery, settingsQuery } from "@/sanity/lib/queries";
import type { ProductCardResult, StoreSettingsResult } from "@/sanity/lib/types";

export default async function HomePage() {
  const [{ data: rawProducts }, { data: rawSettings }] = await Promise.all([
    sanityFetch({ query: productListQuery }),
    sanityFetch({ query: settingsQuery }),
  ]);
  const products = rawProducts as unknown as ProductCardResult[];
  const settings = rawSettings as unknown as StoreSettingsResult;

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <div className="mb-10">
        <h1 className="text-2xl font-semibold tracking-tight">
          {settings?.storeName ?? "Storefront"}
        </h1>
        {settings?.storeDescription && (
          <p className="mt-2 max-w-xl text-neutral-600">{settings.storeDescription}</p>
        )}
      </div>

      {products.length === 0 ? (
        <p className="text-neutral-500">
          No products yet — add one in{" "}
          <Link href="/studio" className="underline">
            the Studio
          </Link>
          .
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
