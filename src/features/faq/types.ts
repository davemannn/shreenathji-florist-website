/** Storefront-facing shape — used by both the homepage accordion and the standalone /faq page. */
export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category?: string;
}

// ---------------------------------------------------------------------------
// Admin panel.
// ---------------------------------------------------------------------------

export interface AdminFaqItem {
  id: string;
  question: string;
  answer: string;
  category?: string;
  isActive: boolean;
  sortOrder: number;
}
