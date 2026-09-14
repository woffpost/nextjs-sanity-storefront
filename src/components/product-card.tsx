import Image from "next/image";
import Link from "next/link";

import { urlForImage } from "@/sanity/lib/image";
import type { ProductCardResult } from "@/sanity/lib/types";

export type ProductCardData = ProductCardResult;

export function ProductCard({ product }: { product: ProductCardData }) {
  return (
    <Link href={`/products/${product.slug}`} className="group block">
      <div className="aspect-[4/5] overflow-hidden rounded-sm bg-accent-soft ring-1 ring-border transition group-hover:ring-border-strong">
        {product.image && (
          <Image
            src={urlForImage(product.image).width(700).height(875).url()}
            alt={product.name}
            width={700}
            height={875}
            className="h-full w-full object-cover transition duration-500 ease-out group-hover:scale-[1.03]"
          />
        )}
      </div>
      <div className="mt-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          {product.categoryTitle && (
            <p className="label text-ink-faint">{product.categoryTitle}</p>
          )}
          <p className="font-display mt-0.5 truncate text-lg">{product.name}</p>
        </div>
        <p className="label shrink-0 pt-0.5 text-ink-soft">${product.priceUsd.toFixed(2)}</p>
      </div>
    </Link>
  );
}
