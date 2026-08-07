import Link from "next/link";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { TableHead } from "@/components/ui/table";
import { cn } from "@/lib/utils";

interface SortableHeaderProps {
  basePath: string;
  label: string;
  sortKey: string;
  currentSort?: string;
  currentDir?: "asc" | "desc";
  /** Other query params to preserve across the sort link (e.g. search) — same idea as Pagination's extraParams. */
  extraParams?: Record<string, string | undefined>;
  className?: string;
}

/**
 * Pure Link-based sortable column header — no client state, URL is the
 * source of truth (matches Pagination/SearchInput's pattern). Clicking an
 * inactive column sorts it ascending; clicking the active column flips
 * direction. Sorting always resets to page 1 (page isn't in extraParams).
 */
export function SortableHeader({
  basePath,
  label,
  sortKey,
  currentSort,
  currentDir = "asc",
  extraParams,
  className,
}: SortableHeaderProps) {
  const isActive = currentSort === sortKey;
  const nextDir = isActive && currentDir === "asc" ? "desc" : "asc";

  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(extraParams ?? {})) {
    if (value) params.set(key, value);
  }
  params.set("sort", sortKey);
  params.set("dir", nextDir);

  const Icon = !isActive ? ArrowUpDown : currentDir === "asc" ? ArrowUp : ArrowDown;

  return (
    <TableHead className={className}>
      <Link
        href={`${basePath}?${params}`}
        className={cn(
          "hover:text-foreground inline-flex items-center gap-1",
          isActive && "text-foreground",
        )}
      >
        {label}
        <Icon className="size-3" aria-hidden="true" />
      </Link>
    </TableHead>
  );
}
