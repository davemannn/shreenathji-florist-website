// Single source of truth for site navigation, consumed by both the desktop
// (NavigationMenu) and mobile (Sheet + Accordion) header nav so the two
// never drift out of sync.

export interface NavItem {
  label: string;
  href: string;
  children?: NavItem[];
}

export const mainNav: NavItem[] = [
  { label: "Home", href: "/" },
  {
    label: "Shop",
    href: "/shop",
    children: [
      { label: "Flowers", href: "/shop/flowers" },
      { label: "Cakes", href: "/shop/cakes" },
      { label: "Plants", href: "/shop/plants" },
      { label: "Greeting Cards", href: "/shop/greeting-cards" },
      { label: "Teddy Bears", href: "/shop/teddy-bears" },
      { label: "Chocolates", href: "/shop/chocolates" },
    ],
  },
  {
    // Occasions route to the same /shop/[category] page as Shop categories —
    // both are just Category rows (an `isOccasion` flag distinguishes them),
    // not two parallel listing-page trees.
    label: "Occasions",
    href: "/shop",
    children: [
      { label: "Birthday", href: "/shop/birthday" },
      { label: "Anniversary", href: "/shop/anniversary" },
      { label: "Wedding", href: "/shop/wedding" },
      { label: "Sympathy", href: "/shop/sympathy" },
      { label: "New Baby", href: "/shop/new-baby" },
    ],
  },
  { label: "Decoration Services", href: "/decoration-services" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

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
