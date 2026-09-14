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
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => {
        addItem({ productId, name, priceUsd, slug });
        setAdded(true);
        setTimeout(() => setAdded(false), 1500);
      }}
      className="w-full rounded-md bg-neutral-900 px-4 py-3 text-sm font-medium text-white transition disabled:cursor-not-allowed disabled:bg-neutral-300"
    >
      {disabled ? "Out of stock" : added ? "Added ✓" : "Add to cart"}
    </button>
  );
}
