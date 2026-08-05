import { Quote } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { StarRating } from "@/components/shared/star-rating";
import type { Testimonial } from "../types";

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

// Stays a Server Component — same reasoning as HeroSlider: <Carousel/>
// already carries its own client boundary, so nothing here needs one too.
export function TestimonialsCarousel({ testimonials }: { testimonials: Testimonial[] }) {
  return (
    <Carousel opts={{ loop: true, align: "start" }} className="group">
      <CarouselContent>
        {testimonials.map((testimonial) => (
          <CarouselItem key={testimonial.id} className="md:basis-1/2 lg:basis-1/3">
            <figure className="border-border flex h-full flex-col gap-4 rounded-xs border p-8">
              <Quote className="text-brand size-6" aria-hidden="true" />
              <blockquote className="text-sm leading-relaxed md:text-base">
                &ldquo;{testimonial.quote}&rdquo;
              </blockquote>
              <figcaption className="mt-auto flex items-center gap-3">
                <Avatar>
                  <AvatarFallback className="bg-brand/10 text-brand">
                    {initials(testimonial.authorName)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">{testimonial.authorName}</p>
                  <StarRating rating={testimonial.rating} />
                </div>
              </figcaption>
            </figure>
          </CarouselItem>
        ))}
      </CarouselContent>
      <div className="mt-8 flex justify-center gap-2">
        <CarouselPrevious className="static translate-x-0 translate-y-0 rounded-full" />
        <CarouselNext className="static translate-x-0 translate-y-0 rounded-full" />
      </div>
    </Carousel>
  );
}
