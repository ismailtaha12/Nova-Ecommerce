"use client";

import Link from "next/link";
import { Container } from "@/components/layout/container";
import { CartLine, CartSummary } from "@/components/cart/cart-line";
import { EmptyCart } from "@/components/states/empty-state";
import { useCart } from "@/lib/stores/cart-store";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function CartPage() {
  const { items } = useCart();

  return (
    <Container className="py-16">
      <h1 className="text-4xl font-medium tracking-tight">Bag</h1>
      {items.length === 0 ? (
        <EmptyCart />
      ) : (
        <div className="mt-10 grid gap-12 lg:grid-cols-[1fr_360px]">
          <div>
            {items.map((item) => (
              <CartLine key={item.key} item={item} />
            ))}
          </div>
          <aside className="h-fit border border-border p-6 lg:sticky lg:top-24">
            <h2 className="text-sm font-medium">Summary</h2>
            <div className="mt-6">
              <CartSummary showCheckout={false} />
            </div>
            <Link
              href="/checkout"
              className="mt-6 flex h-12 w-full items-center justify-center bg-ember text-sm tracking-wide text-ember-foreground transition-colors hover:bg-ember/90"
            >
              Checkout
            </Link>
            <Link
              href="/products"
              className={cn(buttonVariants({ variant: "ghost" }), "mt-2 w-full")}
            >
              Continue shopping
            </Link>
          </aside>
        </div>
      )}
    </Container>
  );
}
