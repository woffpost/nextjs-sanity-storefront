import { PortableText } from "@portabletext/react";
import Image from "next/image";
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
    <div className="mx-auto max-w-5xl px-6 py-12">
      <div className="grid gap-10 sm:grid-cols-2">
        <div className="grid gap-3">
          {product.images?.map((image, i) => (
            <div key={i} className="aspect-square overflow-hidden rounded-lg bg-neutral-100">
              <Image
                src={urlForImage(image).width(800).height(800).url()}
                alt={product.name}
                width={800}
                height={800}
                className="h-full w-full object-cover"
                priority={i === 0}
              />
            </div>
          ))}
        </div>

        <div>
          {product.category && (
            <p className="text-xs uppercase tracking-wide text-neutral-500">
              {product.category.title}
            </p>
          )}
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">{product.name}</h1>
          <p className="mt-2 text-xl">${product.priceUsd.toFixed(2)}</p>
          {product.excerpt && <p className="mt-4 text-neutral-600">{product.excerpt}</p>}

          <div className="mt-6">
            <AddToCartButton
              productId={product._id}
              name={product.name}
              priceUsd={product.priceUsd}
              slug={product.slug}
              disabled={product.stock <= 0}
            />
          </div>

          {product.description && (
            <div className="prose prose-neutral prose-sm mt-8 max-w-none">
              <PortableText value={product.description} />
            </div>
          )}
        </div>
      </div>

      {product.related?.length > 0 && (
        <div className="mt-16">
          <h2 className="mb-6 text-sm font-medium uppercase tracking-wide text-neutral-500">
            You might also like
          </h2>
          <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3">
            {product.related.map((related) => (
              <ProductCard key={related._id} product={related} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
