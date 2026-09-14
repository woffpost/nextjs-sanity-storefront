"use client";

import Link from "next/link";
import { useState } from "react";

import { useCart } from "@/lib/cart-context";

export default function CartPage() {
  const { lines, setQuantity, removeItem, subtotal } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function checkout() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lines: lines.map((line) => ({ productId: line.productId, quantity: line.quantity })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Checkout failed.");
      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setLoading(false);
    }
  }

  if (lines.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-28 text-center">
        <p className="font-display text-2xl">Your cart is empty.</p>
        <Link
          href="/"
          className="label mt-6 inline-block text-ink-soft underline decoration-border-strong underline-offset-4 transition hover:text-ink"
        >
          Continue shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="font-display text-3xl">Your cart</h1>

      <ul className="mt-10 divide-y divide-border border-y border-border">
        {lines.map((line) => (
          <li key={line.productId} className="flex items-center justify-between gap-6 py-6">
            <div className="min-w-0">
              <p className="font-display text-lg">{line.name}</p>
              <p className="label mt-1 text-ink-soft">${line.priceUsd.toFixed(2)}</p>
            </div>
            <div className="flex shrink-0 items-center gap-5">
              <div className="flex items-center rounded-sm border border-border">
                <button
                  type="button"
                  aria-label="Decrease quantity"
                  onClick={() => setQuantity(line.productId, line.quantity - 1)}
                  className="flex h-9 w-9 items-center justify-center text-ink-soft transition hover:text-ink"
                >
                  −
                </button>
                <span className="w-8 text-center text-sm tabular-nums">{line.quantity}</span>
                <button
                  type="button"
                  aria-label="Increase quantity"
                  onClick={() => setQuantity(line.productId, line.quantity + 1)}
                  className="flex h-9 w-9 items-center justify-center text-ink-soft transition hover:text-ink"
                >
                  +
                </button>
              </div>
              <button
                type="button"
                onClick={() => removeItem(line.productId)}
                className="label text-ink-faint underline decoration-border-strong underline-offset-4 transition hover:text-ink"
              >
                Remove
              </button>
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-8 flex items-center justify-between">
        <span className="label text-ink-soft">Subtotal</span>
        <span className="font-display text-2xl">${subtotal.toFixed(2)}</span>
      </div>

      {error && <p className="mt-4 text-sm text-red-700">{error}</p>}

      <button
        type="button"
        onClick={checkout}
        disabled={loading}
        className="label mt-8 w-full rounded-sm bg-ink px-5 py-4 text-paper transition hover:bg-accent-strong disabled:opacity-60"
      >
        {loading ? "Redirecting to Stripe…" : "Checkout with Stripe"}
      </button>
    </div>
  );
}
