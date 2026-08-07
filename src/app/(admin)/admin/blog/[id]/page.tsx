import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireAdminSession } from "@/server/auth/require-admin";
import { getBlogPostForEdit } from "@/features/blog/queries";
import { BlogPostForm } from "@/features/blog/components/blog-post-form";

export const metadata: Metadata = {
  title: "Edit Post",
};

export default async function EditBlogPostPage({ params }: PageProps<"/admin/blog/[id]">) {
  const { id } = await params;
  await requireAdminSession("blog:manage");

  const post = await getBlogPostForEdit(id);
  if (!post) notFound();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Edit Post</h1>
      <BlogPostForm post={post} />
    </div>
  );
}
