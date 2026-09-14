"use client";

import Link from "next/link";

import { useCart } from "@/lib/cart-context";

export function SiteHeader() {
  const { count } = useCart();

  return (
    <header className="border-b border-neutral-200">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <Link href="/" className="font-semibold tracking-tight">
          Storefront
        </Link>
        <Link href="/cart" className="text-sm underline underline-offset-4">
          Cart{count > 0 ? ` (${count})` : ""}
        </Link>
      </div>
    </header>
  );
}
