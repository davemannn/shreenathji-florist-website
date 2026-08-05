import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getBlogPostBySlug, getRecentBlogPosts } from "@/features/blog/queries";
import { ContentImage } from "@/components/shared/content-image";
import { PostContent } from "@/features/blog/components/post-content";
import { BlogPostCard } from "@/features/blog/components/blog-post-card";

export async function generateMetadata({ params }: PageProps<"/blog/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);
  if (!post) return {};
  return { title: post.title, description: post.excerpt };
}

function formatPublishedDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default async function BlogPostPage({ params }: PageProps<"/blog/[slug]">) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);
  if (!post) notFound();

  const recentPosts = await getRecentBlogPosts(post.slug, 3);

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 md:px-6 lg:px-8">
      <Link
        href="/blog"
        className="text-muted-foreground inline-flex items-center gap-1.5 text-sm hover:underline"
      >
        <ArrowLeft className="size-3.5" aria-hidden="true" />
        Back to Blog
      </Link>

      <h1 className="mt-6 text-3xl md:text-4xl">{post.title}</h1>
      <p className="text-muted-foreground mt-2 text-sm">
        By {post.authorName} · {formatPublishedDate(post.publishedAt)} · {post.readTimeMinutes} min
        read
      </p>

      <ContentImage
        src={post.coverImageUrl}
        alt={post.coverImageAlt}
        className="mt-8 aspect-video rounded-md"
        sizes="(min-width: 768px) 768px, 100vw"
        priority
      />

      <div className="mt-8">
        <PostContent content={post.content} />
      </div>

      {recentPosts.length > 0 ? (
        <div className="mt-16 border-t pt-10">
          <h2 className="mb-6 text-lg font-semibold">More From The Blog</h2>
          <div className="grid gap-x-8 gap-y-10 sm:grid-cols-3">
            {recentPosts.map((recent) => (
              <BlogPostCard key={recent.id} post={recent} />
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
