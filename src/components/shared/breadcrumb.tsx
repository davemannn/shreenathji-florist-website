import Link from "next/link";
import { ChevronRight } from "lucide-react";

export interface BreadcrumbEntry {
  label: string;
  /** Omit on the last entry — renders as plain (non-link) current-page text. */
  href?: string;
}

/** Reusable breadcrumb trail — same visual pattern already used ad hoc on the product detail page, generalized so /shop and /shop/[category] can use it too. */
export function Breadcrumb({ items }: { items: BreadcrumbEntry[] }) {
  return (
    <nav
      aria-label="Breadcrumb"
      className="text-muted-foreground mb-6 flex items-center gap-1.5 text-xs"
    >
      {items.map((item, index) => (
        <span key={item.label} className="flex items-center gap-1.5">
          {index > 0 ? <ChevronRight className="size-3" aria-hidden="true" /> : null}
          {item.href ? (
            <Link href={item.href} className="hover:text-foreground">
              {item.label}
            </Link>
          ) : (
            <span className="text-foreground">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
