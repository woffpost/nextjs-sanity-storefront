"use client";

import { useState } from "react";

import { useCart } from "@/lib/cart-context";

export function AddToCartButton({
  productId,
  name,
  priceUsd,
  slug,
  disabled,
}: {
  productId: string;
  name: string;
  priceUsd: number;
  slug: string;
  disabled?: boolean;
}) {
  const { addItem, openDrawer } = useCart();
  const [added, setAdded] = useState(false);

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => {
        addItem({ productId, name, priceUsd, slug });
        setAdded(true);
        openDrawer();
        setTimeout(() => setAdded(false), 1500);
      }}
      className="label w-full rounded-sm bg-ink px-5 py-4 text-paper transition hover:bg-accent-strong disabled:cursor-not-allowed disabled:bg-border-strong disabled:text-ink-faint"
    >
      {disabled ? "Out of stock" : added ? "Added ✓" : "Add to cart"}
    </button>
  );
}
