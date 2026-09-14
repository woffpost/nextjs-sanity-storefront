"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type CartLine = {
  productId: string;
  name: string;
  priceUsd: number;
  quantity: number;
  slug: string;
};

type CartContextValue = {
  lines: CartLine[];
  addItem: (item: Omit<CartLine, "quantity">, quantity?: number) => void;
  removeItem: (productId: string) => void;
  setQuantity: (productId: string, quantity: number) => void;
  clear: () => void;
  subtotal: number;
  count: number;
  /** True once the localStorage restore effect below has run. A consumer
   * that clears the cart on mount (see `ClearCartOnMount`) must wait for
   * this — otherwise, on a fresh full-page load, its clear can fire before
   * the restore effect (which runs on the provider, above it in the tree,
   * so its effect fires after) and gets silently overwritten by the
   * stored cart. */
  hydrated: boolean;
};

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "storefront-cart";

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [hydrated, setHydrated] = useState(false);

  // Deliberately not a `useState` lazy initializer: the server always
  // renders an empty cart (no `window`), so reading localStorage during the
  // client's first render — including a lazy initializer, which re-runs on
  // hydration — would return real data and cause a server/client hydration
  // mismatch. Reading it here instead, after mount, is the standard
  // two-pass "SSR-safe external storage" pattern (see next-themes'
  // `useTheme` for the same shape). This does trip the
  // `react-hooks/set-state-in-effect` heuristic; that rule's own guidance
  // — "subscribe for updates from an external system, calling setState in
  // a callback when external state changes" — is exactly what this is.
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (raw) setLines(JSON.parse(raw));
    } catch {
      // Corrupt or inaccessible storage — start from an empty cart.
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
  }, [lines, hydrated]);

  const value = useMemo<CartContextValue>(() => {
    const addItem: CartContextValue["addItem"] = (item, quantity = 1) => {
      setLines((prev) => {
        const existing = prev.find((line) => line.productId === item.productId);
        if (existing) {
          return prev.map((line) =>
            line.productId === item.productId
              ? { ...line, quantity: line.quantity + quantity }
              : line,
          );
        }
        return [...prev, { ...item, quantity }];
      });
    };

    const removeItem: CartContextValue["removeItem"] = (productId) => {
      setLines((prev) => prev.filter((line) => line.productId !== productId));
    };

    const setQuantity: CartContextValue["setQuantity"] = (productId, quantity) => {
      setLines((prev) =>
        quantity <= 0
          ? prev.filter((line) => line.productId !== productId)
          : prev.map((line) => (line.productId === productId ? { ...line, quantity } : line)),
      );
    };

    const clear = () => setLines([]);

    const subtotal = lines.reduce((sum, line) => sum + line.priceUsd * line.quantity, 0);
    const count = lines.reduce((sum, line) => sum + line.quantity, 0);

    return { lines, addItem, removeItem, setQuantity, clear, subtotal, count, hydrated };
  }, [lines, hydrated]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}
