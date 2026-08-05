import Link from "next/link";
import { cn } from "@/lib/utils";

interface PaginationProps {
  basePath: string;
  page: number;
  pageSize: number;
  total: number;
  /** Other query params to preserve across page links (e.g. sort). */
  extraParams?: Record<string, string | undefined>;
}

/** Pure Link-based pager — no client state needed, URL is the source of truth. */
export function Pagination({ basePath, page, pageSize, total, extraParams }: PaginationProps) {
  const totalPages = Math.ceil(total / pageSize);
  if (totalPages <= 1) return null;

  function hrefFor(targetPage: number) {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(extraParams ?? {})) {
      if (value) params.set(key, value);
    }
    if (targetPage > 1) params.set("page", String(targetPage));
    const qs = params.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  }

  return (
    <nav aria-label="Pagination" className="mt-10 flex items-center justify-center gap-2">
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
        <Link
          key={p}
          href={hrefFor(p)}
          aria-current={p === page ? "page" : undefined}
          className={cn(
            "flex size-9 items-center justify-center rounded-full border text-sm",
            p === page ? "bg-foreground text-background border-foreground" : "hover:bg-muted",
          )}
        >
          {p}
        </Link>
      ))}
    </nav>
  );
}
