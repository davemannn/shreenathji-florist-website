import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PlaceholderImage } from "@/components/shared/placeholder-image";
import { getOccasionBanner } from "../queries";

export async function OccasionBanner() {
  const banner = await getOccasionBanner();

  return (
    <section className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
      <div className="bg-foreground text-background grid overflow-hidden rounded-xs lg:grid-cols-2">
        <div className="flex flex-col justify-center gap-4 px-6 py-16 md:px-10 lg:px-16">
          <p className="text-brand text-xs font-semibold tracking-[0.2em] uppercase">
            {banner.eyebrow}
          </p>
          <h2 className="max-w-sm text-3xl md:text-4xl">{banner.heading}</h2>
          <p className="text-background/70 max-w-sm text-sm md:text-base">{banner.body}</p>
          <div>
            <Button
              variant="brand-outline"
              size="lg"
              className="border-background text-background hover:bg-background hover:text-foreground"
              nativeButton={false}
              render={<Link href={banner.ctaHref} />}
            >
              {banner.ctaLabel}
            </Button>
          </div>
        </div>
        <PlaceholderImage
          label={banner.imageAlt}
          className="text-background/40 min-h-[240px] bg-transparent lg:min-h-full"
        />
      </div>
    </section>
  );
}
