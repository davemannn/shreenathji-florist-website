export interface BlogPostSummary {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  coverImageUrl?: string;
  coverImageAlt: string;
  authorName: string;
  readTimeMinutes: number;
  publishedAt: string;
}

export interface BlogPostDetail extends BlogPostSummary {
  content: string;
}

// ---------------------------------------------------------------------------
// Admin panel — marketing/content management (Phase 4).
// ---------------------------------------------------------------------------

export interface AdminBlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  coverImageUrl?: string;
  coverImageAlt?: string;
  coverImageCloudinaryId?: string;
  authorName: string;
  readTimeMinutes: number;
  isPublished: boolean;
  publishedAt: string;
}
