import { SectionHeading } from "@/components/shared/section-heading";
import { StarRating } from "@/components/shared/star-rating";
import { getGoogleReviewAggregate, getGoogleReviews } from "../queries";

export async function GoogleReviewsSection() {
  const [aggregate, reviews] = await Promise.all([getGoogleReviewAggregate(), getGoogleReviews()]);

  return (
    <section className="bg-muted/40">
      <div className="mx-auto max-w-7xl px-4 py-16 md:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Google Reviews"
          title={`${aggregate.rating.toFixed(1)} out of 5`}
          description={`Based on ${aggregate.count}+ Google reviews`}
        />
        <div className="grid gap-6 sm:grid-cols-3">
          {reviews.map((review) => (
            <figure
              key={review.id}
              className="bg-background flex flex-col gap-3 rounded-xs border p-6"
            >
              <StarRating rating={review.rating} />
              <blockquote className="text-muted-foreground text-sm leading-relaxed">
                &ldquo;{review.quote}&rdquo;
              </blockquote>
              <figcaption className="text-sm font-medium">{review.authorName}</figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
