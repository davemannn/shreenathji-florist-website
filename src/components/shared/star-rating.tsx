import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  rating: number;
  reviewCount?: number;
  className?: string;
}

/** Static star display (rounded to the nearest whole star) — purely presentational, no need for a client boundary. */
export function StarRating({ rating, reviewCount, className }: StarRatingProps) {
  const rounded = Math.round(rating);

  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <div className="flex items-center" role="img" aria-label={`Rated ${rating} out of 5`}>
        {Array.from({ length: 5 }).map((_, index) => (
          <Star
            key={index}
            className={cn(
              "size-3.5",
              index < rounded ? "fill-brand text-brand" : "fill-muted text-muted",
            )}
            aria-hidden="true"
          />
        ))}
      </div>
      {reviewCount !== undefined ? (
        <span className="text-muted-foreground text-xs">({reviewCount})</span>
      ) : null}
    </div>
  );
}
