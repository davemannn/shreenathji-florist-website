"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import {
  PlaceAutocompleteInput,
  type PlaceResult,
} from "@/components/shared/place-autocomplete-input";
import { isGoogleMapsConfigured } from "@/lib/google-maps";
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

  const storeLatitude = form.watch("storeLatitude") as number | undefined;
  const storeLongitude = form.watch("storeLongitude") as number | undefined;

  function handleStoreLocationSelected(place: PlaceResult) {
    form.setValue("storeLatitude", place.latitude, { shouldDirty: true });
    form.setValue("storeLongitude", place.longitude, { shouldDirty: true });
  }

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

        <p className="bg-muted text-muted-foreground -mt-1 rounded-md p-3 text-xs">
          Express/Instant and Midnight each have their own ₹ surcharge, set per-slot on the{" "}
          <Link href="/admin/delivery-slots" className="text-brand underline underline-offset-2">
            Delivery Slots
          </Link>{" "}
          page — not here. Whatever a slot is set to is both what gets charged at checkout and
          what&rsquo;s advertised on its marketing page, so there&rsquo;s only one number to keep in
          sync.
        </p>

        <Separator className="my-2" />
        <div>
          <h2 className="text-sm font-semibold">Delivery Area</h2>
          <p className="text-muted-foreground text-xs">
            Checkout warns (and blocks placing the order) when a customer&rsquo;s address — picked
            via the map search, not a manually-typed one — is farther than this from the store.
            Skipped entirely until a store location is set below.
          </p>
        </div>

        {!isGoogleMapsConfigured() ? (
          <p className="bg-muted text-muted-foreground rounded-md p-3 text-xs">
            Map search isn&rsquo;t configured yet (missing{" "}
            <code className="font-mono">NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code>) — the delivery-area
            check stays off until a store location is set, which currently requires that key.
          </p>
        ) : (
          <PlaceAutocompleteInput
            label="Store location"
            placeholder="Search for the store's address…"
            onSelect={handleStoreLocationSelected}
            disabled={readOnly}
          />
        )}
        {storeLatitude != null && storeLongitude != null ? (
          <p className="text-muted-foreground -mt-2 text-xs">
            Set: {storeLatitude.toFixed(5)}, {storeLongitude.toFixed(5)}
          </p>
        ) : null}

        <FormField
          control={form.control}
          name="deliveryRadiusKm"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Delivery radius (km)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  {...field}
                  value={field.value as number}
                  disabled={readOnly}
                  className="max-w-32"
                />
              </FormControl>
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
                <Input {...field} placeholder="Shrinathji Florist" disabled={readOnly} />
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
        <p className="text-muted-foreground -mt-2 text-xs">
          Compared against each order&rsquo;s delivery state to decide CGST+SGST (same state) vs.
          IGST (different state) on invoices.
        </p>

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

        <Separator className="my-2" />
        <div>
          <h2 className="text-sm font-semibold">Payment Methods</h2>
          <p className="text-muted-foreground text-xs">
            Which methods customers can choose at checkout. Credentials stay in server config — this
            only toggles availability.
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <FormField
            control={form.control}
            name="codEnabled"
            render={({ field }) => (
              <label className="flex items-center gap-2 text-sm">
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={readOnly}
                />
                Cash on Delivery
              </label>
            )}
          />
          <FormField
            control={form.control}
            name="razorpayEnabled"
            render={({ field }) => (
              <label className="flex items-center gap-2 text-sm">
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={readOnly}
                />
                Razorpay (UPI, cards, netbanking)
              </label>
            )}
          />
          {form.formState.errors.codEnabled ? (
            <p className="text-destructive text-xs">{form.formState.errors.codEnabled.message}</p>
          ) : null}
        </div>

        <Separator className="my-2" />
        <div>
          <h2 className="text-sm font-semibold">Refer a Friend</h2>
          <p className="text-muted-foreground text-xs">
            ₹ credited to both the referrer&rsquo;s and the new customer&rsquo;s wallet the moment
            the new customer&rsquo;s first order is confirmed.
          </p>
        </div>
        <FormField
          control={form.control}
          name="referralBonusAmount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Referral bonus (₹)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  {...field}
                  value={field.value as number}
                  disabled={readOnly}
                  className="max-w-32"
                />
              </FormControl>
              <FormDescription>Set to 0 to turn the program off.</FormDescription>
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
