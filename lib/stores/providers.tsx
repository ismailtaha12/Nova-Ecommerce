"use client";

import type { ReactNode } from "react";
import { Toaster } from "@/components/ui/sonner";
import type { SessionUser } from "@/lib/types";
import { AuthProvider } from "@/lib/stores/auth-store";
import { CartProvider } from "@/lib/stores/cart-store";
import { WishlistProvider } from "@/lib/stores/wishlist-store";

export function AppProviders({
  children,
  user,
  wishlistIds,
}: {
  children: ReactNode;
  user: SessionUser | null;
  wishlistIds: string[];
}) {
  return (
    <AuthProvider user={user}>
      <CartProvider>
        <WishlistProvider key={user?.id ?? "guest"} initialIds={wishlistIds}>
          {children}
          <Toaster position="bottom-right" theme="light" />
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  );
}
