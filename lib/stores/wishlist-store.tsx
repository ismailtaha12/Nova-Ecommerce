"use client";

import { createContext, useCallback, useContext, useMemo, type ReactNode } from "react";
import { toast } from "sonner";
import type { Product } from "@/lib/types";
import { useLocalStorage } from "@/lib/hooks/use-local-storage";

type WishlistContextValue = {
  ids: string[];
  toggle: (product: Product) => void;
  has: (id: string) => boolean;
};

const WishlistContext = createContext<WishlistContextValue | null>(null);
const STORAGE_KEY = "nova-wishlist";
const empty: string[] = [];

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [ids, setIds] = useLocalStorage<string[]>(STORAGE_KEY, empty);

  const toggle = useCallback(
    (product: Product) => {
      setIds((prev) => {
        if (prev.includes(product.id)) {
          toast("Removed from wishlist");
          return prev.filter((id) => id !== product.id);
        }
        toast.success("Saved to wishlist");
        return [...prev, product.id];
      });
    },
    [setIds]
  );

  const has = useCallback((id: string) => ids.includes(id), [ids]);

  const value = useMemo(() => ({ ids, toggle, has }), [ids, toggle, has]);

  return (
    <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within WishlistProvider");
  return ctx;
}
