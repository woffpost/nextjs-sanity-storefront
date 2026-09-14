"use client";

import { useEffect, useRef } from "react";

import { useCart } from "@/lib/cart-context";

export function ClearCartOnMount() {
  const { clear, hydrated } = useCart();
  const cleared = useRef(false);

  useEffect(() => {
    // Wait for the cart provider's own localStorage restore to finish
    // first — otherwise, on a fresh full-page load (exactly what a Stripe
    // redirect is), that restore effect runs after this one and silently
    // overwrites the clear with whatever was still in storage.
    if (!hydrated || cleared.current) return;
    cleared.current = true;
    clear();
  }, [hydrated, clear]);

  return null;
}
