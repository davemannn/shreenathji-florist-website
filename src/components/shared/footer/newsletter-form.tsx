"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { subscribeToNewsletterAction } from "@/features/newsletter/actions";
import {
  newsletterSubscribeSchema,
  type NewsletterSubscribeValues,
} from "@/features/newsletter/validations";

// shadcn's registered `form` component has no implementation yet for the
// "base-nova" style (empty registry stub) — this wires react-hook-form + zod
// directly against the plain Input/Label primitives instead of waiting on it.
export function NewsletterForm() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<NewsletterSubscribeValues>({
    resolver: zodResolver(newsletterSubscribeSchema),
    defaultValues: { email: "" },
  });

  async function onSubmit(values: NewsletterSubscribeValues) {
    try {
      await subscribeToNewsletterAction(values);
      toast.success("Almost there — check your inbox to confirm.");
      reset();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Couldn't subscribe right now.");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-2 sm:flex-row">
      <div className="flex-1">
        <Label htmlFor="newsletter-email" className="sr-only">
          Email address
        </Label>
        <Input
          id="newsletter-email"
          type="email"
          placeholder="Your email address"
          className="bg-background/10 border-background/30 text-background placeholder:text-background/50 h-10"
          aria-invalid={!!errors.email}
          {...register("email")}
        />
        {errors.email ? <p className="mt-1 text-xs text-red-300">{errors.email.message}</p> : null}
      </div>
      <Button type="submit" variant="brand" disabled={isSubmitting} className="h-10 shrink-0">
        {isSubmitting ? "Subscribing…" : "Subscribe"}
      </Button>
    </form>
  );
}
