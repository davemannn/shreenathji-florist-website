"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Ban } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { adminCancelSubscriptionAction } from "../actions";

export function AdminCancelSubscriptionDialog({
  subscriptionId,
  razorpaySubscriptionId,
}: {
  subscriptionId: string;
  razorpaySubscriptionId: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleCancel(cancelAtCycleEnd: boolean) {
    setSubmitting(true);
    try {
      await adminCancelSubscriptionAction(subscriptionId, razorpaySubscriptionId, cancelAtCycleEnd);
      toast.success("Subscription cancelled.");
      setOpen(false);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Couldn't cancel this subscription.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="outline" />}>
        <Ban className="size-4" aria-hidden="true" />
        Cancel Subscription
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Cancel subscription</DialogTitle>
          <DialogDescription>
            Stop now, or let the customer keep what they&rsquo;ve already paid for until the current
            billing cycle ends?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-col gap-2 sm:flex-col">
          <Button
            variant="outline"
            className="w-full"
            disabled={submitting}
            onClick={() => handleCancel(true)}
          >
            Cancel at cycle end
          </Button>
          <Button
            variant="destructive"
            className="w-full"
            disabled={submitting}
            onClick={() => handleCancel(false)}
          >
            Cancel immediately
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
