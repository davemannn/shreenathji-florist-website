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
