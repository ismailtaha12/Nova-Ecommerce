import { reviews, products } from "@/lib/data";
import { RatingStars } from "@/components/product/rating-stars";

export default function AdminReviewsPage() {
  return (
    <div>
      <h1 className="text-3xl font-medium tracking-tight">Reviews</h1>
      <ul className="mt-8 divide-y divide-border border-y border-border">
        {reviews.map((r) => {
          const product = products.find((p) => p.id === r.productId);
          return (
            <li key={r.id} className="py-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-medium">{r.title}</p>
                <RatingStars rating={r.rating} />
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {r.author} on {product?.name} · {r.date}
              </p>
              <p className="mt-2 text-sm text-muted-foreground">{r.body}</p>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
