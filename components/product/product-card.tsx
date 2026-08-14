"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Heart, Plus } from "lucide-react";
import type { Product } from "@/lib/types";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { RatingStars } from "@/components/product/rating-stars";
import { useCart } from "@/lib/stores/cart-store";
import { useWishlist } from "@/lib/stores/wishlist-store";

export function ProductCard({
  product,
  large = false,
}: {
  product: Product;
  large?: boolean;
}) {
  const { addItem } = useCart();
  const { has, toggle } = useWishlist();
  const wished = has(product.id);
  const out = product.stock <= 0;
  const lowStock = product.stock > 0 && product.stock <= 6;
  const saveAmount =
    product.compareAtPrice != null
      ? product.compareAtPrice - product.price
      : 0;

  if (large) {
    return (
      <article className="group flex flex-col">
        <div className="relative">
          <Link
            href={`/products/${product.slug}`}
            className="relative block aspect-[4/5] overflow-hidden rounded-[1.5rem] border border-border/70 bg-card"
          >
            <div
              aria-hidden="true"
              className="absolute bottom-[12%] left-1/2 h-6 w-[55%] -translate-x-1/2 rounded-[100%] bg-ink/10 blur-xl"
            />
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              sizes="(min-width: 1024px) 33vw, 100vw"
              className="object-contain p-8 pb-12 transition-transform duration-500 ease-out group-hover:scale-[1.03] drop-shadow-[0_20px_32px_rgba(12,12,12,0.1)]"
            />
            {out ? (
              <span className="absolute inset-0 flex items-center justify-center bg-background/50 text-xs font-medium tracking-wide uppercase">
                Out of stock
              </span>
            ) : null}
            {product.onSale && saveAmount > 0 ? (
              <span className="absolute top-4 left-4 rounded-full bg-foreground px-3 py-1 text-[11px] font-medium text-background">
                Save {formatPrice(saveAmount)}
              </span>
            ) : lowStock ? (
              <span className="absolute top-4 left-4 rounded-full bg-[#f3e8dc] px-3 py-1 text-[11px] font-medium text-[#8a5a32]">
                Low stock
              </span>
            ) : null}
          </Link>
          <button
            type="button"
            aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
            aria-pressed={wished}
            onClick={() => toggle(product)}
            className="absolute top-4 right-4 flex size-10 items-center justify-center rounded-full bg-white shadow-[0_4px_16px_rgba(12,12,12,0.08)] transition-transform hover:scale-105"
          >
            <Heart
              className={cn("size-4", wished && "fill-foreground text-foreground")}
              strokeWidth={1.5}
            />
          </button>
        </div>

        <div className="pt-5">
          <div className="flex items-start justify-between gap-4">
            <Link
              href={`/products/${product.slug}`}
              className="text-lg font-semibold tracking-tight hover:underline underline-offset-4"
            >
              {product.name}
            </Link>
            <div className="shrink-0 text-right">
              <p className="text-lg font-semibold tabular-nums">
                {formatPrice(product.price)}
              </p>
              {product.compareAtPrice ? (
                <p className="text-sm text-muted-foreground line-through tabular-nums">
                  {formatPrice(product.compareAtPrice)}
                </p>
              ) : null}
            </div>
          </div>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {product.tagline}
          </p>
          <div className="mt-4">
            <RatingStars
              rating={product.rating}
              count={product.reviewCount}
              compact
            />
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="group flex flex-col">
      <div className="relative overflow-hidden rounded-[1.5rem] border border-border/70 bg-card">
        <Link
          href={`/products/${product.slug}`}
          className="relative block aspect-[4/5]"
        >
          <div
            aria-hidden="true"
            className="absolute bottom-[20%] left-1/2 h-5 w-[48%] -translate-x-1/2 rounded-[100%] bg-ink/8 blur-xl"
          />
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            sizes="(min-width: 1280px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-contain p-8 pb-14 transition-transform duration-500 ease-out group-hover:scale-[1.03] drop-shadow-[0_18px_32px_rgba(12,12,12,0.12)]"
          />
          {out ? (
            <span className="absolute inset-0 flex items-center justify-center rounded-[1.5rem] bg-background/50 text-xs font-medium tracking-wide uppercase">
              Out of stock
            </span>
          ) : null}
        </Link>

        <button
          type="button"
          aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
          aria-pressed={wished}
          onClick={() => toggle(product)}
          className="absolute top-4 right-4 flex size-10 items-center justify-center rounded-full bg-white shadow-[0_4px_16px_rgba(12,12,12,0.08)] transition-transform hover:scale-105"
        >
          <Heart
            className={cn("size-4", wished && "fill-foreground text-foreground")}
            strokeWidth={1.5}
          />
        </button>

        <Link
          href={`/products/${product.slug}`}
          className={cn(
            "absolute bottom-4 left-4 flex items-center gap-4 rounded-2xl bg-white px-4 py-3",
            "shadow-[0_8px_30px_rgba(12,12,12,0.08)] transition-all duration-200 hover:-translate-y-0.5",
            "md:group-hover:pointer-events-none md:group-hover:translate-y-1 md:group-hover:opacity-0"
          )}
        >
          <span>
            <span className="block text-sm font-medium text-foreground">{product.name}</span>
            <span className="mt-0.5 block text-sm text-muted-foreground tabular-nums">
              {formatPrice(product.price)}
            </span>
          </span>
          <span className="flex size-9 items-center justify-center rounded-full bg-muted">
            <ArrowRight className="size-4" strokeWidth={1.5} />
          </span>
        </Link>

        <div
          className={cn(
            "absolute inset-x-4 bottom-4 transition-all duration-200",
            "opacity-100 translate-y-0",
            "md:pointer-events-none md:translate-y-2 md:opacity-0",
            "md:group-hover:pointer-events-auto md:group-hover:translate-y-0 md:group-hover:opacity-100",
            "md:group-focus-within:pointer-events-auto md:group-focus-within:translate-y-0 md:group-focus-within:opacity-100"
          )}
        >
          <Button
            type="button"
            disabled={out}
            className="h-11 w-full rounded-full bg-foreground text-background shadow-[0_8px_24px_rgba(12,12,12,0.12)] hover:bg-foreground/90"
            onClick={() =>
              addItem({
                product,
                variant: product.variants[0]?.name ?? "Standard",
                variantId: product.variants[0]?.id,
              })
            }
          >
            <Plus className="size-4" strokeWidth={1.5} />
            Quick add
          </Button>
        </div>
      </div>

      <div className="pt-4">
        <p className="text-sm text-muted-foreground">{product.tagline}</p>
        <div className="mt-3">
          <RatingStars rating={product.rating} count={product.reviewCount} compact />
        </div>
      </div>
    </article>
  );
}
