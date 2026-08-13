import Link from "next/link";
import { Star } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { ReviewDeleteButton } from "@/components/admin/review-delete-button";
import { RatingStars } from "@/components/product/rating-stars";
import { EmptyState } from "@/components/states/empty-state";
import { listAdminReviews } from "@/lib/data-access/admin";
import { formatDate } from "@/lib/format";

export default async function AdminReviewsPage({
  searchParams,
}: {
  searchParams: Promise<{ rating?: string }>;
}) {
  const params = await searchParams;
  const rating = Number(params.rating);
  const reviews = await listAdminReviews();
  const filtered =
    Number.isInteger(rating) && rating >= 1 && rating <= 5
      ? reviews.filter((review) => review.rating === rating)
      : reviews;

  return (
    <div>
      <AdminPageHeader title="Reviews" description="Moderate customer reviews." />
      <div className="mb-6 flex flex-wrap gap-2 text-sm">
        <Link
          href="/admin/reviews"
          className={!params.rating ? "font-medium" : "text-muted-foreground hover:text-foreground"}
        >
          All
        </Link>
        {[5, 4, 3, 2, 1].map((value) => (
          <Link
            key={value}
            href={`/admin/reviews?rating=${value}`}
            className={
              rating === value ? "font-medium" : "text-muted-foreground hover:text-foreground"
            }
          >
            {value} star
          </Link>
        ))}
      </div>
      {filtered.length === 0 ? (
        <EmptyState
          icon={Star}
          title="No reviews"
          description="When customers write reviews, they will appear here."
        />
      ) : (
        <ul className="divide-y divide-border border-y border-border">
          {filtered.map((review) => (
            <li key={review.id} className="py-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-medium">{review.title}</p>
                <div className="flex items-center gap-3">
                  <RatingStars rating={review.rating} />
                  <ReviewDeleteButton reviewId={review.id} />
                </div>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {review.author} on{" "}
                {review.productId ? (
                  <>
                    <Link
                      href={`/admin/products/${review.productId}/edit`}
                      className="underline-offset-4 hover:underline"
                    >
                      {review.productName || "product"}
                    </Link>
                    {review.productSlug ? (
                      <>
                        {" · "}
                        <Link
                          href={`/products/${review.productSlug}`}
                          className="underline-offset-4 hover:underline"
                        >
                          View on store
                        </Link>
                      </>
                    ) : null}
                  </>
                ) : (
                  review.productName || "Unknown product"
                )}{" "}
                · {formatDate(review.date)}
              </p>
              <p className="mt-2 text-sm text-muted-foreground">{review.body}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
