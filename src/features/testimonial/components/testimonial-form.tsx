"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from "@/components/ui/form";
import { CloudinaryUploader } from "@/components/shared/cloudinary-uploader";
import { createTestimonialAction, updateTestimonialAction } from "../actions";
import {
  testimonialFormSchema,
  type TestimonialFormInput,
  type TestimonialFormValues,
} from "../validations";
import type { AdminTestimonial } from "../types";

const RATING_OPTIONS = ["5", "4", "3", "2", "1"];

export function TestimonialForm({ testimonial }: { testimonial?: AdminTestimonial }) {
  const router = useRouter();
  const isEdit = !!testimonial;

  const form = useForm<TestimonialFormInput, unknown, TestimonialFormValues>({
    resolver: zodResolver(testimonialFormSchema),
    defaultValues: {
      authorName: testimonial?.authorName ?? "",
      quote: testimonial?.quote ?? "",
      rating: testimonial?.rating ?? 5,
      photoUrl: testimonial?.photoUrl ?? "",
      isActive: testimonial?.isActive ?? true,
    },
  });

  async function onSubmit(values: TestimonialFormValues) {
    try {
      if (isEdit && testimonial) {
        await updateTestimonialAction(testimonial.id, values);
        toast.success("Testimonial updated.");
      } else {
        await createTestimonialAction(values);
        toast.success("Testimonial created.");
      }
      router.push("/admin/testimonials");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Couldn't save this testimonial.");
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        noValidate
        className="flex max-w-md flex-col gap-4"
      >
        <FormField
          control={form.control}
          name="photoUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Photo (optional)</FormLabel>
              <FormControl>
                <CloudinaryUploader
                  folder="testimonials"
                  value={field.value}
                  onChange={(url) => field.onChange(url)}
                  onRemove={() => field.onChange("")}
                  triggerLabel="Upload Photo"
                />
              </FormControl>
              <FormDescription>Falls back to initials if left blank.</FormDescription>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="authorName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Author name</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Priya Sharma" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="quote"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Quote</FormLabel>
              <FormControl>
                <textarea
                  {...field}
                  rows={4}
                  placeholder="What the customer said..."
                  className="border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 w-full rounded-lg border bg-transparent px-2.5 py-1.5 text-sm outline-none focus-visible:ring-3"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="rating"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Rating</FormLabel>
              <Select
                value={String(field.value)}
                onValueChange={(value) => field.onChange(Number(value))}
              >
                <SelectTrigger className="w-32">
                  <SelectValue>{(value: string) => `${value} stars`}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {RATING_OPTIONS.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option} stars
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="isActive"
          render={({ field }) => (
            <label className="flex items-center gap-2 text-sm">
              <Checkbox checked={field.value} onCheckedChange={field.onChange} />
              Active — shown on the homepage
            </label>
          )}
        />

        <Button
          type="submit"
          variant="brand"
          size="lg"
          disabled={form.formState.isSubmitting}
          className="w-fit"
        >
          {form.formState.isSubmitting ? "Saving…" : isEdit ? "Save Changes" : "Create Testimonial"}
        </Button>
      </form>
    </Form>
  );
}
