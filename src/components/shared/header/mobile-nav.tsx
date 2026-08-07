"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu } from "lucide-react";
import { utilityNav, type NavItem } from "@/config/navigation";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

/** Drawer nav for < lg screens. Simplified vs. the reference's hover mega-menu — flyouts don't translate to touch. */
export function MobileNav({ items }: { items: NavItem[] }) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={<Button variant="ghost" size="icon" aria-label="Open menu" className="lg:hidden" />}
      >
        <Menu aria-hidden="true" />
      </SheetTrigger>
      <SheetContent side="left" className="w-full overflow-y-auto sm:max-w-xs">
        <SheetHeader>
          <SheetTitle>Menu</SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col gap-1 px-4 pb-6">
          <Accordion className="flex flex-col gap-0">
            {items.map((item) =>
              item.children ? (
                <AccordionItem key={item.label} value={item.label}>
                  <AccordionTrigger>{item.label}</AccordionTrigger>
                  <AccordionContent>
                    <ul className="flex flex-col gap-2 pl-3">
                      {item.children.map((child) => (
                        <li key={child.href}>
                          <Link
                            href={child.href}
                            onClick={() => setOpen(false)}
                            className="text-muted-foreground hover:text-foreground block py-1 text-sm"
                          >
                            {child.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              ) : (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="border-transparent py-2.5 text-sm font-medium not-last:border-b"
                >
                  {item.label}
                </Link>
              ),
            )}
          </Accordion>
          <div className="mt-4 flex flex-col gap-2 border-t pt-4">
            {utilityNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="text-muted-foreground hover:text-foreground text-sm"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </nav>
      </SheetContent>
    </Sheet>
  );
}
