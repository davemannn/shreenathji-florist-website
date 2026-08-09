import type { Metadata } from "next";
import { Phone, MessageCircle, Gift, Users2, PartyPopper, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ContentImage } from "@/components/shared/content-image";
import { SectionHeading } from "@/components/shared/section-heading";
import { ContactForm } from "@/features/contact/components/contact-form";
import { pexelsPhoto } from "@/lib/stock-photo";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Corporate & Bulk Gifting",
  description:
    "Bulk flower, cake and gift hamper orders for corporate gifting, employee appreciation, and events across Vadodara — custom quotes, branded add-ons available.",
};

const USE_CASES = [
  {
    icon: Users2,
    title: "Employee Appreciation",
    description: "Festive hampers, desk bouquets, or celebration cakes for your whole team.",
  },
  {
    icon: Gift,
    title: "Client & Partner Gifting",
    description: "Thoughtful, on-brand gifts for clients — festive, congratulatory, or thank-you.",
  },
  {
    icon: PartyPopper,
    title: "Corporate Events",
    description: "Stage, entrance and table florals for launches, offsites and conferences.",
  },
  {
    icon: Package,
    title: "Bulk & Recurring Orders",
    description: "Standing orders for office reception flowers or recurring festive hampers.",
  },
];

export default function CorporateGiftingPage() {
  return (
    <div className="flex flex-col">
      <section className="relative">
        <div className="h-[42vh] min-h-[320px] w-full">
          <ContentImage
            src={pexelsPhoto("6157229", 1600)}
            alt="Corporate gift hampers and flowers"
            className="size-full"
            priority
          />
          <div className="absolute inset-0 bg-black/45" aria-hidden="true" />
        </div>
        <div className="absolute inset-0 flex flex-col items-center justify-center px-4 text-center text-white">
          <p className="text-xs font-semibold tracking-[0.2em] uppercase">
            Corporate & Bulk Gifting
          </p>
          <h1 className="mt-3 max-w-2xl text-3xl md:text-5xl">Gifting At Scale, Handled Right</h1>
          <p className="mt-4 max-w-xl text-sm text-white/85 md:text-base">
            Bulk flowers, cakes and hampers for your team, clients or next event — custom quotes,
            consistent quality, delivered across Vadodara.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button
              variant="brand"
              size="lg"
              className="text-base"
              nativeButton={false}
              render={<a href={siteConfig.contact.phoneHref} />}
            >
              <Phone className="size-4" aria-hidden="true" />
              Call Now — {siteConfig.contact.phone}
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="border-white/60 bg-white/10 text-base text-white hover:bg-white/20 hover:text-white"
              nativeButton={false}
              render={
                <a
                  href={siteConfig.contact.whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                />
              }
            >
              <MessageCircle className="size-4" aria-hidden="true" />
              WhatsApp Us
            </Button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 md:px-6 lg:px-8">
        <SectionHeading
          eyebrow="What We Handle"
          title="Corporate Gifting, Made Simple"
          description="Every order is quoted around your headcount, budget and occasion — no fixed packages, just what actually fits your team."
        />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {USE_CASES.map((item) => (
            <div
              key={item.title}
              className="border-border flex flex-col gap-3 rounded-xs border p-6"
            >
              <div className="bg-brand/10 text-brand flex size-11 items-center justify-center rounded-full">
                <item.icon className="size-5" aria-hidden="true" />
              </div>
              <h3 className="font-medium">{item.title}</h3>
              <p className="text-muted-foreground text-sm">{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-muted/30 py-16">
        <div className="mx-auto max-w-2xl px-4 md:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Get a Quote"
            title="Tell Us About Your Order"
            description="Share your headcount, occasion, and timeline — we'll respond with a custom quote, usually within the day."
          />
          <ContactForm messagePlaceholder="e.g. 40 desk bouquets for Diwali, delivered to our Alkapuri office by the 28th" />
        </div>
      </section>
    </div>
  );
}
