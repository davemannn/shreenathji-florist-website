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
}

/**
 * "Shop" and "Occasions" both route to the same /shop/[category] page —
 * both are just Category rows (an `isOccasion` flag distinguishes them),
 * not two parallel listing-page trees. Their children used to be a
 * hardcoded guess at what categories would exist; now they're built from
 * whatever the admin panel's category list actually has (see
 * getNavCategoryGroups in features/category/queries.ts), so creating a
 * category and ticking "Occasion" really does add it to the live nav.
 * A group with no rows yet renders as a plain link (no empty dropdown) —
 * NavigationMenuTrigger/AccordionTrigger both already handle `children:
 * undefined` this way.
 */
export function buildMainNav({ shop, occasions }: NavCategoryGroups): NavItem[] {
  return [
    { label: "Home", href: "/" },
    { label: "Shop", href: "/shop", children: shop.length > 0 ? shop : undefined },
    { label: "Occasions", href: "/shop", children: occasions.length > 0 ? occasions : undefined },
    { label: "Decoration Services", href: "/decoration-services" },
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
  ];
}

// Small top utility bar above the main header row — mirrors the Florial
// reference's "Find Store / phone / Gift Cards / FAQs / Contact" strip.
export const utilityNav: NavItem[] = [
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
      { label: "Gallery", href: "/gallery" },
      { label: "Blog", href: "/blog" },
    ],
  },
  {
    title: "Help",
    links: [
      { label: "Same Day Delivery", href: "/same-day-delivery" },
      { label: "Midnight Delivery", href: "/midnight-delivery" },
      { label: "FAQs", href: "/faq" },
      { label: "Terms of Use", href: "/terms" },
      { label: "Privacy Policy", href: "/privacy" },
    ],
  },
];
