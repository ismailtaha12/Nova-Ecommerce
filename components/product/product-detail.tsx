"use client";

import { useState, type FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Product, Review } from "@/lib/types";
import { formatDate, formatPrice, stockLabel } from "@/lib/format";
import { QuantitySelector } from "@/components/product/quantity-selector";
import { RatingStars } from "@/components/product/rating-stars";
import { ProductCard } from "@/components/product/product-card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCart } from "@/lib/stores/cart-store";
import { useWishlist } from "@/lib/stores/wishlist-store";
import { useAuth } from "@/lib/stores/auth-store";
import { submitReviewAction } from "@/lib/actions/reviews";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

function Gallery({ images, name }: { images: string[]; name: string }) {
  const [active, setActive] = useState(0);
  const src = images[active] ?? images[0];
  return (
    <div>
      <div className="relative aspect-[4/5] overflow-hidden bg-muted">
        {src ? (
          <Image
            src={src}
            alt={name}
            fill
            priority
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-contain transition-opacity duration-300"
          />
        ) : null}
      </div>
      {images.length > 1 ? (
        <div className="mt-3 grid grid-cols-4 gap-2">
          {images.map((imageSrc, i) => (
            <button
              key={imageSrc}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`View image ${i + 1}`}
              aria-current={active === i}
              className={cn(
                "relative aspect-square overflow-hidden bg-muted ring-offset-2 ring-offset-background",
                active === i && "ring-2 ring-foreground"
              )}
            >
              <Image src={imageSrc} alt="" fill className="object-cover" sizes="120px" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function ProductDetail({
  product,
  reviews,
  related,
}: {
  product: Product;
  reviews: Review[];
  related: Product[];
}) {
  const [variantId, setVariantId] = useState(product.variants[0]?.id ?? "");
  const selected =
    product.variants.find((item) => item.id === variantId) ?? product.variants[0];
  const [qty, setQty] = useState(1);
  const { addItem } = useCart();
  const { has, toggle } = useWishlist();
  const router = useRouter();
  const price = selected?.price ?? product.price;
  const stock = selected?.stock ?? product.stock;
  const out = stock <= 0;
  const wished = has(product.id);

  function addToCart() {
    addItem({
      product,
      variant: selected?.name ?? "Standard",
      variantId: selected?.id,
      quantity: qty,
    });
  }

  function buyNow() {
    addToCart();
    router.push("/checkout");
  }

  return (
    <>
      <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
        <Gallery images={product.images} name={product.name} />

        <div className="lg:sticky lg:top-24 lg:self-start">
          <p className="text-[11px] tracking-[0.28em] text-muted-foreground uppercase">
            {product.category}
          </p>
          <h1 className="mt-3 text-4xl font-medium tracking-tight md:text-5xl">
            {product.name}
          </h1>
          <p className="mt-3 text-lg text-muted-foreground">{product.tagline}</p>
          <div className="mt-4">
            <RatingStars rating={product.rating} count={product.reviewCount} size="md" />
          </div>
          <div className="mt-6 flex items-baseline gap-3">
            <p className="text-2xl tabular-nums">{formatPrice(price)}</p>
            {product.compareAtPrice ? (
              <p className="text-muted-foreground line-through tabular-nums">
                {formatPrice(product.compareAtPrice)}
              </p>
            ) : null}
          </div>
          <p className="mt-6 max-w-md leading-relaxed text-muted-foreground">
            {product.description}
          </p>

          <fieldset className="mt-8">
            <legend className="mb-3 text-xs tracking-wide text-muted-foreground">
              Option
            </legend>
            <div className="flex flex-wrap gap-2">
              {product.variants.map((v) => (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => setVariantId(v.id)}
                  className={cn(
                    "border px-4 py-2 text-sm transition-colors",
                    variantId === v.id
                      ? "border-foreground bg-foreground text-background"
                      : "border-border hover:border-foreground"
                  )}
                >
                  {v.name}
                </button>
              ))}
            </div>
          </fieldset>

          <div className="mt-8 flex items-center gap-4">
            <QuantitySelector
              value={qty}
              onChange={setQty}
              min={1}
              max={Math.max(1, stock)}
            />
            <p
              className={cn(
                "text-sm",
                out ? "text-destructive" : stock <= 6 ? "text-ember" : "text-muted-foreground"
              )}
            >
              {stockLabel(stock)}
            </p>
          </div>

          <div className="mt-8 hidden gap-3 lg:flex">
            <Button
              type="button"
              size="xl"
              variant="brand"
              className="flex-1"
              disabled={out}
              onClick={addToCart}
            >
              Add to cart
            </Button>
            <Button
              type="button"
              size="xl"
              className="flex-1"
              disabled={out}
              onClick={buyNow}
            >
              Buy now
            </Button>
            <Button
              type="button"
              size="xl"
              variant="outline"
              aria-label={wished ? "Remove from wishlist" : "Save to wishlist"}
              onClick={() => toggle(product)}
            >
              <Heart className={cn(wished && "fill-ember text-ember")} />
            </Button>
          </div>
        </div>
      </div>

      <div className="mt-20">
        <Tabs defaultValue="specs">
          <TabsList variant="line" className="w-full justify-start">
            <TabsTrigger value="specs">Specifications</TabsTrigger>
            <TabsTrigger value="shipping">Shipping</TabsTrigger>
            <TabsTrigger value="returns">Returns</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
          </TabsList>
          <TabsContent value="specs" className="pt-8">
            <dl className="max-w-2xl divide-y divide-border">
              {Object.entries(product.specs).map(([k, v]) => (
                <div key={k} className="grid grid-cols-2 py-3 text-sm">
                  <dt className="text-muted-foreground">{k}</dt>
                  <dd>{v}</dd>
                </div>
              ))}
            </dl>
          </TabsContent>
          <TabsContent value="shipping" className="max-w-2xl pt-8 text-sm leading-relaxed text-muted-foreground">
            {product.shipping}
          </TabsContent>
          <TabsContent value="returns" className="max-w-2xl pt-8 text-sm leading-relaxed text-muted-foreground">
            {product.returns}
          </TabsContent>
          <TabsContent value="reviews" className="pt-8">
            {reviews.length === 0 ? (
              <p className="text-sm text-muted-foreground">No reviews yet.</p>
            ) : (
              <ul className="max-w-2xl space-y-8">
                {reviews.map((r) => (
                  <li key={r.id}>
                    <div className="flex items-center justify-between gap-4">
                      <p className="font-medium">{r.title}</p>
                      <RatingStars rating={r.rating} />
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {r.author}
                      {r.verified ? " · Verified" : ""} · {formatDate(r.date)}
                    </p>
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{r.body}</p>
                  </li>
                ))}
              </ul>
            )}
            <ReviewForm productId={product.id} slug={product.slug} />
          </TabsContent>
        </Tabs>
      </div>

      {related.length > 0 ? (
        <div className="mt-24">
          <h2 className="text-2xl font-medium tracking-tight">Related</h2>
          <div className="mt-8 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      ) : null}

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 p-3 backdrop-blur lg:hidden">
        <div className="flex gap-2">
          <Button type="button" size="lg" variant="brand" className="flex-1" disabled={out} onClick={addToCart}>
            Add to cart
          </Button>
          <Button type="button" size="lg" className="flex-1" disabled={out} onClick={buyNow}>
            Buy now
          </Button>
        </div>
      </div>
      <p className="sr-only">
        <Link href="/cart">View bag</Link>
      </p>
    </>
  );
}

function ReviewForm({ productId, slug }: { productId: string; slug: string }) {
  const { user } = useAuth();
  const router = useRouter();
  const [rating, setRating] = useState(5);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!user) {
    return (
      <p className="mt-8 max-w-2xl text-sm text-muted-foreground">
        <Link
          href={`/login?next=/products/${slug}`}
          className="font-medium text-foreground underline-offset-4 hover:underline"
        >
          Sign in
        </Link>{" "}
        to write a review.
      </p>
    );
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setPending(true);
    const fd = new FormData(event.currentTarget);
    const result = await submitReviewAction({
      productId,
      rating,
      title: String(fd.get("title") || ""),
      body: String(fd.get("body") || ""),
    });
    setPending(false);
    if (result && "error" in result && result.error) {
      setError(result.error);
      return;
    }
    event.currentTarget.reset();
    setRating(5);
    toast.success("Review submitted");
    router.refresh();
  }

  return (
    <form className="mt-10 max-w-2xl space-y-4" onSubmit={onSubmit}>
      <h3 className="text-lg font-medium">Write a review</h3>
      <fieldset>
        <legend className="mb-2 text-sm font-medium">Rating</legend>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setRating(value)}
              className={cn(
                "size-9 border text-sm",
                rating === value
                  ? "border-foreground bg-foreground text-background"
                  : "border-border hover:border-foreground"
              )}
              aria-pressed={rating === value}
            >
              {value}
            </button>
          ))}
        </div>
      </fieldset>
      <div className="space-y-2">
        <Label htmlFor="review-title">Title</Label>
        <Input id="review-title" name="title" required className="h-11" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="review-body">Review</Label>
        <Textarea id="review-body" name="body" required rows={4} />
      </div>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <Button type="submit" size="lg" disabled={pending}>
        {pending ? "Submitting…" : "Submit review"}
      </Button>
    </form>
  );
}
