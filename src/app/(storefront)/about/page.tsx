import type { Metadata } from "next";
import Link from "next/link";
import { Sprout, Store, Truck, Award, Flower2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ContentImage } from "@/components/shared/content-image";
import { SectionHeading } from "@/components/shared/section-heading";
import { pexelsPhoto } from "@/lib/stock-photo";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "The story of Shrinathji Florist — a family-run flower shop in Vadodara growing from a single stall into the city's trusted name for flowers, cakes and gifting.",
};

const TIMELINE = [
  {
    year: "2009",
    icon: Sprout,
    title: "A Small Beginning",
    description:
      "Shrinathji Florist opened as a single flower stall near Sayajigunj, hand-tying bouquets every morning before sunrise.",
  },
  {
    year: "2013",
    icon: Store,
    title: "Our First Store",
    description:
      "Word of mouth grew our little stall into a proper storefront in Alkapuri, with a small team and a growing regular clientele.",
  },
  {
    year: "2017",
    icon: Truck,
    title: "Same-Day Delivery Across Vadodara",
    description:
      "We built out our own delivery fleet, becoming one of the first local florists to offer reliable same-day and midnight delivery.",
  },
  {
    year: "2021",
    icon: Flower2,
    title: "Cakes, Gifts & Decor",
    description:
      "We expanded beyond flowers — cakes, greeting cards, teddy bears, chocolates, and full event decoration services.",
  },
  {
    year: "2026",
    icon: Award,
    title: "Serving Vadodara Online",
    description:
      "Today, Shrinathji Florist serves thousands of happy customers across Alkapuri, Gotri, Sayajigunj, Karelibaug, Manjalpur and Old Padra Road — now online too.",
  },
];

export default function AboutPage() {
  return (
    <div className="flex flex-col">
      <section className="mx-auto max-w-7xl px-4 py-16 md:px-6 lg:px-8">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <p className="text-brand text-xs font-semibold tracking-[0.2em] uppercase">Our Story</p>
            <h1 className="mt-3 text-3xl md:text-5xl">Grown From A Single Flower Stall</h1>
            <p className="text-muted-foreground mt-5 text-sm md:text-base">
              Shrinathji Florist started in 2009 as a small flower stall in Vadodara, run by a
              family that believed every celebration — and every quiet condolence — deserves flowers
              chosen with care. Nearly two decades later, we&apos;re still hand-picking every stem,
              still delivering ourselves across the city, and still doing it the way we started:
              personally.
            </p>
            <p className="text-muted-foreground mt-4 text-sm md:text-base">
              From birthdays and weddings to same-day surprises and full event decor, our team
              designs every order like it&apos;s for our own family — because in a city like
              Vadodara, a lot of our customers are.
            </p>
            <div className="mt-8">
              <Button
                variant="brand"
                size="lg"
                nativeButton={false}
                render={<Link href="/contact" />}
              >
                Get In Touch
              </Button>
            </div>
          </div>
          <ContentImage
            src={pexelsPhoto("28115373", 1200)}
            alt="Fresh hand-tied bouquet at Shrinathji Florist"
            className="aspect-4/5 rounded-xs"
            sizes="(min-width: 1024px) 50vw, 100vw"
          />
        </div>
      </section>

      <section className="bg-muted/30 py-16">
        <div className="mx-auto max-w-4xl px-4 md:px-6 lg:px-8">
          <SectionHeading eyebrow="Our Journey" title="A Timeline Of Growing With Vadodara" />

          <ol className="border-border relative flex flex-col gap-10 border-l pl-8">
            {TIMELINE.map((item) => (
              <li key={item.year} className="relative">
                <span className="bg-brand text-brand-foreground absolute top-0 -left-[calc(2rem+1px)] flex size-8 items-center justify-center rounded-full">
                  <item.icon className="size-4" aria-hidden="true" />
                </span>
                <p className="text-brand text-sm font-semibold">{item.year}</p>
                <h3 className="mt-1 font-medium">{item.title}</h3>
                <p className="text-muted-foreground mt-1 text-sm">{item.description}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </div>
  );
}
