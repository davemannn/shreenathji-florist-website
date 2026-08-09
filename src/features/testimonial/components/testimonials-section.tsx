import { SectionHeading } from "@/components/shared/section-heading";
import { getTestimonials } from "../queries";
import { TestimonialsCarousel } from "./testimonials-carousel";

export async function TestimonialsSection() {
  const testimonials = await getTestimonials();
  if (testimonials.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 md:px-6 lg:px-8">
      <SectionHeading eyebrow="Customer Love" title="What Customers Are Saying" />
      <TestimonialsCarousel testimonials={testimonials} />
    </section>
  );
}
