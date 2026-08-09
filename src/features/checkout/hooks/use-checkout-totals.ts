import type { UseFormWatch } from "react-hook-form";
import { useCartStore } from "@/stores/cart-store";
import { effectiveSlotCharge, todayIsoIst } from "@/lib/delivery";
import type { StoreSettings } from "@/features/settings/types";
import type { CheckoutValues } from "../validations";
import type { DeliverySlotOption } from "../types";

export interface CheckoutTotals {
  subtotal: number;
  discount: number;
  deliveryCharge: number;
  /** What's due before any wallet balance is applied. */
  total: number;
  walletBalance: number;
  /** 0 unless the "use wallet balance" checkbox is on — capped at `total`, never more. */
  walletAmountUsed: number;
  /** What's still owed via COD/Razorpay after wallet — 0 means the order is fully wallet-covered. */
  remainingTotal: number;
}

/**
 * Single computation shared by OrderSummary (renders these numbers) and
 * CheckoutForm (decides whether Payment Method needs to be shown at all) —
 * so the two can never disagree about what's actually owed. Takes `watch`
 * directly rather than calling useFormContext itself, since CheckoutForm
 * (the FormProvider itself) can't consume its own context — it already has
 * `methods.watch` in hand instead.
 */
export function useCheckoutTotals(
  watch: UseFormWatch<CheckoutValues>,
  deliverySlots: DeliverySlotOption[],
  storeSettings: StoreSettings,
  walletBalance: number,
): CheckoutTotals {
  const items = useCartStore((state) => state.items);
  const appliedCoupon = useCartStore((state) => state.appliedCoupon);
  const selectedSlotId = watch("deliverySlotId");
  const deliveryDate = watch("deliveryDate");
  const useWallet = watch("useWallet");

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discount = appliedCoupon?.discount ?? 0;
  const afterDiscount = subtotal - discount;

  const selectedSlot = deliverySlots.find((slot) => slot.id === selectedSlotId);
  // The real Midnight surcharge lives on the Midnight DeliverySlot itself —
  // see lib/delivery.ts / order.service.ts.
  const midnightCharge = deliverySlots.find((slot) => slot.type === "MIDNIGHT")?.extraCharge ?? 0;
  // Express/Instant is always "today" regardless of the date field (it's
  // hidden once selected) — everything else prices off the picked date.
  const slotCharge = selectedSlot
    ? effectiveSlotCharge(
        selectedSlot.type,
        selectedSlot.type === "FIXED" ? todayIsoIst() : deliveryDate,
        selectedSlot.extraCharge,
        undefined,
        storeSettings.midnightCutoffHour,
        midnightCharge,
      )
    : 0;
  const baseCharge =
    afterDiscount >= storeSettings.freeDeliveryThreshold ? 0 : storeSettings.baseDeliveryCharge;
  const deliveryCharge = baseCharge + slotCharge;

  const total = afterDiscount + deliveryCharge;
  const walletAmountUsed = useWallet ? Math.min(walletBalance, total) : 0;
  const remainingTotal = total - walletAmountUsed;

  return {
    subtotal,
    discount,
    deliveryCharge,
    total,
    walletBalance,
    walletAmountUsed,
    remainingTotal,
  };
}
