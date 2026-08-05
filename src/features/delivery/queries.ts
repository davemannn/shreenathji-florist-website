import type { DeliveryFeature } from "./types";

// Florist-specific delivery promises, replacing the reference theme's
// generic "30% off + free shipping" trust strip with what actually matters
// for this business per the product brief.
const DELIVERY_FEATURES: DeliveryFeature[] = [
  {
    id: "1",
    icon: "clock",
    title: "Same Day Delivery",
    description: "Order before 4 PM for delivery anywhere in Vadodara, today.",
  },
  {
    id: "2",
    icon: "moon",
    title: "Midnight Delivery",
    description: "Surprise them at 12 AM sharp for birthdays & anniversaries.",
  },
  {
    id: "3",
    icon: "flower",
    title: "Freshness Guaranteed",
    description: "Hand-picked, freshly cut flowers — every single order.",
  },
];

export async function getDeliveryFeatures(): Promise<DeliveryFeature[]> {
  return DELIVERY_FEATURES;
}
