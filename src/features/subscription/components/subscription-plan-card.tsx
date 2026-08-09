"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { formatINR } from "@/lib/format";
import { SubscribeDialog } from "./subscribe-dialog";
import type { SavedAddress } from "@/features/checkout/types";
import type { SubscriptionPlanDisplay } from "../types";

const INTERVAL_LABEL: Record<string, string> = {
  WEEKLY: "Weekly",
  MONTHLY: "Monthly",
  ANNUAL: "Annual",
};

interface SubscriptionPlanCardProps {
  plan: SubscriptionPlanDisplay;
  defaultAddress?: SavedAddress;
  isSignedIn: boolean;
}

export function SubscriptionPlanCard({
  plan,
  defaultAddress,
  isSignedIn,
}: SubscriptionPlanCardProps) {
  const [selectedIntervalId, setSelectedIntervalId] = useState(plan.intervals[0]?.id);
  const [dialogOpen, setDialogOpen] = useState(false);
  const selectedInterval = plan.intervals.find((i) => i.id === selectedIntervalId);

  return (
    <div className="border-border flex flex-col overflow-hidden rounded-xs border">
      <div className="bg-muted relative aspect-4/3">
        {plan.imageUrl ? (
          <Image src={plan.imageUrl} alt={plan.name} fill className="object-cover" sizes="400px" />
        ) : null}
      </div>
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div>
          <h3 className="font-semibold">{plan.name}</h3>
          <p className="text-muted-foreground mt-1 text-sm leading-relaxed">{plan.description}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          {plan.intervals.map((interval) => (
            <button
              key={interval.id}
              type="button"
              onClick={() => setSelectedIntervalId(interval.id)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs",
                selectedIntervalId === interval.id
                  ? "border-brand bg-brand/10 text-brand font-medium"
                  : "border-border hover:bg-muted",
              )}
            >
              {INTERVAL_LABEL[interval.interval] ?? interval.interval}
              {interval.discountPercent > 0 ? ` · Save ${interval.discountPercent}%` : ""}
            </button>
          ))}
        </div>

        {selectedInterval ? (
          <div className="mt-auto flex items-center justify-between pt-2">
            <span className="text-lg font-semibold">
              {formatINR(selectedInterval.price)}
              <span className="text-muted-foreground text-xs font-normal">
                {" "}
                / {INTERVAL_LABEL[selectedInterval.interval]?.toLowerCase()}
              </span>
            </span>
            <button
              type="button"
              onClick={() => setDialogOpen(true)}
              className="bg-brand text-brand-foreground hover:bg-brand/90 rounded-lg px-4 py-2 text-sm font-medium"
            >
              Subscribe
            </button>
          </div>
        ) : null}
      </div>

      {selectedInterval ? (
        <SubscribeDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          planName={plan.name}
          interval={selectedInterval}
          defaultAddress={defaultAddress}
          isSignedIn={isSignedIn}
        />
      ) : null}
    </div>
  );
}
