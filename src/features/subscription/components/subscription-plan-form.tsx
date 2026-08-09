"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
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
  FormMessage,
} from "@/components/ui/form";
import { CloudinaryUploader } from "@/components/shared/cloudinary-uploader";
import { createSubscriptionPlanAction, updateSubscriptionPlanAction } from "../actions";
import {
  subscriptionPlanFormSchema,
  type SubscriptionPlanFormInput,
  type SubscriptionPlanFormValues,
} from "../validations";
import type { AdminSubscriptionPlan, BillingInterval, SubscriptionPlanCategory } from "../types";

const CATEGORY_OPTIONS: { value: SubscriptionPlanCategory; label: string }[] = [
  { value: "DAILY_POOJA", label: "Daily Pooja Flowers" },
  { value: "WEEKLY_FLOWERS", label: "Weekly Fresh Flowers" },
  { value: "RAW_FLOWERS", label: "Raw Flowers (bulk)" },
  { value: "CUSTOM", label: "Custom" },
];

const INTERVAL_ROWS: {
  interval: BillingInterval;
  label: string;
  enabledKey: "weeklyEnabled" | "monthlyEnabled" | "annualEnabled";
  priceKey: "weeklyPrice" | "monthlyPrice" | "annualPrice";
  discountKey: "weeklyDiscountPercent" | "monthlyDiscountPercent" | "annualDiscountPercent";
}[] = [
  {
    interval: "WEEKLY",
    label: "Weekly",
    enabledKey: "weeklyEnabled",
    priceKey: "weeklyPrice",
    discountKey: "weeklyDiscountPercent",
  },
  {
    interval: "MONTHLY",
    label: "Monthly",
    enabledKey: "monthlyEnabled",
    priceKey: "monthlyPrice",
    discountKey: "monthlyDiscountPercent",
  },
  {
    interval: "ANNUAL",
    label: "Annual",
    enabledKey: "annualEnabled",
    priceKey: "annualPrice",
    discountKey: "annualDiscountPercent",
  },
];

function intervalDefaults(plan: AdminSubscriptionPlan | undefined, interval: BillingInterval) {
  const existing = plan?.intervals.find((i) => i.interval === interval);
  return {
    enabled: !!existing,
    price: existing?.price ?? 0,
    discountPercent: existing?.discountPercent ?? 0,
  };
}

export function SubscriptionPlanForm({ plan }: { plan?: AdminSubscriptionPlan }) {
  const router = useRouter();
  const isEdit = !!plan;

  const weekly = intervalDefaults(plan, "WEEKLY");
  const monthly = intervalDefaults(plan, "MONTHLY");
  const annual = intervalDefaults(plan, "ANNUAL");

  const form = useForm<SubscriptionPlanFormInput, unknown, SubscriptionPlanFormValues>({
    resolver: zodResolver(subscriptionPlanFormSchema),
    defaultValues: {
      name: plan?.name ?? "",
      description: plan?.description ?? "",
      category: plan?.category ?? "CUSTOM",
      imageUrl: plan?.imageUrl ?? "",
      isActive: plan?.isActive ?? true,
      weeklyEnabled: weekly.enabled,
      weeklyPrice: weekly.price,
      weeklyDiscountPercent: weekly.discountPercent,
      monthlyEnabled: monthly.enabled,
      monthlyPrice: monthly.price,
      monthlyDiscountPercent: monthly.discountPercent,
      annualEnabled: annual.enabled,
      annualPrice: annual.price,
      annualDiscountPercent: annual.discountPercent,
    },
  });

  async function onSubmit(values: SubscriptionPlanFormValues) {
    if (!values.weeklyEnabled && !values.monthlyEnabled && !values.annualEnabled) {
      toast.error("Enable at least one billing interval.");
      return;
    }
    try {
      if (isEdit && plan) {
        await updateSubscriptionPlanAction(plan.id, values);
        toast.success("Subscription plan updated.");
      } else {
        await createSubscriptionPlanAction(values);
        toast.success("Subscription plan created.");
      }
      router.push("/admin/subscriptions/plans");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Couldn't save this plan.");
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
          name="imageUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Image (optional)</FormLabel>
              <FormControl>
                <CloudinaryUploader
                  folder="subscriptions"
                  value={field.value}
                  onChange={(url) => field.onChange(url)}
                  onRemove={() => field.onChange("")}
                  triggerLabel="Upload Image"
                />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Daily Pooja Flowers" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <textarea
                  {...field}
                  rows={3}
                  placeholder="Fresh flowers for your daily pooja, delivered to your door every morning."
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
              <FormLabel>Category</FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className="w-full">
                  <SelectValue>
                    {(value: string) => CATEGORY_OPTIONS.find((o) => o.value === value)?.label}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {CATEGORY_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
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
              Active — shown on the storefront
            </label>
          )}
        />

        <Separator className="my-2" />
        <div>
          <h2 className="text-sm font-semibold">Billing Intervals & Pricing</h2>
          <p className="text-muted-foreground text-xs">
            Enable at least one. Changing a price mints a fresh Razorpay Plan behind the scenes
            (Razorpay Plans can&rsquo;t be edited in place) — existing subscribers keep their
            original price until they resubscribe.
          </p>
        </div>

        {INTERVAL_ROWS.map((row) => (
          <div
            key={row.interval}
            className="border-border flex flex-col gap-2 rounded-xs border p-3"
          >
            <FormField
              control={form.control}
              name={row.enabledKey}
              render={({ field }) => (
                <label className="flex items-center gap-2 text-sm font-medium">
                  <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  {row.label}
                </label>
              )}
            />
            <div className="grid grid-cols-2 gap-3 pl-6">
              <FormField
                control={form.control}
                name={row.priceKey}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Price (₹ per cycle)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} value={field.value as number} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={row.discountKey}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Discount % (display only)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} value={field.value as number} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        ))}

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
              : "Create Subscription Plan"}
        </Button>
      </form>
    </Form>
  );
}
