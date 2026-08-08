"use server";

import { revalidatePath } from "next/cache";
import { requireAdminCapability } from "@/server/auth/require-admin";
import { logAudit } from "@/server/audit/log";
import {
  createBlogPost as createBlogPostRepo,
  deleteBlogPost as deleteBlogPostRepo,
  findBlogPostByIdAdmin,
  setBlogPostPublished,
  updateBlogPost as updateBlogPostRepo,
} from "@/server/repositories/blog-post.repository";
import { blogPostFormSchema, type BlogPostFormValues } from "./validations";

export async function createBlogPostAction(input: BlogPostFormValues) {
  const session = await requireAdminCapability("blog:manage");
  const values = blogPostFormSchema.parse(input);
  const post = await createBlogPostRepo(values);

  await logAudit(session, {
    entityType: "BlogPost",
    entityId: post.id,
    entityLabel: values.title,
    action: "created",
    summary: values.isPublished ? "Created and published" : "Created as draft",
  });

  revalidatePath("/admin/blog");
  revalidatePath("/blog");
  return { id: post.id };
}

export async function updateBlogPostAction(id: string, input: BlogPostFormValues) {
  const session = await requireAdminCapability("blog:manage");
  const values = blogPostFormSchema.parse(input);

  const before = await findBlogPostByIdAdmin(id);
  await updateBlogPostRepo(id, values);

  if (before) {
    const changes: string[] = [];
    if (before.title !== values.title) changes.push(`Title "${before.title}" → "${values.title}"`);
    if (before.isPublished !== values.isPublished) {
      changes.push(values.isPublished ? "Published" : "Unpublished");
    }
    await logAudit(session, {
      entityType: "BlogPost",
      entityId: id,
      entityLabel: values.title,
      action: "updated",
      summary: changes.length > 0 ? changes.join("; ") : "Updated post details",
    });
  }

  revalidatePath("/admin/blog");
  revalidatePath(`/admin/blog/${id}`);
  revalidatePath("/blog");
  revalidatePath(`/blog/${values.slug}`);
}

export async function setBlogPostPublishedAction(id: string, isPublished: boolean) {
  const session = await requireAdminCapability("blog:manage");
  const post = await setBlogPostPublished(id, isPublished);

  await logAudit(session, {
    entityType: "BlogPost",
    entityId: id,
    entityLabel: post.title,
    action: isPublished ? "restored" : "archived",
    summary: isPublished ? "Published" : "Unpublished",
  });

  revalidatePath("/admin/blog");
  revalidatePath("/blog");
}

export async function deleteBlogPostAction(id: string) {
  const session = await requireAdminCapability("blog:manage");
  const post = await findBlogPostByIdAdmin(id);
  await deleteBlogPostRepo(id);

  if (post) {
    await logAudit(session, {
      entityType: "BlogPost",
      entityId: id,
      entityLabel: post.title,
      action: "deleted",
      summary: "Permanently deleted",
    });
  }

  revalidatePath("/admin/blog");
  revalidatePath("/blog");
}
