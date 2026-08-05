import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { CategoryWithMeta } from "../queries";

export function CategoryHeader({ category }: { category: CategoryWithMeta }) {
  return (
    <div className="flex flex-col gap-2">
      <nav
        aria-label="Breadcrumb"
        className="text-muted-foreground flex items-center gap-1.5 text-xs"
      >
        <Link href="/" className="hover:text-foreground">
          Home
        </Link>
        <ChevronRight className="size-3" aria-hidden="true" />
        <Link href="/shop" className="hover:text-foreground">
          Shop
        </Link>
        <ChevronRight className="size-3" aria-hidden="true" />
        <span className="text-foreground">{category.name}</span>
      </nav>
      <h1 className="text-3xl md:text-4xl">{category.name}</h1>
      {category.description ? (
        <p className="text-muted-foreground max-w-2xl text-sm">{category.description}</p>
      ) : null}
    </div>
  );
}
