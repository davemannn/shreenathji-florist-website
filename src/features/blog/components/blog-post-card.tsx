import Link from "next/link";
import { ContentImage } from "@/components/shared/content-image";
import type { BlogPostSummary } from "../types";

function formatPublishedDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function BlogPostCard({ post }: { post: BlogPostSummary }) {
  return (
    <Link href={`/blog/${post.slug}`} className="group flex flex-col gap-3">
      <ContentImage
        src={post.coverImageUrl}
        alt={post.coverImageAlt}
        className="aspect-4/3 rounded-md"
        sizes="(min-width: 1024px) 33vw, 100vw"
      />
      <div className="flex flex-col gap-1.5">
        <p className="text-muted-foreground text-xs">
          {formatPublishedDate(post.publishedAt)} · {post.readTimeMinutes} min read
        </p>
        <h3 className="font-medium group-hover:underline">{post.title}</h3>
        <p className="text-muted-foreground line-clamp-2 text-sm">{post.excerpt}</p>
      </div>
    </Link>
  );
}
