"use client";

import Link from "next/link";
import type { NavItem } from "@/config/navigation";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";

/** Desktop dropdown navigation. Hidden below `lg`; MobileNav covers small screens. */
export function MainNav({ items }: { items: NavItem[] }) {
  return (
    <NavigationMenu className="hidden lg:flex">
      <NavigationMenuList>
        {items.map((item) =>
          item.children ? (
            <NavigationMenuItem key={item.label}>
              <NavigationMenuTrigger>{item.label}</NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid w-48 gap-1">
                  {item.children.map((child) => (
                    <li key={child.href}>
                      <NavigationMenuLink render={<Link href={child.href} />}>
                        {child.label}
                      </NavigationMenuLink>
                    </li>
                  ))}
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
          ) : (
            <NavigationMenuItem key={item.label}>
              <Link href={item.href} className={cn(navigationMenuTriggerStyle())}>
                {item.label}
              </Link>
            </NavigationMenuItem>
          ),
        )}
      </NavigationMenuList>
    </NavigationMenu>
  );
}
