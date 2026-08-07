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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createDeliverySlotAction, updateDeliverySlotAction } from "../actions";
import {
  deliverySlotFormSchema,
  type DeliverySlotFormInput,
  type DeliverySlotFormValues,
} from "../validations";
import type { AdminDeliverySlot } from "../types";

const TYPE_OPTIONS = [
  { value: "NORMAL", label: "Standard (next day onward)" },
  { value: "FIXED", label: "Express / Instant (always bookable)" },
  { value: "MIDNIGHT", label: "Midnight (today only, before cutoff)" },
];

const TYPE_HINTS: Record<string, string> = {
  NORMAL: "Not bookable for today — only from tomorrow onward.",
  FIXED:
    "Always bookable, including today. Automatically carries Midnight pricing if booked same-day after the cutoff hour.",
  MIDNIGHT: "Only bookable for today, and only before the cutoff hour.",
};

export function DeliverySlotForm({ slot }: { slot?: AdminDeliverySlot }) {
  const router = useRouter();
  const isEdit = !!slot;

  const form = useForm<DeliverySlotFormInput, unknown, DeliverySlotFormValues>({
    resolver: zodResolver(deliverySlotFormSchema),
    defaultValues: {
      label: slot?.label ?? "",
      type: slot?.type ?? "NORMAL",
      extraCharge: slot?.extraCharge ?? 0,
      isActive: slot?.isActive ?? true,
    },
  });

  async function onSubmit(values: DeliverySlotFormValues) {
    try {
      if (isEdit && slot) {
        await updateDeliverySlotAction(slot.id, values);
        toast.success("Delivery slot updated.");
      } else {
        await createDeliverySlotAction(values);
        toast.success("Delivery slot created.");
      }
      router.push("/admin/delivery-slots");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Couldn't save this delivery slot.");
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
          name="label"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Label</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Standard Delivery" />
              </FormControl>
              <FormDescription>Shown to customers at checkout.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Type</FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className="w-full">
                  <SelectValue>
                    {(value: string) => TYPE_OPTIONS.find((o) => o.value === value)?.label}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {TYPE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>{TYPE_HINTS[field.value]}</FormDescription>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="extraCharge"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Extra charge (₹)</FormLabel>
              <FormControl>
                <Input type="number" {...field} value={field.value as number} className="w-32" />
              </FormControl>
              <FormDescription>Added on top of the base delivery charge.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="isActive"
          render={({ field }) => (
            <label className="flex items-center gap-2 text-sm">
              <Checkbox checked={field.value} onCheckedChange={field.onChange} />
              Active — bookable at checkout
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
          {form.formState.isSubmitting
            ? "Saving…"
            : isEdit
              ? "Save Changes"
              : "Create Delivery Slot"}
        </Button>
      </form>
    </Form>
  );
}
