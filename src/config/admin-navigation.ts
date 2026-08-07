import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  ShoppingBag,
  Truck,
  Package,
  Tags,
  Star,
  Ticket,
  Newspaper,
  Gift,
  Users,
  UserCog,
  Settings,
} from "lucide-react";
import type { Capability } from "@/server/auth/permissions";

export interface AdminNavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  /** undefined = visible to any signed-in staff role. */
  capability?: Capability;
}

/** Single source of truth for admin nav — filtered per-role by `can()` in the shell, not hardcoded per role here. */
export const adminNav: AdminNavItem[] = [
  {
    label: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
    capability: "analytics:view:operational",
  },
  {
    label: "My Deliveries",
    href: "/admin/my-deliveries",
    icon: Truck,
    capability: "orders:view:assigned",
  },
  { label: "Orders", href: "/admin/orders", icon: ShoppingBag, capability: "orders:view:all" },
  { label: "Products", href: "/admin/products", icon: Package, capability: "products:manage" },
  { label: "Categories", href: "/admin/categories", icon: Tags, capability: "categories:manage" },
  { label: "Reviews", href: "/admin/reviews", icon: Star, capability: "reviews:moderate" },
  { label: "Coupons", href: "/admin/coupons", icon: Ticket, capability: "coupons:manage" },
  { label: "Blog", href: "/admin/blog", icon: Newspaper, capability: "blog:manage" },
  { label: "Gift Cards", href: "/admin/gift-cards", icon: Gift, capability: "gift_cards:view" },
  {
    label: "Delivery Slots",
    href: "/admin/delivery-slots",
    icon: Truck,
    capability: "delivery_slots:manage",
  },
  { label: "Customers", href: "/admin/customers", icon: Users, capability: "customers:view" },
  { label: "Team", href: "/admin/team", icon: UserCog, capability: "team:manage:junior" },
  { label: "Settings", href: "/admin/settings", icon: Settings, capability: "settings:view" },
];
