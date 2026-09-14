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
      <div className="mx-auto max-w-2xl px-6 py-16 text-center">
        <p className="text-neutral-600">Your cart is empty.</p>
        <Link href="/" className="mt-4 inline-block underline underline-offset-4">
          Continue shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <h1 className="text-xl font-semibold tracking-tight">Cart</h1>

      <ul className="mt-8 divide-y divide-neutral-200">
        {lines.map((line) => (
          <li key={line.productId} className="flex items-center justify-between gap-4 py-4">
            <div>
              <p className="text-sm font-medium">{line.name}</p>
              <p className="text-sm text-neutral-500">${line.priceUsd.toFixed(2)}</p>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min={0}
                value={line.quantity}
                onChange={(e) => setQuantity(line.productId, Number(e.target.value))}
                className="w-16 rounded border border-neutral-300 px-2 py-1 text-sm"
              />
              <button
                type="button"
                onClick={() => removeItem(line.productId)}
                className="text-sm text-neutral-400 underline underline-offset-4 hover:text-neutral-700"
              >
                Remove
              </button>
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-6 flex items-center justify-between border-t border-neutral-200 pt-6">
        <span className="text-sm font-medium">Subtotal</span>
        <span className="text-lg font-semibold">${subtotal.toFixed(2)}</span>
      </div>

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      <button
        type="button"
        onClick={checkout}
        disabled={loading}
        className="mt-6 w-full rounded-md bg-neutral-900 px-4 py-3 text-sm font-medium text-white disabled:opacity-60"
      >
        {loading ? "Redirecting to Stripe…" : "Checkout with Stripe"}
      </button>
    </div>
  );
}
