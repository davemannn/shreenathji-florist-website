"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from "@/components/ui/form";
import { createFaqItemAction, updateFaqItemAction } from "../actions";
import { faqItemFormSchema, type FaqItemFormInput, type FaqItemFormValues } from "../validations";
import type { AdminFaqItem } from "../types";

export function FaqItemForm({ faqItem }: { faqItem?: AdminFaqItem }) {
  const router = useRouter();
  const isEdit = !!faqItem;

  const form = useForm<FaqItemFormInput, unknown, FaqItemFormValues>({
    resolver: zodResolver(faqItemFormSchema),
    defaultValues: {
      question: faqItem?.question ?? "",
      answer: faqItem?.answer ?? "",
      category: faqItem?.category ?? "",
      isActive: faqItem?.isActive ?? true,
    },
  });

  async function onSubmit(values: FaqItemFormValues) {
    try {
      if (isEdit && faqItem) {
        await updateFaqItemAction(faqItem.id, values);
        toast.success("FAQ updated.");
      } else {
        await createFaqItemAction(values);
        toast.success("FAQ created.");
      }
      router.push("/admin/faqs");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Couldn't save this FAQ.");
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        noValidate
        className="flex max-w-lg flex-col gap-4"
      >
        <FormField
          control={form.control}
          name="question"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Question</FormLabel>
              <FormControl>
                <Input {...field} placeholder="What areas do you deliver to?" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="answer"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Answer</FormLabel>
              <FormControl>
                <textarea
                  {...field}
                  rows={4}
                  placeholder="Write the answer..."
                  className="border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 w-full rounded-lg border bg-transparent px-2.5 py-1.5 text-sm outline-none focus-visible:ring-3"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category (optional)</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Ordering, Delivery, Payment…" />
              </FormControl>
              <FormDescription>
                Groups questions on the /faq page. Left blank, it just shows in the flat homepage
                list.
              </FormDescription>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="isActive"
          render={({ field }) => (
            <label className="flex items-center gap-2 text-sm">
              <Checkbox checked={field.value} onCheckedChange={field.onChange} />
              Active — shown to customers
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
          {form.formState.isSubmitting ? "Saving…" : isEdit ? "Save Changes" : "Create FAQ"}
        </Button>
      </form>
    </Form>
  );
}
