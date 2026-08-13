"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, Plus } from "lucide-react";
import type { Product } from "@/lib/types";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ColorSwatches } from "@/components/product/color-swatches";
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
            className="relative block aspect-[4/5] overflow-hidden rounded-[1.25rem] bg-[#efeae2]"
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
          <div className="mt-4 flex items-center justify-between gap-4">
            <RatingStars
              rating={product.rating}
              count={product.reviewCount}
              compact
            />
            <ColorSwatches colors={product.colors} size="sm" />
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="group relative flex flex-col">
      <Link href={`/products/${product.slug}`} className="relative block overflow-hidden bg-muted">
        <div className="relative aspect-[4/5]">
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-contain transition-transform duration-500 ease-out group-hover:scale-[1.03]"
          />
        </div>
        {product.onSale ? (
          <span className="absolute top-3 left-3 bg-ember px-2 py-0.5 text-[10px] tracking-widest text-ember-foreground uppercase">
            Sale
          </span>
        ) : null}
        {out ? (
          <span className="absolute inset-0 flex items-center justify-center bg-background/55 text-xs tracking-widest uppercase">
            Out of stock
          </span>
        ) : null}
      </Link>

      <div className="flex items-start justify-between gap-3 pt-4">
        <div className="min-w-0">
          <h3 className="truncate text-[15px] font-medium tracking-tight">
            <Link href={`/products/${product.slug}`} className="hover:underline underline-offset-4">
              {product.name}
            </Link>
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">{product.tagline}</p>
        </div>
        <button
          type="button"
          aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
          aria-pressed={wished}
          onClick={() => toggle(product)}
          className="mt-0.5 shrink-0 text-foreground/70 transition-colors hover:text-foreground"
        >
          <Heart className={cn("size-4", wished && "fill-ember text-ember")} strokeWidth={1.5} />
        </button>
      </div>

      <div className="mt-3 flex items-center justify-between gap-3">
        <div className="flex items-baseline gap-2">
          <span className="text-sm tabular-nums">{formatPrice(product.price)}</span>
          {product.compareAtPrice ? (
            <span className="text-xs text-muted-foreground line-through tabular-nums">
              {formatPrice(product.compareAtPrice)}
            </span>
          ) : null}
        </div>
        <RatingStars rating={product.rating} />
      </div>

      <div className="mt-3 flex items-center justify-between gap-3">
        <ColorSwatches colors={product.colors} size="sm" />
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={out}
          className="opacity-100 md:opacity-0 md:transition-opacity md:group-hover:opacity-100 md:focus-visible:opacity-100"
          onClick={() =>
            addItem({
              product,
              color: product.colors[0].name,
              variant: product.variants[0].name,
            })
          }
        >
          <Plus data-icon="inline-start" />
          Quick add
        </Button>
      </div>
    </article>
  );
}
