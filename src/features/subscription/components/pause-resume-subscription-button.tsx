"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Pause, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { pauseSubscriptionAction, resumeSubscriptionAction } from "../actions";
import type { SubscriptionStatus } from "../types";

/** Only rendered for ACTIVE (offers Pause) or PAUSED (offers Resume) — anything else (cancelled, halted, ...) shows neither. */
export function PauseResumeSubscriptionButton({
  subscriptionId,
  status,
}: {
  subscriptionId: string;
  status: SubscriptionStatus;
}) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  if (status !== "ACTIVE" && status !== "PAUSED") return null;

  async function handleClick() {
    setSubmitting(true);
    try {
      if (status === "ACTIVE") {
        await pauseSubscriptionAction({ subscriptionId });
        toast.success("Subscription paused — resume it whenever you're ready.");
      } else {
        await resumeSubscriptionAction({ subscriptionId });
        toast.success("Subscription resumed.");
      }
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Couldn't update this subscription.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Button variant="outline" size="sm" disabled={submitting} onClick={handleClick}>
      {status === "ACTIVE" ? (
        <>
          <Pause className="size-3.5" aria-hidden="true" />
          {submitting ? "Pausing…" : "Pause"}
        </>
      ) : (
        <>
          <Play className="size-3.5" aria-hidden="true" />
          {submitting ? "Resuming…" : "Resume"}
        </>
      )}
    </Button>
  );
}
