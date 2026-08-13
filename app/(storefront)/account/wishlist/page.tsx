"use client";

import { products } from "@/lib/data";
import { useWishlist } from "@/lib/stores/wishlist-store";
import { ProductCard } from "@/components/product/product-card";
import { EmptyWishlist } from "@/components/states/empty-state";

export default function WishlistPage() {
  const { ids } = useWishlist();
  const list = products.filter((p) => ids.includes(p.id));

  return (
    <div>
      <h1 className="text-3xl font-medium tracking-tight">Wishlist</h1>
      {list.length === 0 ? (
        <EmptyWishlist />
      ) : (
        <div className="mt-8 grid gap-10 sm:grid-cols-2">
          {list.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
