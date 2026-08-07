"use client";

import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface SearchInputProps {
  basePath: string;
  search?: string;
  placeholder?: string;
  /** Other query params to preserve across the search submit — same idea as Pagination's extraParams. */
  extraParams?: Record<string, string | undefined>;
}

/**
 * Native form submit (no client state, no debounce) — a plain GET on
 * submit is enough for admin list search, consistent with the rest of the
 * app's URL-driven list state. Generic across admin list pages (products,
 * reviews, categories, ...) — see order-search-input.tsx for the one
 * order-specific predecessor this was split out from.
 */
export function SearchInput({ basePath, search, placeholder, extraParams }: SearchInputProps) {
  const router = useRouter();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const value = String(formData.get("search") ?? "").trim();

    const params = new URLSearchParams();
    for (const [key, val] of Object.entries(extraParams ?? {})) {
      if (val) params.set(key, val);
    }
    if (value) params.set("search", value);

    router.push(params.toString() ? `${basePath}?${params}` : basePath);
  }

  return (
    <form onSubmit={handleSubmit} className="relative w-full sm:w-64">
      <Search
        className="text-muted-foreground absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2"
        aria-hidden="true"
      />
      <Input
        type="search"
        name="search"
        defaultValue={search}
        placeholder={placeholder ?? "Search…"}
        className="pl-8"
        aria-label="Search"
      />
    </form>
  );
}
