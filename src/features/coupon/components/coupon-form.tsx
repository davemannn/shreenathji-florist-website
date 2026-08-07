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
import { createCouponAction, updateCouponAction } from "../actions";
import { couponFormSchema, type CouponFormInput, type CouponFormValues } from "../validations";
import type { AdminCoupon } from "../types";

const DISCOUNT_TYPE_OPTIONS = [
  { value: "PERCENT", label: "Percentage off" },
  { value: "FLAT", label: "Flat amount off (₹)" },
];

export function CouponForm({ coupon }: { coupon?: AdminCoupon }) {
  const router = useRouter();
  const isEdit = !!coupon;

  const form = useForm<CouponFormInput, unknown, CouponFormValues>({
    resolver: zodResolver(couponFormSchema),
    defaultValues: {
      code: coupon?.code ?? "",
      description: coupon?.description ?? "",
      discountType: coupon?.discountType ?? "PERCENT",
      discountValue: coupon?.discountValue ?? 10,
      minOrderValue: coupon?.minOrderValue,
      maxDiscount: coupon?.maxDiscount,
      expiresAt: coupon?.expiresAt ? coupon.expiresAt.slice(0, 10) : "",
      isActive: coupon?.isActive ?? true,
      usageLimit: coupon?.usageLimit,
    },
  });

  async function onSubmit(values: CouponFormValues) {
    try {
      if (isEdit && coupon) {
        await updateCouponAction(coupon.id, values);
        toast.success("Coupon updated.");
      } else {
        await createCouponAction(values);
        toast.success("Coupon created.");
      }
      router.push("/admin/coupons");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Couldn't save this coupon.");
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
          name="code"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Code</FormLabel>
              <FormControl>
                <Input {...field} placeholder="WELCOME10" className="uppercase" />
              </FormControl>
              <FormDescription>
                What the customer types at checkout — always stored uppercase.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description (internal, optional)</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Diwali launch promo" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="discountType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Discount type</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue>
                      {(value: string) =>
                        DISCOUNT_TYPE_OPTIONS.find((o) => o.value === value)?.label
                      }
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {DISCOUNT_TYPE_OPTIONS.map((option) => (
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
            name="discountValue"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Value</FormLabel>
                <FormControl>
                  <Input type="number" {...field} value={field.value as number} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="minOrderValue"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Minimum order (₹, optional)</FormLabel>
                <FormControl>
                  <Input type="number" {...field} value={(field.value as number) ?? ""} />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="maxDiscount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Max discount (₹, optional)</FormLabel>
                <FormControl>
                  <Input type="number" {...field} value={(field.value as number) ?? ""} />
                </FormControl>
                <FormDescription>
                  Caps a percentage discount — ignored for flat-amount coupons.
                </FormDescription>
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="expiresAt"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Expires (optional)</FormLabel>
                <FormControl>
                  <Input type="date" {...field} value={field.value ?? ""} />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="usageLimit"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Total uses allowed (optional)</FormLabel>
                <FormControl>
                  <Input type="number" {...field} value={(field.value as number) ?? ""} />
                </FormControl>
                <FormDescription>
                  Across all customers combined
                  {coupon ? ` — used ${coupon.usedCount} times so far` : ""}.
                </FormDescription>
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="isActive"
          render={({ field }) => (
            <label className="flex items-center gap-2 text-sm">
              <Checkbox checked={field.value} onCheckedChange={field.onChange} />
              Active
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
          {form.formState.isSubmitting ? "Saving…" : isEdit ? "Save Changes" : "Create Coupon"}
        </Button>
      </form>
    </Form>
  );
}
