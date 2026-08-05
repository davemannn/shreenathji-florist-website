import Link from "next/link";
import { PlaceholderImage } from "@/components/shared/placeholder-image";
import { getPromoBanners } from "../queries";

/** 3-up promo strip directly under the hero — edge-to-edge tiles, hairline dividers via the bg-border grid trick. */
export async function PromoBannerStrip() {
  const banners = await getPromoBanners();

  return (
    <section className="bg-border grid grid-cols-1 gap-px sm:grid-cols-3">
      {banners.map((banner) => (
        <Link key={banner.id} href={banner.href} className="group bg-background relative block">
          <PlaceholderImage label={banner.imageAlt} className="aspect-4/5" />
          <div className="absolute inset-x-0 bottom-0 p-6 text-center">
            <p className="text-brand text-xs font-semibold tracking-[0.2em] uppercase">
              {banner.subtitle}
            </p>
            <h3 className="mt-1 text-2xl underline-offset-4 group-hover:underline">
              {banner.title}
            </h3>
          </div>
        </Link>
      ))}
    </section>
  );
}
