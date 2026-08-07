"use client";

import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import type { OrderStatus } from "../types";

/**
 * Native form submit (no client state, no debounce) — searching by order
 * number/recipient name/phone isn't a "search as you type" experience, a
 * plain GET on submit is enough and stays consistent with the rest of the
 * app's URL-driven list state.
 */
export function OrderSearchInput({ status, search }: { status?: OrderStatus; search?: string }) {
  const router = useRouter();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const value = String(formData.get("search") ?? "").trim();

    const params = new URLSearchParams();
    if (status) params.set("status", status);
    if (value) params.set("search", value);

    router.push(params.toString() ? `/admin/orders?${params}` : "/admin/orders");
  }

  return (
    <form onSubmit={handleSubmit} className="relative w-full sm:w-64">
      <Search
        className="text-muted-foreground absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2"
        aria-hidden="true"
      />
      <Input
        // See search-input.tsx for why this is keyed — same uncontrolled
        // Base UI Input remount-on-value-change fix.
        key={search ?? ""}
        type="search"
        name="search"
        defaultValue={search}
        placeholder="Order #, recipient, phone…"
        className="pl-8"
        aria-label="Search orders"
      />
    </form>
  );
}
