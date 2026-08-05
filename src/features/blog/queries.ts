import {
  findBlogPostBySlug,
  findRecentBlogPosts,
  listPublishedBlogPosts as listPublishedBlogPostsRepo,
  type ListBlogPostsParams,
} from "@/server/repositories/blog-post.repository";
import type { BlogPostDetail, BlogPostSummary } from "./types";

type BlogPostRow = Awaited<ReturnType<typeof findRecentBlogPosts>>[number];
type BlogPostWithContent = NonNullable<Awaited<ReturnType<typeof findBlogPostBySlug>>>;

function toSummary(post: BlogPostRow): BlogPostSummary {
  return {
    id: post.id,
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    coverImageUrl: post.coverImageUrl ?? undefined,
    coverImageAlt: post.coverImageAlt ?? post.title,
    authorName: post.authorName,
    readTimeMinutes: post.readTimeMinutes,
    publishedAt: post.publishedAt.toISOString(),
  };
}

function toDetail(post: BlogPostWithContent): BlogPostDetail {
  return { ...toSummary(post), content: post.content };
}

export type BlogPostListParams = ListBlogPostsParams;

export interface BlogPostListResult {
  posts: BlogPostSummary[];
  total: number;
  page: number;
  pageSize: number;
}

export async function listBlogPosts(params: BlogPostListParams = {}): Promise<BlogPostListResult> {
  const { posts, total, page, pageSize } = await listPublishedBlogPostsRepo(params);
  return { posts: posts.map(toSummary), total, page, pageSize };
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPostDetail | null> {
  const post = await findBlogPostBySlug(slug);
  return post ? toDetail(post) : null;
}

export async function getRecentBlogPosts(
  excludeSlug: string,
  limit = 3,
): Promise<BlogPostSummary[]> {
  const posts = await findRecentBlogPosts(excludeSlug, limit);
  return posts.map(toSummary);
}
