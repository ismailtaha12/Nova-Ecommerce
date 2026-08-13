"use client";

import type { ReactNode } from "react";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/lib/stores/auth-store";
import { CartProvider } from "@/lib/stores/cart-store";
import { WishlistProvider } from "@/lib/stores/wishlist-store";
import { AdminProvider } from "@/lib/stores/admin-store";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
          <AdminProvider>
            {children}
            <Toaster position="bottom-right" theme="light" />
          </AdminProvider>
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  );
}
