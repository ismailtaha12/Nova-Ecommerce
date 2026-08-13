"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { toast } from "sonner";
import type { Product } from "@/lib/types";
import { useLocalStorage } from "@/lib/hooks/use-local-storage";
import { useAuth } from "@/lib/stores/auth-store";
import { toggleWishlistAction } from "@/lib/actions/wishlist";

type WishlistContextValue = {
  ids: string[];
  toggle: (product: Product) => void;
  has: (id: string) => boolean;
};

const WishlistContext = createContext<WishlistContextValue | null>(null);
const STORAGE_KEY = "nova-wishlist";
const empty: string[] = [];

export function WishlistProvider({
  children,
  initialIds = empty,
}: {
  children: ReactNode;
  initialIds?: string[];
}) {
  const { user } = useAuth();
  const [guestIds, setGuestIds] = useLocalStorage<string[]>(STORAGE_KEY, empty);
  const [serverIds, setServerIds] = useState<string[]>(initialIds);

  const ids = user ? serverIds : guestIds;

  const toggle = useCallback(
    (product: Product) => {
      if (!user) {
        setGuestIds((prev) => {
          if (prev.includes(product.id)) {
            toast("Removed from wishlist");
            return prev.filter((id) => id !== product.id);
          }
          toast.success("Saved to wishlist");
          return [...prev, product.id];
        });
        return;
      }

      const wasWished = serverIds.includes(product.id);
      setServerIds((prev) =>
        wasWished
          ? prev.filter((id) => id !== product.id)
          : [...prev, product.id],
      );
      if (wasWished) {
        toast("Removed from wishlist");
      } else {
        toast.success("Saved to wishlist");
      }

      void toggleWishlistAction(product.id).then((result) => {
        if (result && "error" in result && result.error) {
          setServerIds((prev) =>
            wasWished
              ? [...prev, product.id]
              : prev.filter((id) => id !== product.id),
          );
          toast.error(result.error);
        }
      });
    },
    [serverIds, setGuestIds, user],
  );

  const has = useCallback((id: string) => ids.includes(id), [ids]);

  const value = useMemo(() => ({ ids, toggle, has }), [ids, toggle, has]);

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within WishlistProvider");
  return ctx;
}
