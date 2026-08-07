"use client";

import { useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Pencil, Trash2 } from "lucide-react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ContentImage } from "@/components/shared/content-image";
import { deleteBlogPostAction } from "../actions";
import type { AdminBlogPost } from "../types";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function BlogPostsTable({ posts }: { posts: AdminBlogPost[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleDelete(post: AdminBlogPost) {
    if (!window.confirm(`Delete "${post.title}"? This can't be undone.`)) return;
    startTransition(async () => {
      try {
        await deleteBlogPostAction(post.id);
        toast.success("Post deleted.");
        router.refresh();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Couldn't delete this post.");
      }
    });
  }

  if (posts.length === 0) {
    return <p className="text-muted-foreground py-16 text-center text-sm">No posts yet.</p>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Post</TableHead>
          <TableHead>Author</TableHead>
          <TableHead>Published</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {posts.map((post) => (
          <TableRow key={post.id}>
            <TableCell>
              <div className="flex items-center gap-3">
                <ContentImage
                  src={post.coverImageUrl}
                  alt={post.coverImageAlt ?? post.title}
                  className="size-10 shrink-0 rounded-md"
                  sizes="40px"
                />
                <Link
                  href={`/admin/blog/${post.id}`}
                  className="text-brand font-medium hover:underline"
                >
                  {post.title}
                </Link>
              </div>
            </TableCell>
            <TableCell className="text-muted-foreground text-xs">{post.authorName}</TableCell>
            <TableCell className="text-muted-foreground text-xs">
              {formatDate(post.publishedAt)}
            </TableCell>
            <TableCell>
              <Badge variant={post.isPublished ? "secondary" : "outline"}>
                {post.isPublished ? "Published" : "Draft"}
              </Badge>
            </TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  nativeButton={false}
                  render={<Link href={`/admin/blog/${post.id}`} />}
                >
                  <Pencil className="size-3.5" aria-hidden="true" />
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  disabled={isPending}
                  onClick={() => handleDelete(post)}
                >
                  <Trash2 className="size-3.5" aria-hidden="true" />
                  Delete
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
