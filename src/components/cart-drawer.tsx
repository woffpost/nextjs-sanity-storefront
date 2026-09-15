"use client";

import Link from "next/link";
import { useEffect } from "react";

import { useCart } from "@/lib/cart-context";
import { useCheckout } from "@/lib/use-checkout";

export function CartDrawer() {
  const { lines, setQuantity, subtotal, drawerOpen, closeDrawer } = useCart();
  const { checkout, loading, error } = useCheckout();

  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeDrawer();
    };
    document.addEventListener("keydown", onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [drawerOpen, closeDrawer]);

  return (
    <>
      <div
        aria-hidden={!drawerOpen}
        onClick={closeDrawer}
        className={`fixed inset-0 z-50 bg-ink/30 backdrop-blur-[2px] transition-opacity duration-300 ${
          drawerOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Cart"
        className={`fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col bg-paper-raised shadow-2xl transition-transform duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          drawerOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-border px-6 py-5">
          <p className="font-display text-xl">Your cart</p>
          <button
            type="button"
            onClick={closeDrawer}
            aria-label="Close cart"
            className="label text-ink-soft transition hover:text-ink"
          >
            Close
          </button>
        </div>

        {lines.length === 0 ? (
          <div className="flex flex-1 items-center justify-center px-6">
            <p className="text-ink-soft">Your cart is empty.</p>
          </div>
        ) : (
          <>
            <ul className="flex-1 divide-y divide-border overflow-y-auto px-6">
              {lines.map((line) => (
                <li key={line.productId} className="flex items-center justify-between gap-4 py-5">
                  <div className="min-w-0">
                    <p className="font-display truncate text-base">{line.name}</p>
                    <p className="label mt-1 text-ink-soft">${line.priceUsd.toFixed(2)}</p>
                  </div>
                  <div className="flex shrink-0 items-center rounded-sm border border-border">
                    <button
                      type="button"
                      aria-label="Decrease quantity"
                      onClick={() => setQuantity(line.productId, line.quantity - 1)}
                      className="flex h-8 w-8 items-center justify-center text-ink-soft transition hover:text-ink"
                    >
                      −
                    </button>
                    <span className="w-6 text-center text-sm tabular-nums">{line.quantity}</span>
                    <button
                      type="button"
                      aria-label="Increase quantity"
                      onClick={() => setQuantity(line.productId, line.quantity + 1)}
                      className="flex h-8 w-8 items-center justify-center text-ink-soft transition hover:text-ink"
                    >
                      +
                    </button>
                  </div>
                </li>
              ))}
            </ul>

            <div className="border-t border-border px-6 py-6">
              <div className="flex items-center justify-between">
                <span className="label text-ink-soft">Subtotal</span>
                <span className="font-display text-xl">${subtotal.toFixed(2)}</span>
              </div>

              {error && <p className="mt-3 text-sm text-red-700">{error}</p>}

              <button
                type="button"
                onClick={checkout}
                disabled={loading}
                className="label mt-5 w-full rounded-sm bg-ink px-5 py-4 text-paper transition hover:bg-accent-strong disabled:opacity-60"
              >
                {loading ? "Redirecting to Stripe…" : "Checkout with Stripe"}
              </button>
              <Link
                href="/cart"
                onClick={closeDrawer}
                className="label mt-4 block text-center text-ink-faint underline decoration-border-strong underline-offset-4 transition hover:text-ink"
              >
                View full cart
              </Link>
            </div>
          </>
        )}
      </div>
    </>
  );
}
