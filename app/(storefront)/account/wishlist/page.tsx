import { listWishlistIds } from "@/lib/data-access/orders";
import { listWishlistProducts } from "@/lib/data-access/products";
import { ProductCard } from "@/components/product/product-card";
import { EmptyWishlist } from "@/components/states/empty-state";

export const metadata = { title: "Wishlist" };

export default async function WishlistPage() {
  const ids = await listWishlistIds();
  const list = await listWishlistProducts(ids);

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
