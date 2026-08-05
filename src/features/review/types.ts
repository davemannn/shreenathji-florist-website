export interface Testimonial {
  id: string;
  quote: string;
  authorName: string;
  rating: number;
}

export interface GoogleReview {
  id: string;
  quote: string;
  authorName: string;
  rating: number;
}

export interface GoogleReviewAggregate {
  rating: number;
  count: number;
}
