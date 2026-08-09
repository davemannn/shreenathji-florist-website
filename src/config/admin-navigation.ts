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
  Image,
  Gift,
  Users,
  UserCog,
  Settings,
  FileBarChart,
  History,
  ShoppingCart,
  Send,
  MessageSquare,
  GalleryHorizontal,
  Quote,
  HelpCircle,
  Repeat,
  BellRing,
} from "lucide-react";
import type { Capability } from "@/server/auth/permissions";

export interface AdminNavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  /** undefined = visible to any signed-in staff role. */
  capability?: Capability;
}

/**
 * Applies one admin's personal drag-reorder preference (User.adminNavOrder
 * — see features/dashboard/actions.ts) on top of a capability-filtered
 * item list. Items named in `order` come first, in that sequence; anything
 * not in `order` (never customized yet, or added to adminNav since the
 * preference was last saved) keeps its normal config position, appended
 * after. `order` itself is never trusted beyond "which hrefs go first" —
 * an unknown/stale href in it is simply ignored.
 */
export function sortByPersonalOrder(items: AdminNavItem[], order?: string[]): AdminNavItem[] {
  if (!order || order.length === 0) return items;
  const rank = new Map(order.map((href, index) => [href, index]));
  return [...items].sort((a, b) => {
    const rankA = rank.get(a.href);
    const rankB = rank.get(b.href);
    if (rankA != null && rankB != null) return rankA - rankB;
    if (rankA != null) return -1;
    if (rankB != null) return 1;
    return 0; // neither customized — keep their relative config order (stable sort)
  });
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
  { label: "Banners", href: "/admin/banners", icon: Image, capability: "banners:manage" },
  {
    label: "Gallery",
    href: "/admin/gallery",
    icon: GalleryHorizontal,
    capability: "gallery:manage",
  },
  {
    label: "Testimonials",
    href: "/admin/testimonials",
    icon: Quote,
    capability: "testimonials:manage",
  },
  { label: "FAQs", href: "/admin/faqs", icon: HelpCircle, capability: "faq:manage" },
  {
    label: "Subscriptions",
    href: "/admin/subscriptions",
    icon: Repeat,
    capability: "subscriptions:manage",
  },
  { label: "Gift Cards", href: "/admin/gift-cards", icon: Gift, capability: "gift_cards:view" },
  { label: "Customers", href: "/admin/customers", icon: Users, capability: "customers:view" },
  {
    label: "Reminders",
    href: "/admin/reminders",
    icon: BellRing,
    capability: "customers:view",
  },
  {
    label: "Contact Messages",
    href: "/admin/contact-messages",
    icon: MessageSquare,
    capability: "customers:view",
  },
  {
    label: "Abandoned Carts",
    href: "/admin/abandoned-carts",
    icon: ShoppingCart,
    capability: "customers:view",
  },
  {
    label: "Marketing Email",
    href: "/admin/marketing-email",
    icon: Send,
    capability: "marketing:send",
  },
  { label: "Reports", href: "/admin/reports", icon: FileBarChart, capability: "reports:view" },
  { label: "Audit Log", href: "/admin/audit-log", icon: History, capability: "reports:view" },
  { label: "Team", href: "/admin/team", icon: UserCog, capability: "team:manage:junior" },
  // Delivery Slots sits immediately before Settings — both configure
  // delivery pricing (per-slot surcharges vs. base charge/threshold/cutoff)
  // and are meant to be found together, not scattered across the sidebar.
  {
    label: "Delivery Slots",
    href: "/admin/delivery-slots",
    icon: Truck,
    capability: "delivery_slots:manage",
  },
  { label: "Settings", href: "/admin/settings", icon: Settings, capability: "settings:view" },
];
