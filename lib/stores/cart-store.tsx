"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { toast } from "sonner";
import type { CartItem, Product } from "@/lib/types";
import { variantPrice } from "@/lib/commerce";
import { useLocalStorage } from "@/lib/hooks/use-local-storage";

type CartContextValue = {
  items: CartItem[];
  addItem: (input: {
    product: Product;
    variant: string;
    variantId?: string;
    quantity?: number;
  }) => void;
  updateQty: (key: string, quantity: number) => void;
  removeItem: (key: string) => void;
  clear: () => void;
  count: number;
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  cartOpen: boolean;
  setCartOpen: (open: boolean) => void;
  searchOpen: boolean;
  setSearchOpen: (open: boolean) => void;
};

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "nova-cart";
const empty: CartItem[] = [];

function itemKey(productId: string, variant: string) {
  return `${productId}::${variant}`;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useLocalStorage<CartItem[]>(STORAGE_KEY, empty);
  const [cartOpen, setCartOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const addItem = useCallback(
    ({
      product,
      variant,
      variantId,
      quantity = 1,
    }: {
      product: Product;
      variant: string;
      variantId?: string;
      quantity?: number;
    }) => {
      const selected =
        product.variants.find((item) => item.id === variantId) ??
        product.variants.find((item) => item.name === variant) ??
        product.variants[0];
      const stock = selected?.stock ?? product.stock;
      const price = variantPrice(product.price, selected?.price);
      if (stock <= 0) {
        toast.error("This option is currently unavailable.");
        return;
      }
      const key = itemKey(product.id, selected?.id ?? variant);
      setItems((prev) => {
        const existing = prev.find((i) => i.key === key);
        if (existing) {
          const nextQty = Math.min(existing.quantity + quantity, stock);
          toast.success("Quantity updated");
          return prev.map((i) =>
            i.key === key ? { ...i, quantity: nextQty, stock, price } : i
          );
        }
        toast.success(`${product.name} added to bag`);
        return [
          ...prev,
          {
            key,
            productId: product.id,
            slug: product.slug,
            name: product.name,
            image: product.images[0],
            variant: selected?.name ?? variant,
            variantId: selected?.id,
            price,
            quantity,
            stock,
          },
        ];
      });
      setCartOpen(true);
    },
    [setCartOpen, setItems]
  );

  const updateQty = useCallback(
    (key: string, quantity: number) => {
      setItems((prev) =>
        prev
          .map((i) =>
            i.key === key
              ? { ...i, quantity: Math.max(0, Math.min(quantity, i.stock)) }
              : i
          )
          .filter((i) => i.quantity > 0)
      );
    },
    [setItems]
  );

  const removeItem = useCallback(
    (key: string) => {
      setItems((prev) => prev.filter((i) => i.key !== key));
      toast("Removed from bag");
    },
    [setItems]
  );

  const clear = useCallback(() => setItems([]), [setItems]);

  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const shipping = subtotal >= 75 || subtotal === 0 ? 0 : 12;
  const tax = Math.round(subtotal * 0.085 * 100) / 100;
  const total = Math.round((subtotal + shipping + tax) * 100) / 100;
  const count = items.reduce((s, i) => s + i.quantity, 0);

  const value = useMemo(
    () => ({
      items,
      addItem,
      updateQty,
      removeItem,
      clear,
      count,
      subtotal,
      shipping,
      tax,
      total,
      cartOpen,
      setCartOpen,
      searchOpen,
      setSearchOpen,
    }),
    [
      items,
      addItem,
      updateQty,
      removeItem,
      clear,
      count,
      subtotal,
      shipping,
      tax,
      total,
      cartOpen,
      searchOpen,
      setCartOpen,
      setSearchOpen,
    ]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
