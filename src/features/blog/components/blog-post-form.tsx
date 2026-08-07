"use client";

import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from "@/components/ui/form";
import { CloudinaryUploader } from "@/components/shared/cloudinary-uploader";
import { createBlogPostAction, updateBlogPostAction } from "../actions";
import {
  blogPostFormSchema,
  type BlogPostFormInput,
  type BlogPostFormValues,
} from "../validations";
import type { AdminBlogPost } from "../types";

export function BlogPostForm({ post }: { post?: AdminBlogPost }) {
  const router = useRouter();
  const isEdit = !!post;

  const form = useForm<BlogPostFormInput, unknown, BlogPostFormValues>({
    resolver: zodResolver(blogPostFormSchema),
    defaultValues: {
      slug: post?.slug ?? "",
      title: post?.title ?? "",
      excerpt: post?.excerpt ?? "",
      content: post?.content ?? "",
      coverImageUrl: post?.coverImageUrl ?? "",
      coverImageAlt: post?.coverImageAlt ?? "",
      coverImageCloudinaryId: post?.coverImageCloudinaryId ?? "",
      authorName: post?.authorName ?? "",
      readTimeMinutes: post?.readTimeMinutes ?? 4,
      isPublished: post?.isPublished ?? true,
    },
  });
  const { setValue } = form;
  const coverImageUrl = useWatch({ control: form.control, name: "coverImageUrl" });

  async function onSubmit(values: BlogPostFormValues) {
    try {
      if (isEdit && post) {
        await updateBlogPostAction(post.id, values);
        toast.success("Post updated.");
      } else {
        await createBlogPostAction(values);
        toast.success("Post created.");
      }
      router.push("/admin/blog");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Couldn't save this post.");
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        noValidate
        className="flex max-w-2xl flex-col gap-4"
      >
        <div>
          <Label>Cover image</Label>
          <div className="mt-2">
            <CloudinaryUploader
              folder="blog"
              value={coverImageUrl}
              onChange={(url, cloudinaryId) => {
                setValue("coverImageUrl", url);
                setValue("coverImageCloudinaryId", cloudinaryId);
              }}
              onRemove={() => {
                setValue("coverImageUrl", "");
                setValue("coverImageCloudinaryId", "");
              }}
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="slug"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Slug</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="rose-care-guide" />
                </FormControl>
                <FormDescription>
                  The post&rsquo;s URL — /blog/{field.value || "rose-care-guide"}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="coverImageAlt"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cover image alt text (optional)</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Describe the cover image for screen readers" />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="excerpt"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Excerpt</FormLabel>
              <FormControl>
                <textarea
                  {...field}
                  rows={2}
                  className="border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 w-full rounded-lg border bg-transparent px-2.5 py-1.5 text-sm outline-none focus-visible:ring-3"
                />
              </FormControl>
              <FormDescription>The short teaser shown on the blog listing page.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Content</FormLabel>
              <FormControl>
                <textarea
                  {...field}
                  rows={12}
                  className="border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 w-full rounded-lg border bg-transparent px-2.5 py-1.5 text-sm outline-none focus-visible:ring-3"
                />
              </FormControl>
              <FormDescription>
                Separate paragraphs with a blank line. Wrap text in **double asterisks** for bold —
                that&rsquo;s the only formatting the post page understands, there&rsquo;s no full
                markdown or HTML support.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="authorName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Author</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="readTimeMinutes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Read time (minutes)</FormLabel>
                <FormControl>
                  <Input type="number" {...field} value={field.value as number} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="isPublished"
          render={({ field }) => (
            <div>
              <label className="flex items-center gap-2 text-sm">
                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                Published
              </label>
              <p className="text-muted-foreground pl-6 text-xs">
                Unpublished posts stay saved here but don&rsquo;t appear on the public blog.
              </p>
            </div>
          )}
        />

        <Button
          type="submit"
          variant="brand"
          size="lg"
          disabled={form.formState.isSubmitting}
          className="w-fit"
        >
          {form.formState.isSubmitting ? "Saving…" : isEdit ? "Save Changes" : "Create Post"}
        </Button>
      </form>
    </Form>
  );
}
