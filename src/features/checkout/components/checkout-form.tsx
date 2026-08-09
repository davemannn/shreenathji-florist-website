"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useCartStore } from "@/stores/cart-store";
import { tomorrowIsoIst, type HolidayInfo } from "@/lib/delivery";
import { haversineDistanceKm } from "@/lib/geo";
import type { StoreSettings } from "@/features/settings/types";
import { checkoutSchema, type CheckoutValues } from "../validations";
import { placeOrderAction, verifyRazorpayPaymentAction } from "../actions";
import { openRazorpayCheckout } from "@/lib/razorpay-checkout";
import { useCheckoutTotals } from "../hooks/use-checkout-totals";
import { AddressSection } from "./address-section";
import { DeliverySection } from "./delivery-section";
import { PaymentSection } from "./payment-section";
import { OrderSummary } from "./order-summary";
import { DeliveryServiceabilityNotice } from "./delivery-serviceability-notice";
import type { DeliverySlotOption, SavedAddress } from "../types";

interface CheckoutFormProps {
  addresses: SavedAddress[];
  deliverySlots: DeliverySlotOption[];
  storeSettings: StoreSettings;
  holidays: HolidayInfo[];
  walletBalance: number;
}

export function CheckoutForm({
  addresses,
  deliverySlots,
  storeSettings,
  holidays,
  walletBalance,
}: CheckoutFormProps) {
  const router = useRouter();
  const items = useCartStore((state) => state.items);
  const appliedCoupon = useCartStore((state) => state.appliedCoupon);
  const clearCart = useCartStore((state) => state.clear);
  const [submitting, setSubmitting] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  // Same hydration-safety pattern as CartView — cart state is localStorage-backed.
  useEffect(() => setHydrated(true), []);

  useEffect(() => {
    // `submitting` stays true through the whole successful-order path (it's
    // only reset to false on error) — guards against this firing and
    // racing the post-order clearCart() + redirect to /order-success.
    if (hydrated && !submitting && items.length === 0) {
      router.replace("/cart");
    }
  }, [hydrated, submitting, items.length, router]);

  const defaultAddress = addresses.find((address) => address.isDefault) ?? addresses[0];
  // Standard delivery isn't bookable for today (see lib/delivery.ts), so the
  // sensible default pairing is tomorrow + Standard rather than today +
  // whatever slot happens to sort first.
  const defaultSlot = deliverySlots.find((slot) => slot.type === "NORMAL") ?? deliverySlots[0];

  const methods = useForm<CheckoutValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      recipientName: defaultAddress?.recipientName ?? "",
      recipientPhone: defaultAddress?.recipientPhone ?? "",
      line1: defaultAddress?.line1 ?? "",
      line2: defaultAddress?.line2 ?? "",
      city: defaultAddress?.city ?? "",
      state: defaultAddress?.state ?? "",
      pincode: defaultAddress?.pincode ?? "",
      latitude: defaultAddress?.latitude,
      longitude: defaultAddress?.longitude,
      deliveryDate: tomorrowIsoIst(),
      deliverySlotId: defaultSlot?.id,
      messageCard: "",
      giftWrap: false,
      // Opt-in, not on by default — using wallet balance is a deliberate
      // choice, not something that should silently apply itself.
      useWallet: false,
      // Default to whichever method is actually enabled — COD is preferred
      // when both are on, but if it's been disabled Razorpay must be picked
      // instead so the form doesn't start on an unselectable option.
      paymentMethod: storeSettings.codEnabled ? "COD" : "RAZORPAY",
    },
  });

  const totals = useCheckoutTotals(methods.watch, deliverySlots, storeSettings, walletBalance);

  // Only computable when BOTH the address has a geocode (set via the Places
  // autocomplete — see address-section.tsx) and the admin has configured a
  // store location; otherwise there's nothing to check and checkout
  // proceeds normally. Re-checked server-side regardless (order.service.ts)
  // — this is purely so the customer sees the problem before paying.
  const addressLatitude = methods.watch("latitude");
  const addressLongitude = methods.watch("longitude");
  const distanceKm =
    addressLatitude != null &&
    addressLongitude != null &&
    storeSettings.storeLatitude != null &&
    storeSettings.storeLongitude != null
      ? haversineDistanceKm(
          storeSettings.storeLatitude,
          storeSettings.storeLongitude,
          addressLatitude,
          addressLongitude,
        )
      : null;
  const outsideServiceArea = distanceKm != null && distanceKm > storeSettings.deliveryRadiusKm;

  async function onSubmit(values: CheckoutValues) {
    if (items.length === 0) {
      toast.error("Your cart is empty.");
      return;
    }
    if (outsideServiceArea) {
      toast.error("This address is outside our delivery area.");
      return;
    }

    setSubmitting(true);
    try {
      const result = await placeOrderAction({
        items: items.map((item) => ({
          productId: item.productId,
          variantId: item.variantId,
          productTitle: item.productTitle,
          variantLabel: item.variantLabel,
          imageUrl: item.imageUrl,
          price: item.price,
          quantity: item.quantity,
        })),
        recipientName: values.recipientName,
        recipientPhone: values.recipientPhone,
        line1: values.line1,
        line2: values.line2,
        city: values.city,
        state: values.state,
        pincode: values.pincode,
        latitude: values.latitude,
        longitude: values.longitude,
        deliveryDate: values.deliveryDate,
        deliverySlotId: values.deliverySlotId,
        messageCard: values.messageCard,
        giftWrap: values.giftWrap,
        couponCode: appliedCoupon?.code,
        useWallet: values.useWallet,
        paymentMethod: values.paymentMethod,
      });

      if (result.razorpay) {
        await openRazorpayCheckout({
          keyId: result.razorpay.keyId,
          amount: Number(result.razorpay.amount),
          razorpayOrderId: result.razorpay.orderId,
          recipientName: values.recipientName,
          recipientPhone: values.recipientPhone,
          onSuccess: async (response) => {
            try {
              await verifyRazorpayPaymentAction({
                orderId: result.orderId,
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              });
              clearCart();
              router.push(`/order-success/${result.orderNumber}`);
            } catch (error) {
              toast.error(error instanceof Error ? error.message : "Payment verification failed.");
              setSubmitting(false);
            }
          },
          onDismiss: () => {
            toast.info(
              "Payment cancelled. Your order is saved as pending — you can retry from your account.",
            );
            setSubmitting(false);
          },
        });
      } else {
        clearCart();
        router.push(`/order-success/${result.orderNumber}`);
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Something went wrong. Please try again.",
      );
      setSubmitting(false);
    }
  }

  if (!hydrated || items.length === 0) return null;

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={methods.handleSubmit(onSubmit)}
        className="grid gap-10 lg:grid-cols-[1fr_360px]"
      >
        <div className="flex flex-col gap-8">
          <AddressSection addresses={addresses} />
          <DeliverySection
            deliverySlots={deliverySlots}
            storeSettings={storeSettings}
            holidays={holidays}
          />
          {outsideServiceArea && distanceKm != null ? (
            <DeliveryServiceabilityNotice
              distanceKm={distanceKm}
              radiusKm={storeSettings.deliveryRadiusKm}
            />
          ) : totals.remainingTotal > 0 ? (
            <PaymentSection
              codEnabled={storeSettings.codEnabled}
              razorpayEnabled={storeSettings.razorpayEnabled}
            />
          ) : (
            <section>
              <h2 className="mb-2 text-lg font-semibold">Payment Method</h2>
              <p className="border-brand bg-brand/5 text-muted-foreground rounded-xs border px-4 py-3 text-sm">
                Your wallet balance covers this order in full — no payment needed.
              </p>
            </section>
          )}
        </div>
        <OrderSummary totals={totals} submitting={submitting} blocked={outsideServiceArea} />
      </form>
    </FormProvider>
  );
}
