import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "FAQs",
  description:
    "Answers to common questions about ordering, delivery, payment and returns at Shrinathji Florist.",
};

const FAQ_GROUPS = [
  {
    group: "Ordering",
    items: [
      {
        q: "How do I place an order?",
        a: "Browse our Shop or Occasions pages, add items to your cart, and check out — you can pay online via Razorpay (UPI, cards, netbanking) or choose Cash on Delivery.",
      },
      {
        q: "Can I customize a bouquet or cake?",
        a: "Yes. Call or WhatsApp us with what you have in mind and we'll put together a custom quote, usually within minutes.",
      },
      {
        q: "Do I need an account to order?",
        a: "Yes, a free account lets us confirm your order, save your delivery addresses, and show you your order history.",
      },
    ],
  },
  {
    group: "Delivery",
    items: [
      {
        q: "What delivery options do you offer?",
        a: "Standard Delivery (free, for next-day onward), Instant Delivery (within 2-4 hours, ₹99), and Midnight Delivery (11:30 PM – 12:30 AM, ₹199). Same-day Midnight bookings close at 8 PM.",
      },
      {
        q: "Which areas do you deliver to?",
        a: `We currently deliver across ${siteConfig.serviceAreas.join(", ")} in Vadodara. Call us to check a specific address.`,
      },
      {
        q: "Can I schedule a delivery for a future date?",
        a: "Yes — pick any date on the checkout calendar for Standard or Midnight delivery.",
      },
    ],
  },
  {
    group: "Payments & Returns",
    items: [
      {
        q: "What payment methods do you accept?",
        a: "UPI, credit/debit cards and netbanking via Razorpay, plus Cash on Delivery.",
      },
      {
        q: "Is online payment secure?",
        a: "Yes — all online payments are processed by Razorpay, a PCI-DSS compliant payment gateway. We never see or store your card details.",
      },
      {
        q: "What if I'm not happy with my order?",
        a: "Flowers and cakes are perishable, so we can't accept returns, but if anything arrives damaged or incorrect, contact us within 24 hours and we'll make it right — a replacement or refund.",
      },
    ],
  },
];

export default function FaqPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 md:px-6 lg:px-8">
      <div className="mb-12 text-center">
        <p className="text-brand text-xs font-semibold tracking-[0.2em] uppercase">Support</p>
        <h1 className="mt-3 text-3xl md:text-5xl">Frequently Asked Questions</h1>
      </div>

      <div className="flex flex-col gap-10">
        {FAQ_GROUPS.map((group) => (
          <div key={group.group}>
            <h2 className="mb-3 text-lg font-semibold">{group.group}</h2>
            <Accordion>
              {group.items.map((item) => (
                <AccordionItem key={item.q} value={item.q}>
                  <AccordionTrigger>{item.q}</AccordionTrigger>
                  <AccordionContent>{item.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        ))}
      </div>

      <div className="border-border mt-12 flex flex-col items-center gap-3 rounded-xs border p-8 text-center">
        <p className="font-medium">Still have questions?</p>
        <Button variant="brand" nativeButton={false} render={<Link href="/contact" />}>
          Contact Us
        </Button>
      </div>
    </div>
  );
}
