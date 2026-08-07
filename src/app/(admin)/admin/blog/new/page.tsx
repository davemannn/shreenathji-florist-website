import type { Metadata } from "next";
import { requireAdminSession } from "@/server/auth/require-admin";
import { BlogPostForm } from "@/features/blog/components/blog-post-form";

export const metadata: Metadata = {
  title: "New Post",
};

export default async function NewBlogPostPage() {
  await requireAdminSession("blog:manage");

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">New Post</h1>
      <BlogPostForm />
    </div>
  );
}
