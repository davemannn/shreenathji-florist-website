import type { Metadata } from "next";
import Link from "next/link";
import {
  Phone,
  MessageCircle,
  Heart,
  Gem,
  Flower2,
  Users,
  HandHeart,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ContentImage } from "@/components/shared/content-image";
import { SectionHeading } from "@/components/shared/section-heading";
import { pexelsPhoto } from "@/lib/stock-photo";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Decoration Services",
  description:
    "Custom flower & event decoration for proposals, anniversaries, weddings, farewells and memorial services across Vadodara. Call us for a same-day quote.",
};

const OCCASIONS = [
  {
    icon: Gem,
    title: "Proposal Setups",
    description:
      "Candlelit petal paths, balloon arches & a flower wall backdrop — designed to make the moment unforgettable.",
  },
  {
    icon: Heart,
    title: "Anniversary Celebrations",
    description:
      "Romantic room & venue decor with fresh florals, fairy lights and a personalized touch.",
  },
  {
    icon: Flower2,
    title: "Wedding & Marriage Decor",
    description:
      "Mandap, stage, entrance and car decoration — full-scale floral styling for your big day.",
  },
  {
    icon: Users,
    title: "Farewell & Retirement Parties",
    description: "Warm, celebratory decor to send off a colleague or loved one in style.",
  },
  {
    icon: HandHeart,
    title: "Condolence & Memorial Setups",
    description:
      "Dignified, tasteful floral arrangements for last-respects and memorial services, handled with care.",
  },
  {
    icon: Sparkles,
    title: "Birthdays & Custom Themes",
    description:
      "Balloon decor, theme setups and floral installations tailored to any celebration.",
  },
];

const STEPS = [
  {
    step: "01",
    title: "Call or WhatsApp us",
    description: "Tell us your occasion, location and date — we respond within minutes.",
  },
  {
    step: "02",
    title: "Get a custom quote",
    description: "We design a decor plan around your budget and venue, no obligation.",
  },
  {
    step: "03",
    title: "We set it up",
    description: "Our team handles setup and takedown across Vadodara, on time, every time.",
  },
];

export default function DecorationServicesPage() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative">
        <div className="h-[52vh] min-h-[380px] w-full">
          <ContentImage
            src={pexelsPhoto("5060099", 1600)}
            alt="Elegant floral event decoration"
            className="size-full"
            priority
          />
          <div className="absolute inset-0 bg-black/45" aria-hidden="true" />
        </div>
        <div className="absolute inset-0 flex flex-col items-center justify-center px-4 text-center text-white">
          <p className="text-xs font-semibold tracking-[0.2em] uppercase">Decoration Services</p>
          <h1 className="mt-3 max-w-2xl text-3xl md:text-5xl">
            Decor For Every Moment That Matters
          </h1>
          <p className="mt-4 max-w-xl text-sm text-white/85 md:text-base">
            From a surprise proposal to a wedding stage, a farewell party to a quiet memorial — we
            design and set up custom decor across Vadodara, tailored to your occasion, venue and
            budget.
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

      {/* Occasions grid */}
      <section className="mx-auto max-w-7xl px-4 py-16 md:px-6 lg:px-8">
        <SectionHeading
          eyebrow="What We Decorate"
          title="A Custom Setup For Every Occasion"
          description="Every event is quoted and designed around your specific occasion, location and needs — not a one-size-fits-all package."
        />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {OCCASIONS.map((occasion) => (
            <div
              key={occasion.title}
              className="border-border flex flex-col gap-3 rounded-xs border p-6"
            >
              <div className="bg-brand/10 text-brand flex size-11 items-center justify-center rounded-full">
                <occasion.icon className="size-5" aria-hidden="true" />
              </div>
              <h3 className="font-medium">{occasion.title}</h3>
              <p className="text-muted-foreground text-sm">{occasion.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-muted/30 py-16">
        <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
          <SectionHeading eyebrow="How It Works" title="Booking Decor Is Simple" />
          <div className="grid gap-8 sm:grid-cols-3">
            {STEPS.map((item) => (
              <div key={item.step} className="text-center">
                <span className="text-brand text-4xl font-semibold">{item.step}</span>
                <h3 className="mt-3 font-medium">{item.title}</h3>
                <p className="text-muted-foreground mt-1 text-sm">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA banner */}
      <section className="bg-brand text-brand-foreground">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-5 px-4 py-16 text-center md:px-6 lg:px-8">
          <h2 className="text-2xl md:text-3xl">Ready to make it unforgettable?</h2>
          <p className="max-w-lg text-sm text-white/90 md:text-base">
            Speak to our decor team right now — same-day quotes, on-site setup, anywhere in
            Vadodara.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button
              size="lg"
              className="bg-white text-base text-black hover:bg-white/90"
              nativeButton={false}
              render={<a href={siteConfig.contact.phoneHref} />}
            >
              <Phone className="size-4" aria-hidden="true" />
              Call {siteConfig.contact.phone}
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="border-white/70 bg-transparent text-base text-white hover:bg-white/10 hover:text-white"
              nativeButton={false}
              render={<Link href="/contact" />}
            >
              Or Send Us a Message
            </Button>
          </div>
        </div>
      </section>

      {/* Sticky mobile call button — always-visible, one-tap way to reach out */}
      <a
        href={siteConfig.contact.phoneHref}
        className="bg-brand text-brand-foreground fixed right-4 bottom-4 z-40 flex items-center gap-2 rounded-full px-5 py-3 text-sm font-medium shadow-lg md:hidden"
      >
        <Phone className="size-4" aria-hidden="true" />
        Call Now
      </a>
    </div>
  );
}
