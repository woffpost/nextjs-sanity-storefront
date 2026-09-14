import Image from "next/image";
import Link from "next/link";

import { urlForImage } from "@/sanity/lib/image";
import type { ProductCardResult } from "@/sanity/lib/types";

export type ProductCardData = ProductCardResult;

export function ProductCard({ product }: { product: ProductCardData }) {
  return (
    <Link href={`/products/${product.slug}`} className="group block">
      <div className="aspect-square overflow-hidden rounded-lg bg-neutral-100">
        {product.image && (
          <Image
            src={urlForImage(product.image).width(600).height(600).url()}
            alt={product.name}
            width={600}
            height={600}
            className="h-full w-full object-cover transition group-hover:scale-105"
          />
        )}
      </div>
      <div className="mt-3 flex items-baseline justify-between gap-2">
        <div>
          <p className="text-sm font-medium">{product.name}</p>
          {product.categoryTitle && (
            <p className="text-xs text-neutral-500">{product.categoryTitle}</p>
          )}
        </div>
        <p className="text-sm font-medium">${product.priceUsd.toFixed(2)}</p>
      </div>
    </Link>
  );
}
