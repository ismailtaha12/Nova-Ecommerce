"use client";

import Link from "next/link";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CartLine, CartSummary } from "@/components/cart/cart-line";
import { EmptyCart } from "@/components/states/empty-state";
import { useCart } from "@/lib/stores/cart-store";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function CartDrawer() {
  const { items, cartOpen, setCartOpen, count } = useCart();

  return (
    <Sheet open={cartOpen} onOpenChange={setCartOpen}>
      <SheetContent
        side="right"
        className="w-full gap-0 sm:max-w-md"
        showCloseButton
      >
        <SheetHeader className="border-b border-border">
          <SheetTitle className="font-sans text-base tracking-tight">
            Bag {count > 0 ? `(${count})` : ""}
          </SheetTitle>
          <SheetDescription className="sr-only">
            Items in your shopping bag
          </SheetDescription>
        </SheetHeader>
        {items.length === 0 ? (
          <EmptyCart />
        ) : (
          <>
            <ScrollArea className="flex-1 px-4">
              {items.map((item) => (
                <CartLine key={item.key} item={item} />
              ))}
            </ScrollArea>
            <SheetFooter className="border-t border-border">
              <CartSummary showCheckout={false} />
              <Link
                href="/checkout"
                onClick={() => setCartOpen(false)}
                className="flex h-12 w-full items-center justify-center bg-ember text-sm tracking-wide text-ember-foreground transition-colors hover:bg-ember/90"
              >
                Checkout
              </Link>
              <Link
                href="/cart"
                onClick={() => setCartOpen(false)}
                className={cn(buttonVariants({ variant: "ghost" }), "w-full")}
              >
                View bag
              </Link>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
