// Site-wide metadata and chrome content (header utility bar, footer columns,
// contact/social info). Homepage SECTION content (hero slides, categories,
// products, etc.) lives in each feature's queries.ts instead — this file is
// only for the site-wide chrome that doesn't belong to any one feature.
//
// TODO: replace placeholder contact details with the real business phone
// number, email, and social links before launch.
export const siteConfig = {
  name: "Shreenathji Florist",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  description:
    "Fresh flowers, bouquets, cakes & gifts with same-day and midnight delivery across Vadodara, Gujarat. Order online for birthdays, anniversaries, weddings & every occasion.",
  contact: {
    phone: "+91 98765 43210",
    phoneHref: "tel:+919876543210",
    whatsappHref: "https://wa.me/919876543210",
    email: "hello@shreenathjiflorist.in",
    address: "Vadodara, Gujarat, India",
  },
  social: {
    instagram: "https://instagram.com/shreenathjiflorist",
    facebook: "https://facebook.com/shreenathjiflorist",
  },
  serviceAreas: ["Alkapuri", "Gotri", "Sayajigunj", "Karelibaug", "Manjalpur", "Old Padra Road"],
  paymentMethods: ["UPI", "Razorpay", "Visa", "Mastercard", "Cash on Delivery"],
} as const;
