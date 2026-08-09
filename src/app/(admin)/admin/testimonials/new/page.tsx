import type { Metadata } from "next";
import { requireAdminSession } from "@/server/auth/require-admin";
import { TestimonialForm } from "@/features/testimonial/components/testimonial-form";

export const metadata: Metadata = {
  title: "New Testimonial",
};

export default async function NewTestimonialPage() {
  await requireAdminSession("testimonials:manage");

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">New Testimonial</h1>
      <TestimonialForm />
    </div>
  );
}
