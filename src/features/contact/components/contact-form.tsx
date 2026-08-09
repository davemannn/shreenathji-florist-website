"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { sendContactMessageAction } from "../actions";
import { contactMessageSchema, type ContactMessageValues } from "../validations";

export function ContactForm({
  messagePlaceholder = "How can we help?",
}: {
  messagePlaceholder?: string;
}) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactMessageValues>({
    resolver: zodResolver(contactMessageSchema),
    defaultValues: { name: "", email: "", phone: "", message: "" },
  });

  async function onSubmit(values: ContactMessageValues) {
    try {
      await sendContactMessageAction(values);
      toast.success("Message sent — we'll get back to you shortly.");
      reset();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Couldn't send your message.");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="name">Name</Label>
          <Input id="name" aria-invalid={!!errors.name} {...register("name")} />
          {errors.name ? <p className="text-destructive text-xs">{errors.name.message}</p> : null}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="phone">Phone (optional)</Label>
          <Input id="phone" {...register("phone")} />
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" aria-invalid={!!errors.email} {...register("email")} />
        {errors.email ? <p className="text-destructive text-xs">{errors.email.message}</p> : null}
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="message">Message</Label>
        <textarea
          id="message"
          rows={5}
          className="border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 w-full rounded-lg border bg-transparent px-2.5 py-1.5 text-sm outline-none focus-visible:ring-3"
          placeholder={messagePlaceholder}
          aria-invalid={!!errors.message}
          {...register("message")}
        />
        {errors.message ? (
          <p className="text-destructive text-xs">{errors.message.message}</p>
        ) : null}
      </div>
      <Button
        type="submit"
        variant="brand"
        size="lg"
        disabled={isSubmitting}
        className="self-start"
      >
        {isSubmitting ? "Sending…" : "Send Message"}
      </Button>
    </form>
  );
}
