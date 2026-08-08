// Site-wide metadata and chrome content (header utility bar, footer columns,
// contact/social info). Homepage SECTION content (hero slides, categories,
// products, etc.) lives in each feature's queries.ts instead — this file is
// only for the site-wide chrome that doesn't belong to any one feature.
export const siteConfig = {
  name: "Shrinathji Florist",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  description:
    "Top flower decoration, bouquets, cakes & gifts with same-day and midnight delivery across Vadodara, Gujarat. Order online for birthdays, anniversaries, weddings & every occasion.",
  contact: {
    phone: "+91 98257 56601",
    phoneHref: "tel:+919825756601",
    whatsappHref: "https://wa.me/919825756601",
    email: "support@shrinathjiflorist.com",
    address:
      "GF-9, Dwarkesh Complex, RC Dutt Rd, near Welcome Hotel, Vadiwadi, Vadodara, Gujarat 390007",
    hoursLabel: "Every day · 8:30 AM – 9:00 PM",
    // Resolved from the business's real Google Maps listing — same place
    // the "Get Directions" link and the contact page's embedded map use.
    mapsUrl:
      "https://www.google.com/maps/place/Shrinathji+Florist+-+Top+Flower+Decoration,+Flower+Bouquet,+Florist+In+Vadodara/@22.3102158,73.1666817,17z",
    mapLat: 22.3102158,
    mapLng: 73.1666817,
  },
  social: {
    instagram: "https://www.instagram.com/shrinathjiflorist/",
    facebook: "https://facebook.com/shrinathjiflorist",
  },
  serviceAreas: ["Alkapuri", "Gotri", "Sayajigunj", "Karelibaug", "Manjalpur", "Old Padra Road"],
  paymentMethods: ["UPI", "Razorpay", "Visa", "Mastercard", "Cash on Delivery"],
} as const;
