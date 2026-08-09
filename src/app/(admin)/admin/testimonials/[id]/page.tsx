import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireAdminSession } from "@/server/auth/require-admin";
import { getTestimonialForEdit } from "@/features/testimonial/queries";
import { TestimonialForm } from "@/features/testimonial/components/testimonial-form";

export const metadata: Metadata = {
  title: "Edit Testimonial",
};

export default async function EditTestimonialPage({
  params,
}: PageProps<"/admin/testimonials/[id]">) {
  const { id } = await params;
  await requireAdminSession("testimonials:manage");

  const testimonial = await getTestimonialForEdit(id);
  if (!testimonial) notFound();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Edit Testimonial</h1>
      <TestimonialForm testimonial={testimonial} />
    </div>
  );
}
