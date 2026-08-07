"use client";

import { useEffect } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { Zap } from "lucide-react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { formatINR } from "@/lib/format";
import {
  effectiveSlotCharge,
  expressDisplayLabel,
  isSlotAvailable,
  nowInIst,
  todayIsoIst,
  type DeliverySlotType,
} from "@/lib/delivery";
import type { StoreSettings } from "@/features/settings/types";
import { DeliveryDatePicker } from "./delivery-date-picker";
import type { CheckoutValues } from "../validations";
import type { DeliverySlotOption } from "../types";

function unavailableReason(type: DeliverySlotType, cutoffHour: number): string {
  if (type === "NORMAL") return "Not available for same-day — pick Instant or Midnight instead.";
  if (type === "MIDNIGHT") {
    const label = cutoffHour > 12 ? `${cutoffHour - 12} PM` : `${cutoffHour} AM`;
    return `Booking for tonight closes at ${label} — pick a future date or go Instant.`;
  }
  return "";
}

interface DeliverySectionProps {
  deliverySlots: DeliverySlotOption[];
  storeSettings: StoreSettings;
}

export function DeliverySection({ deliverySlots, storeSettings }: DeliverySectionProps) {
  const { control, register, watch, setValue } = useFormContext<CheckoutValues>();
  const { midnightCutoffHour, midnightCharge } = storeSettings;
  const now = nowInIst();
  const selectedDate = watch("deliveryDate");
  const selectedSlotId = watch("deliverySlotId");
  const selectedSlot = deliverySlots.find((slot) => slot.id === selectedSlotId);
  const expressSlot = deliverySlots.find((slot) => slot.type === "FIXED");
  const isExpressSelected = selectedSlot?.type === "FIXED";

  // If the date changes out from under a Standard/Midnight selection and
  // makes it invalid (e.g. switching to "Today" while Standard was picked),
  // clear it so the user re-picks a slot that's actually bookable.
  useEffect(() => {
    if (
      selectedSlot &&
      selectedSlot.type !== "FIXED" &&
      !isSlotAvailable(selectedSlot.type, selectedDate, undefined, midnightCutoffHour)
    ) {
      setValue("deliverySlotId", undefined);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate]);

  return (
    <section>
      <h2 className="mb-4 text-lg font-semibold">Delivery Details</h2>

      <div className="flex flex-col gap-4">
        {isExpressSelected && expressSlot ? (
          <div className="border-brand bg-brand/5 flex items-center justify-between rounded-xs border px-4 py-3">
            <div className="flex items-center gap-3">
              <Zap className="text-brand size-5 shrink-0" aria-hidden="true" />
              <div>
                <p className="text-sm font-medium">
                  {expressDisplayLabel(now, midnightCutoffHour)}
                </p>
                <p className="text-muted-foreground text-xs">
                  {formatINR(
                    effectiveSlotCharge(
                      "FIXED",
                      todayIsoIst(),
                      expressSlot.extraCharge,
                      now,
                      midnightCutoffHour,
                      midnightCharge,
                    ),
                  )}{" "}
                  · delivering today
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setValue("deliverySlotId", undefined)}
              className="text-brand text-xs font-medium underline underline-offset-2"
            >
              Change
            </button>
          </div>
        ) : (
          <>
            <div>
              <Label className="mb-2 block">Delivery Date</Label>
              <Controller
                control={control}
                name="deliveryDate"
                render={({ field }) => (
                  <DeliveryDatePicker value={field.value} onChange={field.onChange} />
                )}
              />
            </div>

            {deliverySlots.length > 0 ? (
              <div>
                <Label className="mb-2 block">Delivery Slot</Label>
                <div className="flex flex-col gap-2">
                  {deliverySlots.map((slot) => {
                    const available = isSlotAvailable(
                      slot.type,
                      selectedDate,
                      now,
                      midnightCutoffHour,
                    );
                    const isExpress = slot.type === "FIXED";
                    const charge = isExpress
                      ? effectiveSlotCharge(
                          "FIXED",
                          todayIsoIst(),
                          slot.extraCharge,
                          now,
                          midnightCutoffHour,
                          midnightCharge,
                        )
                      : slot.extraCharge;
                    const label = isExpress
                      ? expressDisplayLabel(now, midnightCutoffHour)
                      : slot.label;

                    return (
                      <button
                        key={slot.id}
                        type="button"
                        disabled={!available}
                        onClick={() => {
                          setValue("deliverySlotId", slot.id);
                          if (isExpress) setValue("deliveryDate", todayIsoIst());
                        }}
                        className={cn(
                          "flex items-center justify-between rounded-xs border px-4 py-2.5 text-left text-sm",
                          !available && "cursor-not-allowed opacity-50",
                          available && selectedSlotId === slot.id
                            ? "border-brand bg-brand/10"
                            : available && "border-border hover:bg-muted",
                        )}
                      >
                        <span className="flex items-center gap-1.5">
                          {isExpress ? (
                            <Zap className="text-brand size-3.5 shrink-0" aria-hidden="true" />
                          ) : null}
                          {label}
                        </span>
                        {available ? (
                          <span className="text-muted-foreground">
                            {charge > 0 ? `+${formatINR(charge)}` : "Free"}
                          </span>
                        ) : (
                          <span className="text-muted-foreground text-xs">
                            {unavailableReason(slot.type, midnightCutoffHour)}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : null}
          </>
        )}

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="messageCard">Message Card (optional)</Label>
          <textarea
            id="messageCard"
            rows={3}
            maxLength={300}
            className="border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 w-full rounded-lg border bg-transparent px-2.5 py-1.5 text-sm outline-none focus-visible:ring-3"
            placeholder="Write a short message for the recipient..."
            {...register("messageCard")}
          />
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" className="accent-brand size-4" {...register("giftWrap")} />
          Add gift wrap
        </label>
      </div>
    </section>
  );
}
