import Link from "next/link";
import { cn } from "@/lib/utils";
import type { Category } from "../types";

interface CategorySidebarProps {
  categories: Category[];
  activeSlug?: string;
}

/**
 * Pure navigation (Links only, no client state) — category selection is
 * just changing the URL, so this stays a Server Component.
 */
export function CategorySidebar({ categories, activeSlug }: CategorySidebarProps) {
  return (
    <nav aria-label="Shop by category" className="flex flex-col gap-1">
      <h2 className="mb-2 text-sm font-semibold tracking-wide uppercase">Categories</h2>
      <Link
        href="/shop"
        className={cn(
          "rounded-xs px-3 py-2 text-sm",
          !activeSlug ? "bg-brand/10 text-brand font-medium" : "hover:bg-muted",
        )}
      >
        All Products
      </Link>
      {categories.map((category) => (
        <Link
          key={category.id}
          href={`/shop/${category.slug}`}
          className={cn(
            "rounded-xs px-3 py-2 text-sm",
            activeSlug === category.slug ? "bg-brand/10 text-brand font-medium" : "hover:bg-muted",
          )}
        >
          {category.name}
        </Link>
      ))}
    </nav>
  );
}
