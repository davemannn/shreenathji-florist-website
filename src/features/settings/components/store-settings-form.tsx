"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
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
    defaultValues: {
      ...settings,
      // Default optional string fields to "" (not undefined) so these stay
      // controlled inputs from the first render — an undefined defaultValue
      // would otherwise flip an input from uncontrolled to controlled the
      // moment the user types, which React (and Base UI's Input) warn about.
      gstin: settings.gstin ?? "",
      legalBusinessName: settings.legalBusinessName ?? "",
      registeredAddressLine: settings.registeredAddressLine ?? "",
      registeredCity: settings.registeredCity ?? "",
      registeredPincode: settings.registeredPincode ?? "",
    },
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

        <Separator className="my-2" />
        <div>
          <h2 className="text-sm font-semibold">Tax (GST)</h2>
          <p className="text-muted-foreground text-xs">
            Used on invoices and in the Tax report. Prices shown to customers already include GST —
            these fields only control how that&rsquo;s broken out, not what anyone pays.
          </p>
        </div>

        <FormField
          control={form.control}
          name="gstin"
          render={({ field }) => (
            <FormItem>
              <FormLabel>GSTIN</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="24AAAAA0000A1Z5"
                  className="uppercase"
                  disabled={readOnly}
                />
              </FormControl>
              <FormDescription>
                Leave blank if not GST-registered — invoices then omit the GST block entirely
                instead of showing a blank number.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="legalBusinessName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Legal business name (optional)</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Shreenathji Florist" disabled={readOnly} />
              </FormControl>
              <FormDescription>Shown on invoices if different from the site name.</FormDescription>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="registeredAddressLine"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Registered address (optional)</FormLabel>
              <FormControl>
                <Input {...field} disabled={readOnly} />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="grid grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="registeredCity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>City</FormLabel>
                <FormControl>
                  <Input {...field} disabled={readOnly} />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="registeredState"
            render={({ field }) => (
              <FormItem>
                <FormLabel>State</FormLabel>
                <FormControl>
                  <Input {...field} disabled={readOnly} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="registeredPincode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Pincode</FormLabel>
                <FormControl>
                  <Input {...field} disabled={readOnly} />
                </FormControl>
              </FormItem>
            )}
          />
        </div>
        <FormDescription className="-mt-2">
          Compared against each order&rsquo;s delivery state to decide CGST+SGST (same state) vs.
          IGST (different state) on invoices.
        </FormDescription>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="defaultGstRate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Default GST rate (%)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    value={field.value as number}
                    disabled={readOnly}
                  />
                </FormControl>
                <FormDescription>
                  Used only if a product&rsquo;s category has no rate set — configure real rates per
                  category instead.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="invoicePrefix"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Invoice number prefix</FormLabel>
                <FormControl>
                  <Input {...field} className="uppercase" disabled={readOnly} />
                </FormControl>
                <FormDescription>e.g. &ldquo;SF&rdquo; → SF/2526/000001.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

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
