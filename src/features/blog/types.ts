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
