// Site-wide metadata placeholder. Real values (name, description, social
// links, contact info) are filled in during the homepage-recreation
// milestone once copy/branding is finalized.
export const siteConfig = {
  name: "Shreenathji Florist",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  description: "",
} as const;
