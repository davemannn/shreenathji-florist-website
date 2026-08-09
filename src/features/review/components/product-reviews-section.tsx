import Link from "next/link";
import { headers } from "next/headers";
import { auth } from "@/server/auth/config";
import { SectionHeading } from "@/components/shared/section-heading";
import { ProductReviews } from "@/features/product/components/product-reviews";
import type { ProductReview } from "@/features/product/types";
import { getReviewEligibility } from "../queries";
import { ReviewForm } from "./review-form";

interface ProductReviewsSectionProps {
  productId: string;
  productSlug: string;
  reviews: ProductReview[];
}

/**
 * Wraps the existing (display-only) ProductReviews with the actual
 * submission flow — sign-in gate, "already reviewed" state, and the
 * Verified Purchase hint, all resolved server-side so the client form
 * itself stays a thin, stateless submit button.
 */
export async function ProductReviewsSection({
  productId,
  productSlug,
  reviews,
}: ProductReviewsSectionProps) {
  const session = await auth.api.getSession({ headers: await headers() });
  const eligibility = session ? await getReviewEligibility(productId, session.user.id) : null;

  return (
    <section className="mt-16">
      <SectionHeading title="Customer Reviews" align="left" />

      {reviews.length > 0 ? <ProductReviews reviews={reviews} /> : null}

      <div className={reviews.length > 0 ? "mt-8 max-w-lg" : "max-w-lg"}>
        {!session ? (
          <p className="text-muted-foreground text-sm">
            <Link
              href={`/sign-in?redirectTo=/shop/product/${productSlug}`}
              className="text-brand underline underline-offset-2"
            >
              Sign in
            </Link>{" "}
            to write a review.
          </p>
        ) : eligibility?.hasReviewed ? (
          <p className="text-muted-foreground text-sm">
            You&rsquo;ve already reviewed this product — thanks!
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {eligibility?.isVerifiedPurchase ? (
              <p className="text-brand text-xs font-medium">✓ Verified purchase</p>
            ) : null}
            <ReviewForm productId={productId} productSlug={productSlug} />
          </div>
        )}
      </div>
    </section>
  );
}
