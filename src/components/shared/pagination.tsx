"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface PaginationProps {
  basePath: string;
  page: number;
  pageSize: number;
  total: number;
  /** Other query params to preserve across page/page-size links (e.g. search, sort, status). */
  extraParams?: Record<string, string | undefined>;
  /** Enables a "Rows per page" selector when provided — omit to keep the old fixed-pageSize behavior every existing call site relies on. */
  pageSizeOptions?: number[];
}

/**
 * URL-driven pager (no client state beyond the rows-per-page select's own
 * navigation) — same "URL is the source of truth" pattern as SearchInput.
 * First/Prev/Next/Last plus a "Page X of Y (N total)" readout, rather than
 * a row of individual page-number links, so this stays usable at any page
 * count without needing ellipsis logic.
 */
export function Pagination({
  basePath,
  page,
  pageSize,
  total,
  extraParams,
  pageSizeOptions,
}: PaginationProps) {
  const router = useRouter();
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  // Nothing to control at all — no pages to page through, and no rows-per-page choice to offer.
  if (totalPages <= 1 && !pageSizeOptions) return null;

  function hrefFor(targetPage: number, size: number) {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(extraParams ?? {})) {
      if (value) params.set(key, value);
    }
    if (targetPage > 1) params.set("page", String(targetPage));
    if (pageSizeOptions && size !== pageSizeOptions[0]) params.set("pageSize", String(size));
    const qs = params.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  }

  function navButton(
    label: string,
    Icon: typeof ChevronLeft,
    targetPage: number,
    disabled: boolean,
  ) {
    const className = cn(
      "flex size-8 items-center justify-center rounded-md border text-sm",
      disabled
        ? "text-muted-foreground/40 border-border cursor-not-allowed"
        : "hover:bg-muted border-border",
    );
    if (disabled) {
      return (
        <button type="button" disabled aria-label={label} className={className}>
          <Icon className="size-4" aria-hidden="true" />
        </button>
      );
    }
    return (
      <Link href={hrefFor(targetPage, pageSize)} aria-label={label} className={className}>
        <Icon className="size-4" aria-hidden="true" />
      </Link>
    );
  }

  return (
    <nav aria-label="Pagination" className="mt-6 flex flex-wrap items-center justify-between gap-4">
      <div className="text-muted-foreground text-sm">
        Page {page} of {totalPages}{" "}
        <span className="text-muted-foreground/70">({total} total)</span>
      </div>

      <div className="flex items-center gap-4">
        {pageSizeOptions ? (
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground text-sm">Rows per page</span>
            <Select
              value={String(pageSize)}
              onValueChange={(value) => router.push(hrefFor(1, Number(value)))}
            >
              <SelectTrigger className="w-18">
                <SelectValue>{(value: string) => value}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {pageSizeOptions.map((size) => (
                  <SelectItem key={size} value={String(size)}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ) : null}

        <div className="flex items-center gap-1">
          {navButton("First page", ChevronsLeft, 1, page <= 1)}
          {navButton("Previous page", ChevronLeft, page - 1, page <= 1)}
          {navButton("Next page", ChevronRight, page + 1, page >= totalPages)}
          {navButton("Last page", ChevronsRight, totalPages, page >= totalPages)}
        </div>
      </div>
    </nav>
  );
}
