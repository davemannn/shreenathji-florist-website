import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { requireAdminSession } from "@/server/auth/require-admin";
import { listBlogPostsAdmin } from "@/features/blog/queries";
import { BlogPostsTable } from "@/features/blog/components/blog-posts-table";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Blog",
};

export default async function AdminBlogPage() {
  await requireAdminSession("blog:manage");
  const posts = await listBlogPostsAdmin();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Blog</h1>
          <p className="text-muted-foreground text-sm">{posts.length} posts</p>
        </div>
        <Button variant="brand" nativeButton={false} render={<Link href="/admin/blog/new" />}>
          <Plus className="size-4" aria-hidden="true" />
          New Post
        </Button>
      </div>

      <BlogPostsTable posts={posts} />
    </div>
  );
}
