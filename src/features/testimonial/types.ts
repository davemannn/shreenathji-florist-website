/** Storefront-facing shape — what the homepage carousel actually renders. */
export interface Testimonial {
  id: string;
  authorName: string;
  quote: string;
  rating: number;
  photoUrl?: string;
}

// ---------------------------------------------------------------------------
// Admin panel.
// ---------------------------------------------------------------------------

export interface AdminTestimonial {
  id: string;
  authorName: string;
  quote: string;
  rating: number;
  photoUrl?: string;
  isActive: boolean;
  sortOrder: number;
}
