import Link from "next/link";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { ContentImage } from "@/components/shared/content-image";
import { getHeroSlides } from "../queries";

/**
 * Stays a Server Component: it has no hooks/state of its own — `<Carousel>`
 * already carries its own client boundary internally (embla-carousel-react),
 * so this component can self-fetch its data like every other section
 * instead of needing it passed down as a prop.
 *
 * A two-column text+image layout per slide (rather than text overlaid on a
 * full-bleed background image) avoids needing a photo to overlay against —
 * see ContentImage for the placeholder/real-photo fallback.
 */
export async function HeroSlider() {
  const slides = await getHeroSlides();

  return (
    <Carousel opts={{ loop: true }} className="group">
      <CarouselContent className="ml-0">
        {slides.map((slide, index) => (
          <CarouselItem key={slide.id} className="pl-0">
            <div className="grid lg:grid-cols-2">
              <div className="bg-cream flex flex-col justify-center gap-4 px-6 py-16 md:px-10 lg:px-16">
                <p className="text-brand text-xs font-semibold tracking-[0.2em] uppercase">
                  {slide.eyebrow}
                </p>
                <h1 className="max-w-md text-4xl leading-tight whitespace-pre-line md:text-5xl">
                  {slide.headline}
                </h1>
                <div>
                  <Button
                    variant="brand-outline"
                    size="lg"
                    nativeButton={false}
                    render={<Link href={slide.ctaHref} />}
                  >
                    {slide.ctaLabel}
                  </Button>
                </div>
              </div>
              <ContentImage
                src={slide.imageUrl}
                alt={slide.imageAlt}
                className="min-h-[280px] lg:min-h-[520px]"
                sizes="(min-width: 1024px) 50vw, 100vw"
                priority={index === 0}
              />
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="border-foreground/30 bg-background/80 text-foreground hover:bg-foreground hover:text-background left-4 rounded-full" />
      <CarouselNext className="border-foreground/30 bg-background/80 text-foreground hover:bg-foreground hover:text-background right-4 rounded-full" />
    </Carousel>
  );
}
