"use client";

import Image from "next/image";
import Link from "next/link";
import { X } from "lucide-react";
import type { CartItem } from "@/lib/types";
import { formatPrice } from "@/lib/format";
import { QuantitySelector } from "@/components/product/quantity-selector";
import { useCart } from "@/lib/stores/cart-store";

export function CartLine({ item }: { item: CartItem }) {
  const { updateQty, removeItem } = useCart();

  return (
    <div className="flex gap-4 border-b border-border py-5">
      <Link href={`/products/${item.slug}`} className="relative size-24 shrink-0 overflow-hidden bg-muted">
        <Image src={item.image} alt={item.name} fill className="object-contain" sizes="96px" />
      </Link>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-3">
          <div>
            <Link href={`/products/${item.slug}`} className="text-sm font-medium hover:underline underline-offset-4">
              {item.name}
            </Link>
            <p className="mt-1 text-xs text-muted-foreground">
              {item.variant}
            </p>
          </div>
          <p className="text-sm tabular-nums">{formatPrice(item.price * item.quantity)}</p>
        </div>
        <div className="mt-auto flex items-center justify-between pt-3">
          <QuantitySelector
            value={item.quantity}
            min={1}
            max={item.stock}
            onChange={(n) => updateQty(item.key, n)}
          />
          <button
            type="button"
            onClick={() => removeItem(item.key)}
            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            <X className="size-3.5" />
            Remove
          </button>
        </div>
      </div>
    </div>
  );
}

export function CartSummary({
  showCheckout = true,
  compact = false,
}: {
  showCheckout?: boolean;
  compact?: boolean;
}) {
  const { subtotal, shipping, tax, total } = useCart();
  const rows = [
    { label: "Subtotal", value: formatPrice(subtotal) },
    { label: "Estimated shipping", value: shipping === 0 ? "Free" : formatPrice(shipping) },
    { label: "Estimated tax", value: formatPrice(tax) },
  ];

  return (
    <div className={compact ? "space-y-2" : "space-y-3"}>
      {rows.map((row) => (
        <div key={row.label} className="flex justify-between text-sm">
          <span className="text-muted-foreground">{row.label}</span>
          <span className="tabular-nums">{row.value}</span>
        </div>
      ))}
      <div className="flex justify-between border-t border-border pt-3 text-sm font-medium">
        <span>Total</span>
        <span className="tabular-nums">{formatPrice(total)}</span>
      </div>
      {showCheckout ? (
        <Link
          href="/checkout"
          className="mt-2 flex h-12 w-full items-center justify-center bg-ember text-sm tracking-wide text-ember-foreground transition-colors hover:bg-ember/90"
        >
          Checkout
        </Link>
      ) : null}
    </div>
  );
}
