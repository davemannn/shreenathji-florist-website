"use server";

import { revalidatePath } from "next/cache";
import { requireAdminCapability } from "@/server/auth/require-admin";
import {
  createBlogPost as createBlogPostRepo,
  deleteBlogPost as deleteBlogPostRepo,
  updateBlogPost as updateBlogPostRepo,
} from "@/server/repositories/blog-post.repository";
import { blogPostFormSchema, type BlogPostFormValues } from "./validations";

export async function createBlogPostAction(input: BlogPostFormValues) {
  await requireAdminCapability("blog:manage");
  const values = blogPostFormSchema.parse(input);
  const post = await createBlogPostRepo(values);
  revalidatePath("/admin/blog");
  revalidatePath("/blog");
  return { id: post.id };
}

export async function updateBlogPostAction(id: string, input: BlogPostFormValues) {
  await requireAdminCapability("blog:manage");
  const values = blogPostFormSchema.parse(input);
  await updateBlogPostRepo(id, values);
  revalidatePath("/admin/blog");
  revalidatePath(`/admin/blog/${id}`);
  revalidatePath("/blog");
  revalidatePath(`/blog/${values.slug}`);
}

export async function deleteBlogPostAction(id: string) {
  await requireAdminCapability("blog:manage");
  await deleteBlogPostRepo(id);
  revalidatePath("/admin/blog");
  revalidatePath("/blog");
}
