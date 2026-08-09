import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { requireAdminSession } from "@/server/auth/require-admin";
import { listTestimonialsAdmin } from "@/features/testimonial/queries";
import { TestimonialsTable } from "@/features/testimonial/components/testimonials-table";
import { ReorderTestimonialsDialog } from "@/features/testimonial/components/reorder-testimonials-dialog";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Testimonials",
};

export default async function AdminTestimonialsPage() {
  await requireAdminSession("testimonials:manage");
  const testimonials = await listTestimonialsAdmin();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Testimonials</h1>
          <p className="text-muted-foreground text-sm">
            {testimonials.length} testimonials — shown in the homepage &ldquo;What Customers Are
            Saying&rdquo; carousel.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ReorderTestimonialsDialog testimonials={testimonials} />
          <Button
            variant="brand"
            nativeButton={false}
            render={<Link href="/admin/testimonials/new" />}
          >
            <Plus className="size-4" aria-hidden="true" />
            New Testimonial
          </Button>
        </div>
      </div>

      <TestimonialsTable testimonials={testimonials} />
    </div>
  );
}
