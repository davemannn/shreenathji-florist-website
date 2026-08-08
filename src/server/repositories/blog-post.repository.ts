import { prisma } from "@/server/db/prisma";

export interface ListBlogPostsParams {
  page?: number;
  pageSize?: number;
}

export async function listPublishedBlogPosts(params: ListBlogPostsParams = {}) {
  const { page = 1, pageSize = 9 } = params;
  const where = { isPublished: true };

  const [posts, total] = await Promise.all([
    prisma.blogPost.findMany({
      where,
      orderBy: { publishedAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.blogPost.count({ where }),
  ]);

  return { posts, total, page, pageSize };
}

export async function findBlogPostBySlug(slug: string) {
  return prisma.blogPost.findUnique({ where: { slug, isPublished: true } });
}

export async function findRecentBlogPosts(excludeSlug: string, limit = 3) {
  return prisma.blogPost.findMany({
    where: { isPublished: true, slug: { not: excludeSlug } },
    orderBy: { publishedAt: "desc" },
    take: limit,
  });
}

// ---------------------------------------------------------------------------
// Admin panel — marketing/content management (Phase 4).
// ---------------------------------------------------------------------------

export async function listBlogPostsAdmin() {
  return prisma.blogPost.findMany({ orderBy: { publishedAt: "desc" } });
}

export async function findBlogPostByIdAdmin(id: string) {
  return prisma.blogPost.findUnique({ where: { id } });
}

export interface UpsertBlogPostInput {
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
}

export async function createBlogPost(input: UpsertBlogPostInput) {
  return prisma.blogPost.create({ data: input });
}

export async function updateBlogPost(id: string, input: UpsertBlogPostInput) {
  return prisma.blogPost.update({ where: { id }, data: input });
}

export async function setBlogPostPublished(id: string, isPublished: boolean) {
  return prisma.blogPost.update({ where: { id }, data: { isPublished } });
}

export async function deleteBlogPost(id: string) {
  return prisma.blogPost.delete({ where: { id } });
}
