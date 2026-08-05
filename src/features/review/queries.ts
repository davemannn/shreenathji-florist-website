import type { GoogleReview, GoogleReviewAggregate, Testimonial } from "./types";

// Placeholder content — clearly generic, not written to resemble specific
// real customers. Replace with real testimonials / real Google Reviews API
// data before launch; do not ship these as-is.

const TESTIMONIALS: Testimonial[] = [
  {
    id: "1",
    quote:
      "The bouquet arrived exactly on time and looked even better than the photos. Will definitely order again.",
    authorName: "Happy Customer",
    rating: 5,
  },
  {
    id: "2",
    quote:
      "Midnight delivery for my wife's birthday went off perfectly. Great communication throughout.",
    authorName: "Verified Buyer",
    rating: 5,
  },
  {
    id: "3",
    quote: "Flowers stayed fresh for over a week. Good value and friendly service.",
    authorName: "Local Customer",
    rating: 4,
  },
];

// TODO: replace with real Google Places API data once that integration exists.
const GOOGLE_REVIEW_AGGREGATE: GoogleReviewAggregate = {
  rating: 4.7,
  count: 210,
};

// TODO: replace with real Google Places API data once that integration exists.
const GOOGLE_REVIEWS: GoogleReview[] = [
  {
    id: "1",
    quote:
      "Reliable same-day delivery and beautiful arrangements. Highly recommend for last-minute gifts.",
    authorName: "Google User",
    rating: 5,
  },
  {
    id: "2",
    quote: "Ordered a cake and flower combo — both arrived fresh and on time.",
    authorName: "Google User",
    rating: 5,
  },
  {
    id: "3",
    quote: "Good variety and fair pricing compared to other florists in the area.",
    authorName: "Google User",
    rating: 4,
  },
];

export async function getTestimonials(): Promise<Testimonial[]> {
  return TESTIMONIALS;
}

export async function getGoogleReviewAggregate(): Promise<GoogleReviewAggregate> {
  return GOOGLE_REVIEW_AGGREGATE;
}

export async function getGoogleReviews(): Promise<GoogleReview[]> {
  return GOOGLE_REVIEWS;
}
