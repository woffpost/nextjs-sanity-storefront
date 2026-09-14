import { PortableText } from "@portabletext/react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { AddToCartButton } from "@/components/add-to-cart-button";
import { ProductCard } from "@/components/product-card";
import { sanityFetch } from "@/sanity/lib/live";
import { urlForImage } from "@/sanity/lib/image";
import { productBySlugQuery } from "@/sanity/lib/queries";
import type { ProductDetailResult } from "@/sanity/lib/types";

export default async function ProductPage(props: PageProps<"/products/[slug]">) {
  const { slug } = await props.params;
  const { data: rawProduct } = await sanityFetch({ query: productBySlugQuery, params: { slug } });
  const product = rawProduct as unknown as ProductDetailResult | null;

  if (!product) notFound();

  return (
    <div className="mx-auto max-w-6xl px-6 py-12 sm:py-16">
      <Link href="/" className="label text-ink-faint transition hover:text-ink">
        ← All products
      </Link>

      <div className="mt-8 grid gap-12 sm:grid-cols-2 sm:gap-16">
        <div className="grid gap-3">
          {product.images?.map((image, i) => (
            <div
              key={i}
              className="aspect-[4/5] overflow-hidden rounded-sm bg-accent-soft ring-1 ring-border"
            >
              <Image
                src={urlForImage(image).width(900).height(1125).url()}
                alt={product.name}
                width={900}
                height={1125}
                className="h-full w-full object-cover"
                priority={i === 0}
              />
            </div>
          ))}
        </div>

        <div className="sm:sticky sm:top-24 sm:self-start">
          {product.category && <p className="label text-accent">{product.category.title}</p>}
          <h1 className="font-display mt-2 text-4xl leading-tight text-balance">
            {product.name}
          </h1>
          <p className="label mt-4 text-ink-soft">${product.priceUsd.toFixed(2)}</p>
          {product.excerpt && (
            <p className="mt-5 max-w-sm text-lg leading-relaxed text-ink-soft">
              {product.excerpt}
            </p>
          )}

          <div className="mt-8 max-w-xs">
            <AddToCartButton
              productId={product._id}
              name={product.name}
              priceUsd={product.priceUsd}
              slug={product.slug}
              disabled={product.stock <= 0}
            />
          </div>

          {product.description && (
            <div className="prose prose-neutral prose-sm mt-10 max-w-sm text-ink-soft">
              <PortableText value={product.description} />
            </div>
          )}
        </div>
      </div>

      {product.related?.length > 0 && (
        <div className="mt-24 border-t border-border pt-12">
          <p className="label text-ink-faint">You might also like</p>
          <div className="mt-8 grid grid-cols-2 gap-x-6 gap-y-14 sm:grid-cols-3">
            {product.related.map((related) => (
              <ProductCard key={related._id} product={related} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
