"use client";

import Link from "next/link";

import { useCart } from "@/lib/cart-context";

export function SiteHeader() {
  const { count } = useCart();

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-paper/90 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <Link href="/" className="font-display text-xl tracking-tight">
          Storefront
        </Link>
        <nav className="flex items-center gap-8">
          <Link
            href="/cart"
            className="label flex items-center gap-2 text-ink-soft transition hover:text-ink"
          >
            Cart
            {count > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1.5 text-[10px] font-medium text-paper-raised">
                {count}
              </span>
            )}
          </Link>
        </nav>
      </div>
    </header>
  );
}
