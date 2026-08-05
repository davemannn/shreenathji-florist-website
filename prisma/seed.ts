/**
 * Seeds the commerce catalog: categories, products (with variants + images),
 * delivery slots, coupons, and a few reviews per product.
 *
 * Usage: npm run db:seed
 *
 * Idempotent-ish: uses upsert on unique slugs/codes so re-running doesn't
 * duplicate rows, though product variants/images/reviews are recreated on
 * each run (deleteMany + recreate) for simplicity — fine for a dev seed.
 */
import "dotenv/config";
import { prisma } from "../src/server/db/prisma";

function pexels(id: string, width = 800) {
  return `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=${width}`;
}

const CATEGORIES = [
  {
    slug: "flowers",
    name: "Flowers",
    isOccasion: false,
    isFeatured: true,
    image: pexels("28115373", 400),
  },
  {
    slug: "cakes",
    name: "Cakes",
    isOccasion: false,
    isFeatured: true,
    image: pexels("27848148", 400),
  },
  {
    slug: "greeting-cards",
    name: "Greeting Cards",
    isOccasion: false,
    isFeatured: false,
    image: pexels("6087528", 400),
  },
  {
    slug: "teddy-bears",
    name: "Teddy Bears",
    isOccasion: false,
    isFeatured: false,
    image: pexels("30531456", 400),
  },
  {
    slug: "chocolates",
    name: "Chocolates",
    isOccasion: false,
    isFeatured: false,
    image: pexels("36663543", 400),
  },
  {
    slug: "plants",
    name: "Plants",
    isOccasion: false,
    isFeatured: true,
    image: pexels("9507280", 400),
  },
  {
    slug: "birthday",
    name: "Birthday",
    isOccasion: true,
    isFeatured: true,
    image: pexels("19301032", 400),
  },
  {
    slug: "anniversary",
    name: "Anniversary",
    isOccasion: true,
    isFeatured: true,
    image: pexels("35568784", 400),
  },
  {
    slug: "wedding",
    name: "Wedding",
    isOccasion: true,
    isFeatured: false,
    image: pexels("59948", 400),
  },
  {
    slug: "sympathy",
    name: "Sympathy",
    isOccasion: true,
    isFeatured: true,
    image: pexels("8015629", 400),
  },
  {
    slug: "new-baby",
    name: "New Baby",
    isOccasion: true,
    isFeatured: false,
    image: pexels("8903960", 400),
  },
] as const;

interface SeedVariant {
  label: string;
  price: number;
  compareAtPrice?: number;
  stock: number;
  isDefault: boolean;
}

interface SeedProduct {
  slug: string;
  title: string;
  description: string;
  categories: string[];
  badge?: "SALE" | "NEW" | "BESTSELLER";
  isBestSeller?: boolean;
  isFeatured?: boolean;
  rating: number;
  reviewCount: number;
  images: string[];
  variants: SeedVariant[];
}

const PRODUCTS: SeedProduct[] = [
  {
    slug: "rose-elegance-bouquet",
    title: "Rose Elegance Bouquet",
    description:
      "A hand-tied bouquet of premium red roses, wrapped in kraft paper with seasonal greens. A timeless way to say I love you.",
    categories: ["flowers", "anniversary"],
    badge: "SALE",
    isBestSeller: true,
    isFeatured: true,
    rating: 4.6,
    reviewCount: 128,
    images: [pexels("35672776"), pexels("28115373")],
    variants: [
      { label: "Small (6 roses)", price: 599, stock: 40, isDefault: false },
      { label: "Medium (12 roses)", price: 899, compareAtPrice: 1199, stock: 40, isDefault: true },
      { label: "Large (24 roses)", price: 1299, stock: 20, isDefault: false },
    ],
  },
  {
    slug: "sunshine-gerbera-basket",
    title: "Sunshine Gerbera Basket",
    description:
      "A cheerful basket of mixed gerbera daisies in bright, sunny colors — guaranteed to bring a smile.",
    categories: ["flowers", "birthday"],
    badge: "BESTSELLER",
    isBestSeller: true,
    rating: 4.4,
    reviewCount: 64,
    images: [pexels("18057437"), pexels("19301032")],
    variants: [
      { label: "Regular", price: 749, stock: 30, isDefault: true },
      { label: "Deluxe", price: 999, stock: 20, isDefault: false },
    ],
  },
  {
    slug: "lily-whisper-vase",
    title: "Lily Whisper Vase",
    description:
      "Elegant white lilies arranged in a glass vase, filling any room with a delicate fragrance.",
    categories: ["flowers", "anniversary"],
    rating: 4.8,
    reviewCount: 91,
    images: [pexels("11196806"), pexels("35568784")],
    variants: [
      { label: "Standard", price: 1099, stock: 25, isDefault: true },
      { label: "Premium", price: 1499, stock: 15, isDefault: false },
    ],
  },
  {
    slug: "orchid-charm-arrangement",
    title: "Orchid Charm Arrangement",
    description:
      "A striking phalaenopsis orchid arrangement — sophisticated, long-lasting, and low-maintenance.",
    categories: ["flowers", "anniversary"],
    isFeatured: true,
    rating: 4.7,
    reviewCount: 58,
    images: [pexels("15979836"), pexels("5409690")],
    variants: [
      { label: "Single Stem", price: 899, stock: 20, isDefault: false },
      { label: "Double Stem", price: 1499, stock: 20, isDefault: true },
    ],
  },
  {
    slug: "carnation-cheer-bunch",
    title: "Carnation Cheer Bunch",
    description:
      "A vibrant bunch of long-lasting carnations in mixed colors — great value, full of cheer.",
    categories: ["flowers", "birthday"],
    badge: "NEW",
    rating: 4.2,
    reviewCount: 33,
    images: [pexels("12944992"), pexels("19363509")],
    variants: [
      { label: "Half Dozen", price: 399, stock: 40, isDefault: true },
      { label: "Dozen", price: 699, stock: 25, isDefault: false },
    ],
  },
  {
    slug: "peaceful-lily-basket",
    title: "Peaceful Lily Basket",
    description:
      "A gentle, all-white arrangement designed to offer comfort and convey heartfelt condolences.",
    categories: ["flowers", "sympathy"],
    rating: 4.5,
    reviewCount: 27,
    images: [pexels("8015629"), pexels("11193857")],
    variants: [
      { label: "Standard", price: 899, stock: 15, isDefault: true },
      { label: "Deluxe", price: 1299, stock: 10, isDefault: false },
    ],
  },
  {
    slug: "wedding-white-bouquet",
    title: "Wedding White Bouquet",
    description:
      "A romantic all-white bridal bouquet of roses and lisianthus, finished with satin ribbon.",
    categories: ["flowers", "wedding"],
    rating: 4.9,
    reviewCount: 19,
    images: [pexels("59948"), pexels("4034248")],
    variants: [
      { label: "Bridal Posy", price: 1499, stock: 10, isDefault: true },
      { label: "Grand Bouquet", price: 2499, stock: 8, isDefault: false },
    ],
  },
  {
    slug: "new-baby-pastel-bouquet",
    title: "New Baby Pastel Bouquet",
    description:
      "Soft pastel blooms arranged to welcome a new little one — available in pink or blue accents.",
    categories: ["flowers", "new-baby"],
    rating: 4.6,
    reviewCount: 14,
    images: [pexels("8903960"), pexels("15198293")],
    variants: [{ label: "Standard", price: 799, stock: 20, isDefault: true }],
  },
  {
    slug: "chocolate-truffle-cake",
    title: "Chocolate Truffle Cake",
    description:
      "Rich, moist chocolate sponge layered with chocolate truffle cream and a glossy ganache finish.",
    categories: ["cakes", "birthday"],
    badge: "BESTSELLER",
    isBestSeller: true,
    isFeatured: true,
    rating: 4.5,
    reviewCount: 213,
    images: [pexels("19036040"), pexels("27848148")],
    variants: [
      { label: "500g", price: 649, stock: 30, isDefault: true },
      { label: "1kg", price: 1099, stock: 20, isDefault: false },
    ],
  },
  {
    slug: "red-velvet-cake",
    title: "Red Velvet Cake",
    description: "Classic red velvet sponge with a tangy cream cheese frosting.",
    categories: ["cakes", "anniversary"],
    rating: 4.6,
    reviewCount: 87,
    images: [pexels("3081657"), pexels("10249461")],
    variants: [
      { label: "500g", price: 549, stock: 25, isDefault: true },
      { label: "1kg", price: 949, stock: 15, isDefault: false },
    ],
  },
  {
    slug: "black-forest-cake",
    title: "Black Forest Cake",
    description:
      "A timeless favorite — chocolate sponge, whipped cream, cherries, and chocolate shavings.",
    categories: ["cakes", "birthday"],
    isBestSeller: true,
    rating: 4.4,
    reviewCount: 102,
    images: [pexels("18613262"), pexels("12927134")],
    variants: [
      { label: "500g", price: 499, stock: 30, isDefault: true },
      { label: "1kg", price: 849, stock: 20, isDefault: false },
    ],
  },
  {
    slug: "pineapple-delight-cake",
    title: "Pineapple Delight Cake",
    description:
      "Light vanilla sponge with fresh pineapple chunks and whipped cream — a fruity crowd-pleaser.",
    categories: ["cakes"],
    rating: 4.3,
    reviewCount: 41,
    images: [pexels("30575906"), pexels("8774179")],
    variants: [
      { label: "500g", price: 499, stock: 25, isDefault: true },
      { label: "1kg", price: 849, stock: 15, isDefault: false },
    ],
  },
  {
    slug: "money-plant-ceramic-pot",
    title: "Money Plant in Ceramic Pot",
    description:
      "A low-maintenance money plant in a glazed ceramic pot — an easy, thoughtful housewarming gift.",
    categories: ["plants"],
    badge: "NEW",
    rating: 4.5,
    reviewCount: 38,
    images: [pexels("35673888"), pexels("9507280")],
    variants: [
      { label: "Small", price: 399, stock: 35, isDefault: true },
      { label: "Large", price: 699, stock: 20, isDefault: false },
    ],
  },
  {
    slug: "peace-lily-plant",
    title: "Peace Lily Plant",
    description:
      "An air-purifying peace lily, known for its glossy leaves and elegant white blooms.",
    categories: ["plants", "sympathy"],
    rating: 4.7,
    reviewCount: 22,
    images: [pexels("9412363"), pexels("4503820")],
    variants: [{ label: "Regular", price: 599, stock: 20, isDefault: true }],
  },
  {
    slug: "handmade-wish-card",
    title: "Handmade Wish Card",
    description: "A beautifully handcrafted greeting card with a heartfelt printed message inside.",
    categories: ["greeting-cards"],
    rating: 4.3,
    reviewCount: 16,
    images: [pexels("6087528"), pexels("35163663")],
    variants: [
      { label: "Birthday", price: 149, stock: 60, isDefault: true },
      { label: "Anniversary", price: 149, stock: 60, isDefault: false },
    ],
  },
  {
    slug: "cuddly-teddy-bear",
    title: "Cuddly Teddy Bear",
    description:
      "An irresistibly soft teddy bear — the perfect companion gift alongside flowers or cake.",
    categories: ["teddy-bears", "birthday"],
    rating: 4.6,
    reviewCount: 54,
    images: [pexels("30531456"), pexels("264917")],
    variants: [
      { label: "Small (12in)", price: 499, stock: 30, isDefault: true },
      { label: "Large (24in)", price: 999, stock: 15, isDefault: false },
    ],
  },
  {
    slug: "assorted-chocolate-gift-box",
    title: "Assorted Chocolate Gift Box",
    description: "A curated box of assorted chocolates — milk, dark, and filled varieties.",
    categories: ["chocolates"],
    rating: 4.5,
    reviewCount: 47,
    images: [pexels("36663543"), pexels("10507293")],
    variants: [
      { label: "200g", price: 399, stock: 40, isDefault: true },
      { label: "500g", price: 799, stock: 20, isDefault: false },
    ],
  },
  {
    slug: "mixed-flower-teddy-combo",
    title: "Mixed Flowers & Teddy Combo",
    description:
      "A hand-tied mixed flower bouquet paired with a cuddly teddy bear — a complete gift in one.",
    categories: ["flowers", "teddy-bears", "birthday"],
    badge: "SALE",
    isFeatured: true,
    rating: 4.3,
    reviewCount: 47,
    images: [pexels("1264919"), pexels("30531456")],
    variants: [
      { label: "Standard", price: 999, compareAtPrice: 1299, stock: 25, isDefault: true },
      { label: "Deluxe", price: 1499, stock: 15, isDefault: false },
    ],
  },
];

const REVIEW_POOL = [
  {
    authorName: "Happy Customer",
    rating: 5,
    comment: "Arrived exactly on time and looked even better than the photos. Will order again.",
  },
  {
    authorName: "Verified Buyer",
    rating: 5,
    comment: "Great quality and fresh — lasted well over a week.",
  },
  { authorName: "Local Customer", rating: 4, comment: "Good value and friendly delivery service." },
  {
    authorName: "Repeat Customer",
    rating: 5,
    comment: "My go-to for last-minute gifts. Never disappoints.",
  },
  {
    authorName: "Verified Buyer",
    rating: 4,
    comment: "Nicely packaged, though delivery was a little later than expected.",
  },
];

const DELIVERY_SLOTS = [
  {
    label: "Standard Delivery (9 AM - 8 PM)",
    type: "NORMAL" as const,
    extraCharge: 0,
    sortOrder: 1,
  },
  {
    label: "Express Delivery (within 2-4 hours)",
    type: "FIXED" as const,
    extraCharge: 99,
    sortOrder: 2,
  },
  {
    label: "Midnight Delivery (11:30 PM - 12:30 AM)",
    type: "MIDNIGHT" as const,
    extraCharge: 199,
    sortOrder: 3,
  },
];

const COUPONS = [
  {
    code: "WELCOME10",
    description: "10% off your first order",
    discountType: "PERCENT" as const,
    discountValue: 10,
    minOrderValue: 499,
    maxDiscount: 200,
  },
  {
    code: "FLAT50",
    description: "Flat ₹50 off",
    discountType: "FLAT" as const,
    discountValue: 50,
    minOrderValue: 399,
  },
];

async function main() {
  console.log("Seeding categories...");
  for (const [index, category] of CATEGORIES.entries()) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: {
        name: category.name,
        isOccasion: category.isOccasion,
        isFeatured: category.isFeatured,
        imageUrl: category.image,
        sortOrder: index,
      },
      create: {
        slug: category.slug,
        name: category.name,
        isOccasion: category.isOccasion,
        isFeatured: category.isFeatured,
        imageUrl: category.image,
        sortOrder: index,
      },
    });
  }

  console.log("Seeding products...");
  for (const product of PRODUCTS) {
    const existing = await prisma.product.findUnique({ where: { slug: product.slug } });

    // Recreate variants/images/reviews on every run — simplest way to keep
    // a dev seed idempotent-ish without diffing nested arrays by hand.
    if (existing) {
      await prisma.productVariant.deleteMany({ where: { productId: existing.id } });
      await prisma.productImage.deleteMany({ where: { productId: existing.id } });
      await prisma.review.deleteMany({ where: { productId: existing.id } });
      await prisma.productCategory.deleteMany({ where: { productId: existing.id } });
    }

    const reviews = Array.from(
      { length: 3 },
      (_, i) => REVIEW_POOL[(product.slug.length + i) % REVIEW_POOL.length],
    );

    await prisma.product.upsert({
      where: { slug: product.slug },
      update: {
        title: product.title,
        description: product.description,
        badge: product.badge,
        isBestSeller: product.isBestSeller ?? false,
        isFeatured: product.isFeatured ?? false,
        rating: product.rating,
        reviewCount: product.reviewCount,
        categories: {
          create: product.categories.map((slug) => ({ category: { connect: { slug } } })),
        },
        images: {
          create: product.images.map((url, sortOrder) => ({ url, alt: product.title, sortOrder })),
        },
        variants: {
          create: product.variants.map((variant, sortOrder) => ({ ...variant, sortOrder })),
        },
        reviews: { create: reviews },
      },
      create: {
        slug: product.slug,
        title: product.title,
        description: product.description,
        badge: product.badge,
        isBestSeller: product.isBestSeller ?? false,
        isFeatured: product.isFeatured ?? false,
        rating: product.rating,
        reviewCount: product.reviewCount,
        categories: {
          create: product.categories.map((slug) => ({ category: { connect: { slug } } })),
        },
        images: {
          create: product.images.map((url, sortOrder) => ({ url, alt: product.title, sortOrder })),
        },
        variants: {
          create: product.variants.map((variant, sortOrder) => ({ ...variant, sortOrder })),
        },
        reviews: { create: reviews },
      },
    });
  }

  console.log("Seeding delivery slots...");
  for (const slot of DELIVERY_SLOTS) {
    const existing = await prisma.deliverySlot.findFirst({ where: { label: slot.label } });
    if (existing) {
      await prisma.deliverySlot.update({ where: { id: existing.id }, data: slot });
    } else {
      await prisma.deliverySlot.create({ data: slot });
    }
  }

  console.log("Seeding coupons...");
  for (const coupon of COUPONS) {
    await prisma.coupon.upsert({
      where: { code: coupon.code },
      update: coupon,
      create: coupon,
    });
  }

  console.log(`Done — ${CATEGORIES.length} categories, ${PRODUCTS.length} products.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
