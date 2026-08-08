"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Package, Search, ShoppingBag, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import type { GlobalSearchResult } from "../types";

const TYPE_ICON = { order: ShoppingBag, customer: User, product: Package } as const;
const TYPE_LABEL = { order: "Orders", customer: "Customers", product: "Products" } as const;

export function GlobalSearch() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<GlobalSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // Cmd/Ctrl+K opens it from anywhere in the admin panel.
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key === "k") {
        event.preventDefault();
        setOpen(true);
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Short queries just render nothing (see `activeResults` below) rather
  // than clearing `results` here — setting state synchronously inside an
  // effect body triggers a cascading extra render React's compiler flags.
  useEffect(() => {
    if (!open || query.trim().length < 2) return;
    clearTimeout(debounceRef.current);
    // All state updates (including the loading flag) happen inside this
    // deferred callback, not synchronously in the effect body itself —
    // same shape as use-order-notifications.ts's poll().
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/admin/global-search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        setResults(data.results ?? []);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 250);
    return () => clearTimeout(debounceRef.current);
  }, [query, open]);

  const activeResults = query.trim().length >= 2 ? results : [];

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (!nextOpen) {
      setQuery("");
      setResults([]);
    }
  }

  function handleSelect(result: GlobalSearchResult) {
    handleOpenChange(false);
    router.push(result.href);
  }

  const grouped = (["order", "customer", "product"] as const)
    .map((type) => ({ type, items: activeResults.filter((r) => r.type === type) }))
    .filter((group) => group.items.length > 0);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <Button
        variant="outline"
        size="sm"
        className="text-muted-foreground w-48 justify-start gap-2"
        onClick={() => setOpen(true)}
      >
        <Search className="size-3.5" aria-hidden="true" />
        Search…
        <kbd className="border-border bg-muted ml-auto rounded border px-1 text-[10px]">⌘K</kbd>
      </Button>
      <DialogContent className="top-24 -translate-y-0 sm:max-w-lg">
        <DialogTitle className="sr-only">Global Search</DialogTitle>
        <Input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search orders, customers, or products…"
        />
        <div className="max-h-80 overflow-y-auto">
          {loading ? (
            <p className="text-muted-foreground py-6 text-center text-sm">Searching…</p>
          ) : query.trim().length < 2 ? (
            <p className="text-muted-foreground py-6 text-center text-sm">
              Type at least 2 characters to search.
            </p>
          ) : grouped.length === 0 ? (
            <p className="text-muted-foreground py-6 text-center text-sm">No matches.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {grouped.map((group) => {
                const Icon = TYPE_ICON[group.type];
                return (
                  <div key={group.type}>
                    <p className="text-muted-foreground mb-1 text-xs font-semibold uppercase">
                      {TYPE_LABEL[group.type]}
                    </p>
                    <div className="flex flex-col gap-0.5">
                      {group.items.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => handleSelect(item)}
                          className="hover:bg-muted flex items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm"
                        >
                          <Icon
                            className="text-muted-foreground size-3.5 shrink-0"
                            aria-hidden="true"
                          />
                          <span className="truncate font-medium">{item.title}</span>
                          <span className="text-muted-foreground truncate text-xs">
                            {item.subtitle}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
