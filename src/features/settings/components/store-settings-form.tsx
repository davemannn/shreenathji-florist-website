"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from "@/components/ui/form";
import { updateStoreSettingsAction } from "../actions";
import {
  storeSettingsFormSchema,
  type StoreSettingsFormInput,
  type StoreSettingsFormValues,
} from "../validations";
import type { StoreSettings } from "../types";

export function StoreSettingsForm({
  settings,
  readOnly,
}: {
  settings: StoreSettings;
  readOnly: boolean;
}) {
  const router = useRouter();

  const form = useForm<StoreSettingsFormInput, unknown, StoreSettingsFormValues>({
    resolver: zodResolver(storeSettingsFormSchema),
    defaultValues: settings,
  });

  async function onSubmit(values: StoreSettingsFormValues) {
    try {
      await updateStoreSettingsAction(values);
      toast.success("Settings saved.");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Couldn't save settings.");
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        noValidate
        className="flex max-w-md flex-col gap-4"
      >
        {readOnly ? (
          <p className="text-muted-foreground bg-muted rounded-md p-3 text-xs">
            You have view-only access to settings. Ask an admin to make changes here.
          </p>
        ) : null}

        <FormField
          control={form.control}
          name="baseDeliveryCharge"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Base delivery charge (₹)</FormLabel>
              <FormControl>
                <Input type="number" {...field} value={field.value as number} disabled={readOnly} />
              </FormControl>
              <FormDescription>
                Added to every order that doesn&rsquo;t clear the free-delivery threshold.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="freeDeliveryThreshold"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Free delivery threshold (₹)</FormLabel>
              <FormControl>
                <Input type="number" {...field} value={field.value as number} disabled={readOnly} />
              </FormControl>
              <FormDescription>
                Orders at or above this subtotal skip the base delivery charge.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="midnightCutoffHour"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Midnight booking cutoff (IST hour, 0–23)</FormLabel>
              <FormControl>
                <Input type="number" {...field} value={field.value as number} disabled={readOnly} />
              </FormControl>
              <FormDescription>
                After this hour, same-day Midnight-slot booking closes and Express/Instant starts
                carrying Midnight pricing. 20 = 8 PM.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="expressCharge"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Express / Instant charge (₹)</FormLabel>
              <FormControl>
                <Input type="number" {...field} value={field.value as number} disabled={readOnly} />
              </FormControl>
              <FormDescription>Shown on the Same Day Delivery page.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="midnightCharge"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Midnight delivery charge (₹)</FormLabel>
              <FormControl>
                <Input type="number" {...field} value={field.value as number} disabled={readOnly} />
              </FormControl>
              <FormDescription>
                The Midnight slot&rsquo;s own surcharge, and what Express carries once booked
                same-day past the cutoff above.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {!readOnly ? (
          <Button
            type="submit"
            variant="brand"
            size="lg"
            disabled={form.formState.isSubmitting}
            className="w-fit"
          >
            {form.formState.isSubmitting ? "Saving…" : "Save Settings"}
          </Button>
        ) : null}
      </form>
    </Form>
  );
}
