"use client";

import { ReorderDialog } from "@/components/shared/reorder-dialog";
import { reorderTestimonialsAction } from "../actions";
import type { AdminTestimonial } from "../types";

export function ReorderTestimonialsDialog({ testimonials }: { testimonials: AdminTestimonial[] }) {
  return (
    <ReorderDialog
      items={testimonials}
      getId={(testimonial) => testimonial.id}
      renderRow={(testimonial) => <span className="truncate">{testimonial.authorName}</span>}
      onSave={reorderTestimonialsAction}
      title="Reorder testimonials"
      description="Drag rows into place, or use the arrows. This is the order they appear in the homepage carousel."
    />
  );
}
