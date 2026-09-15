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
    <div>
      <section className="border-b border-border">
        <div className="mx-auto max-w-6xl px-6 py-20 sm:py-28">
          <p className="label text-accent">{products.length} pieces, all in stock</p>
          <h1 className="font-display mt-4 max-w-2xl text-balance text-5xl leading-[1.05] sm:text-6xl">
            {settings?.storeName ?? "Storefront"}
          </h1>
          {settings?.storeDescription && (
            <p className="mt-5 max-w-md text-lg leading-relaxed text-ink-soft">
              {settings.storeDescription}
            </p>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
        {products.length === 0 ? (
          <p className="text-ink-soft">
            No products yet — add one in{" "}
            <Link href="/studio" className="text-ink underline underline-offset-4">
              the Studio
            </Link>
            .
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-x-6 gap-y-14 sm:grid-cols-3">
            {products.map((product, i) => (
              <div
                key={product._id}
                className="fade-up"
                style={{ animationDelay: `${Math.min(i, 6) * 60}ms` }}
              >
                <ProductCard product={product} index={i} />
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
