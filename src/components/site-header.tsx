"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { useCart } from "@/lib/cart-context";

export function SiteHeader() {
  const { count, openDrawer } = useCart();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-40 border-b bg-paper/90 backdrop-blur-sm transition-[border-color,box-shadow] duration-300 ${
        scrolled ? "border-border-strong shadow-[0_1px_0_0_var(--border-strong)]" : "border-border"
      }`}
    >
      <div
        className={`mx-auto flex max-w-6xl items-center justify-between px-6 transition-[padding] duration-300 ${
          scrolled ? "py-4" : "py-5"
        }`}
      >
        <Link href="/" className="font-display text-xl tracking-tight">
          Storefront
        </Link>
        <nav className="flex items-center gap-8">
          <button
            type="button"
            onClick={openDrawer}
            className="label flex items-center gap-2 text-ink-soft transition hover:text-ink"
          >
            Cart
            {count > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1.5 text-[10px] font-medium text-paper-raised">
                {count}
              </span>
            )}
          </button>
        </nav>
      </div>
    </header>
  );
}
