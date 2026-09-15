import Image from "next/image";
import Link from "next/link";

import { urlForImage } from "@/sanity/lib/image";
import type { ProductCardResult } from "@/sanity/lib/types";

export type ProductCardData = ProductCardResult;

export function ProductCard({ product, index }: { product: ProductCardData; index?: number }) {
  return (
    <Link href={`/products/${product.slug}`} className="group block">
      <div className="relative aspect-[4/5] overflow-hidden rounded-sm bg-accent-soft ring-1 ring-border transition group-hover:ring-border-strong">
        {product.image && (
          <Image
            src={urlForImage(product.image).width(700).height(875).url()}
            alt={product.name}
            width={700}
            height={875}
            className="h-full w-full object-cover transition duration-500 ease-out group-hover:scale-[1.03]"
          />
        )}
        {typeof index === "number" && (
          <span className="label absolute left-3 top-3 rounded-full bg-paper/85 px-2 py-1 text-ink-soft backdrop-blur-sm">
            {String(index + 1).padStart(2, "0")}
          </span>
        )}
        <span className="label absolute bottom-3 right-3 translate-y-1 rounded-full bg-ink px-3 py-1.5 text-paper opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          View →
        </span>
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
