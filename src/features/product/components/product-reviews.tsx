import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { StarRating } from "@/components/shared/star-rating";
import { SectionHeading } from "@/components/shared/section-heading";
import type { ProductReview } from "../types";

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function ProductReviews({ reviews }: { reviews: ProductReview[] }) {
  if (reviews.length === 0) return null;

  return (
    <section className="mt-16">
      <SectionHeading title="Customer Reviews" align="left" />
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {reviews.map((review) => (
          <figure
            key={review.id}
            className="border-border flex flex-col gap-3 rounded-xs border p-6"
          >
            <StarRating rating={review.rating} />
            <blockquote className="text-muted-foreground text-sm leading-relaxed">
              &ldquo;{review.comment}&rdquo;
            </blockquote>
            <figcaption className="mt-auto flex items-center gap-3">
              <Avatar>
                <AvatarFallback className="bg-brand/10 text-brand">
                  {initials(review.authorName)}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium">{review.authorName}</span>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
