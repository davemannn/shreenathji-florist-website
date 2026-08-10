// Single source of truth for site navigation, consumed by both the desktop
// (NavigationMenu) and mobile (Sheet + Accordion) header nav so the two
// never drift out of sync.

export interface NavItem {
  label: string;
  href: string;
  children?: NavItem[];
}

export interface NavCategoryGroups {
  shop: NavItem[];
  occasions: NavItem[];
  /** "Gifts For" — a third independent axis (isRecipient) alongside Shop/Occasions: "For Her", "For Him", "For Parents", etc. */
  recipients: NavItem[];
}

/**
 * "Shop", "Occasions", and "Gifts For" all route to the same
 * /shop/[category] page — all three are just Category rows (isOccasion/
 * isRecipient flags distinguish them), not three parallel listing-page
 * trees. Their children are built from whatever the admin panel's category
 * list actually has (see getNavCategoryGroups in
 * features/category/queries.ts), so creating a category and ticking
 * "Occasion" or "Recipient" really does add it to the live nav. A group
 * with no rows yet renders as a plain link (no empty dropdown) —
 * NavigationMenuTrigger/AccordionTrigger both already handle `children:
 * undefined` this way.
 */
export function buildMainNav({ shop, occasions, recipients }: NavCategoryGroups): NavItem[] {
  return [
    { label: "Home", href: "/" },
    { label: "Shop", href: "/shop", children: shop.length > 0 ? shop : undefined },
    { label: "Occasions", href: "/shop", children: occasions.length > 0 ? occasions : undefined },
    { label: "Gifts For", href: "/shop", children: recipients.length > 0 ? recipients : undefined },
    { label: "Decoration Services", href: "/decoration-services" },
    { label: "Subscriptions", href: "/subscriptions" },
    { label: "Gallery", href: "/gallery" },
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
  ];
}

// Small top utility bar above the main header row — mirrors the Florial
// reference's "Find Store / phone / Gift Cards / FAQs / Contact" strip.
export const utilityNav: NavItem[] = [
  { label: "Track Order", href: "/track-order" },
  { label: "Gift Cards", href: "/gift-cards" },
  { label: "FAQs", href: "/faq" },
  { label: "Contact", href: "/contact" },
];

export interface FooterColumn {
  title: string;
  links: NavItem[];
}

// The reference theme's footer had a "Local" column listing multiple US
// cities (LA/SF/NYC/...) — doesn't fit a single-city Vadodara-only florist,
// so that slot is replaced with service-area coverage instead (rendered
// separately from siteConfig.serviceAreas, since those are labels, not pages).
export const footerColumns: FooterColumn[] = [
  {
    title: "About Us",
    links: [
      { label: "Our Story", href: "/about" },
      { label: "Decoration Services", href: "/decoration-services" },
      { label: "Corporate & Bulk Gifting", href: "/corporate-gifting" },
      { label: "Gallery", href: "/gallery" },
      { label: "Blog", href: "/blog" },
    ],
  },
  {
    title: "Help",
    links: [
      { label: "Track Order", href: "/track-order" },
      { label: "Same Day Delivery", href: "/same-day-delivery" },
      { label: "Midnight Delivery", href: "/midnight-delivery" },
      { label: "FAQs", href: "/faq" },
      { label: "Terms of Use", href: "/terms" },
      { label: "Privacy Policy", href: "/privacy" },
    ],
  },
];
