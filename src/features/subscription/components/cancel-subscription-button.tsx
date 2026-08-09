"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cancelSubscriptionAction } from "../actions";

export function CancelSubscriptionButton({ subscriptionId }: { subscriptionId: string }) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  async function handleCancel() {
    if (
      !window.confirm(
        "Cancel this subscription at the end of the current billing cycle? You'll keep receiving deliveries until then.",
      )
    ) {
      return;
    }
    setSubmitting(true);
    try {
      await cancelSubscriptionAction({ subscriptionId, cancelAtCycleEnd: true });
      toast.success("Subscription cancelled — it'll stop after the current cycle.");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Couldn't cancel this subscription.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Button variant="outline" size="sm" disabled={submitting} onClick={handleCancel}>
      {submitting ? "Cancelling…" : "Cancel Subscription"}
    </Button>
  );
}
