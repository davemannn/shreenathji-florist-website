"use client";

import { useState, type ReactNode } from "react";
import { SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

/**
 * Below `lg`, CategorySidebar + PriceFilter used to just stack above the
 * product grid (the grid's `lg:grid-cols-[220px_1fr]` collapses to one
 * column, not a responsive sidebar-to-drawer swap) — pushing every product
 * below the fold on mobile. This wraps the same filter content in a Sheet
 * instead, same pattern as the header's MobileNav.
 */
export function MobileFilterDrawer({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger render={<Button variant="outline" size="sm" className="lg:hidden" />}>
        <SlidersHorizontal className="size-3.5" aria-hidden="true" />
        Filters
      </SheetTrigger>
      <SheetContent side="left" className="w-full overflow-y-auto sm:max-w-xs">
        <SheetHeader>
          <SheetTitle>Filters</SheetTitle>
        </SheetHeader>
        <div className="flex flex-col gap-6 px-4 pb-6" onClick={() => setOpen(false)}>
          {children}
        </div>
      </SheetContent>
    </Sheet>
  );
}
