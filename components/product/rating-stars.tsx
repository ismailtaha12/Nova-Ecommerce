import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function RatingStars({
  rating,
  count,
  size = "sm",
  compact = false,
}: {
  rating: number;
  count?: number;
  size?: "sm" | "md";
  compact?: boolean;
}) {
  const icon = size === "sm" ? "size-3.5" : "size-4";
  return (
    <div className="flex items-center gap-1.5 text-foreground">
      <div className="flex items-center gap-0.5" aria-hidden="true">
        {Array.from({ length: 5 }, (_, i) => {
          const filled = rating >= i + 1;
          const half = !filled && rating >= i + 0.5;
          return (
            <Star
              key={i}
              className={cn(
                icon,
                filled || half ? "fill-foreground text-foreground" : "text-border"
              )}
              strokeWidth={1.25}
            />
          );
        })}
      </div>
      <span
        className={cn(
          "text-muted-foreground",
          size === "sm" ? "text-xs" : "text-sm"
        )}
      >
        <span className="sr-only">Rated </span>
        {rating.toFixed(1)}
        {count != null ? (
          compact ? (
            <span> ({count.toLocaleString()})</span>
          ) : (
            <span> · {count.toLocaleString()} reviews</span>
          )
        ) : null}
      </span>
    </div>
  );
}
