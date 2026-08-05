import Link from "next/link";
import { ContentImage } from "@/components/shared/content-image";
import { cn } from "@/lib/utils";
import { getPromoBanners } from "../queries";

/** 3-up promo strip directly under the hero — edge-to-edge tiles, hairline dividers via the bg-border grid trick. */
export async function PromoBannerStrip() {
  const banners = await getPromoBanners();

  return (
    <section className="bg-border grid grid-cols-1 gap-px sm:grid-cols-3">
      {banners.map((banner) => {
        const hasPhoto = Boolean(banner.imageUrl);

        return (
          <Link key={banner.id} href={banner.href} className="group bg-background relative block">
            <ContentImage
              src={banner.imageUrl}
              alt={banner.imageAlt}
              className="aspect-4/5"
              sizes="(min-width: 640px) 33vw, 100vw"
            />
            {hasPhoto ? (
              <div className="from-foreground/70 absolute inset-0 bg-gradient-to-t via-transparent to-transparent" />
            ) : null}
            <div
              className={cn(
                "absolute inset-x-0 bottom-0 p-6 text-center",
                hasPhoto && "text-white",
              )}
            >
              <p
                className={cn(
                  "text-xs font-semibold tracking-[0.2em] uppercase",
                  hasPhoto ? "text-white/90" : "text-brand",
                )}
              >
                {banner.subtitle}
              </p>
              <h3 className="mt-1 text-2xl underline-offset-4 group-hover:underline">
                {banner.title}
              </h3>
            </div>
          </Link>
        );
      })}
    </section>
  );
}
