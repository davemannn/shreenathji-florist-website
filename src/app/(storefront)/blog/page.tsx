import type { Metadata } from "next";
import { listBlogPosts } from "@/features/blog/queries";
import { BlogPostCard } from "@/features/blog/components/blog-post-card";
import { Pagination } from "@/components/shared/pagination";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Flower care tips, occasion guides, and decor ideas from Shrinathji Florist — Vadodara's flower, cake & gifting shop.",
};

const PAGE_SIZE = 9;

export default async function BlogPage({ searchParams }: PageProps<"/blog">) {
  const { page: pageParam } = await searchParams;
  const page = Number(pageParam) > 0 ? Number(pageParam) : 1;

  const { posts, total, pageSize } = await listBlogPosts({ page, pageSize: PAGE_SIZE });

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 md:px-6 lg:px-8">
      <div className="mb-12 text-center">
        <p className="text-brand text-xs font-semibold tracking-[0.2em] uppercase">Our Blog</p>
        <h1 className="mt-3 text-3xl md:text-5xl">Flower Care, Guides & Ideas</h1>
        <p className="text-muted-foreground mx-auto mt-4 max-w-xl text-sm md:text-base">
          Tips for keeping flowers fresh, occasion guides, and decor inspiration from our team.
        </p>
      </div>

      {posts.length === 0 ? (
        <p className="text-muted-foreground py-16 text-center">No posts yet — check back soon.</p>
      ) : (
        <div className="grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <BlogPostCard key={post.id} post={post} />
          ))}
        </div>
      )}

      <Pagination basePath="/blog" page={page} pageSize={pageSize} total={total} />
    </div>
  );
}
