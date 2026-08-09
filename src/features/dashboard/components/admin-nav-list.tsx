"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { adminNav, sortByPersonalOrder } from "@/config/admin-navigation";
import { can, type AdminRole } from "@/server/auth/permissions";
import { cn } from "@/lib/utils";

/** Shared between the desktop sidebar and the mobile sheet — one filtered list, two containers. */
export function AdminNavList({
  role,
  order,
  onNavigate,
}: {
  role: AdminRole;
  order?: string[];
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const visible = adminNav.filter((item) => !item.capability || can(role, item.capability));
  const items = sortByPersonalOrder(visible, order);

  return (
    <nav className="flex flex-col gap-0.5">
      {items.map((item) => {
        const active =
          item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-brand/10 text-brand"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <Icon className="size-4 shrink-0" aria-hidden="true" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
