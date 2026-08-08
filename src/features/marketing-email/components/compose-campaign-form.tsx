"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
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
  FormMessage,
} from "@/components/ui/form";
import { previewAudienceSizeAction, sendMarketingEmailAction } from "../actions";
import { composeMarketingEmailSchema, type ComposeMarketingEmailValues } from "../validations";
import type { AudienceKey } from "../types";

const AUDIENCE_OPTIONS: { value: AudienceKey; label: string }[] = [
  { value: "newsletter", label: "Newsletter subscribers" },
  { value: "segment:VIP", label: "VIP customers" },
  { value: "segment:Frequent", label: "Frequent buyers" },
  { value: "segment:Regular", label: "Regular customers" },
  { value: "segment:New", label: "New (no orders yet)" },
  { value: "segment:Inactive", label: "Inactive (90+ days)" },
];

// Past this many recipients, a send holds the request open for a while
// (see SEND_DELAY_MS in actions.ts) — the confirm dialog just makes that
// wait an informed choice, not a hard limit.
const LARGE_AUDIENCE_WARNING_THRESHOLD = 300;

export function ComposeCampaignForm() {
  const router = useRouter();
  const [audienceSize, setAudienceSize] = useState<number | null>(null);
  const [isPreviewing, startPreview] = useTransition();
  const [isSending, setIsSending] = useState(false);

  const form = useForm<ComposeMarketingEmailValues>({
    resolver: zodResolver(composeMarketingEmailSchema),
    defaultValues: { subject: "", body: "", audiences: [] },
  });

  const audiences = useWatch({ control: form.control, name: "audiences" });

  // No setState directly in the effect body (the empty-audiences case is
  // handled by the derived `displayAudienceSize` below instead) — only the
  // deferred async scope calls setAudienceSize, matching the pattern used
  // elsewhere in this codebase (see global-search.tsx) to dodge
  // react-hooks/set-state-in-effect.
  useEffect(() => {
    if (!audiences || audiences.length === 0) return;
    startPreview(async () => {
      try {
        const size = await previewAudienceSizeAction(audiences);
        setAudienceSize(size);
      } catch {
        setAudienceSize(null);
      }
    });
  }, [audiences]);

  const displayAudienceSize = !audiences || audiences.length === 0 ? null : audienceSize;

  async function onSubmit(values: ComposeMarketingEmailValues) {
    if (
      audienceSize !== null &&
      audienceSize > LARGE_AUDIENCE_WARNING_THRESHOLD &&
      !window.confirm(
        `This will email ${audienceSize} people and take a while to finish (throttled, roughly ${Math.ceil((audienceSize * 2) / 60)} minutes). Continue?`,
      )
    ) {
      return;
    }

    setIsSending(true);
    try {
      const result = await sendMarketingEmailAction(values);
      toast.success(`Sent to ${result.sent} of ${result.total} recipients.`);
      form.reset();
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Couldn't send this campaign.");
    } finally {
      setIsSending(false);
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
          name="audiences"
          render={() => (
            <FormItem>
              <FormLabel>Audience</FormLabel>
              <div className="flex flex-col gap-2">
                {AUDIENCE_OPTIONS.map((option) => (
                  <FormField
                    key={option.value}
                    control={form.control}
                    name="audiences"
                    render={({ field }) => {
                      const checked = field.value?.includes(option.value);
                      return (
                        <label className="flex items-center gap-2 text-sm">
                          <Checkbox
                            checked={checked}
                            onCheckedChange={(value) => {
                              const current = field.value ?? [];
                              field.onChange(
                                value
                                  ? [...current, option.value]
                                  : current.filter((v) => v !== option.value),
                              );
                            }}
                          />
                          {option.label}
                        </label>
                      );
                    }}
                  />
                ))}
              </div>
              <FormMessage />
              <p className="text-muted-foreground text-xs">
                {isPreviewing
                  ? "Counting…"
                  : displayAudienceSize !== null
                    ? `Reaches ${displayAudienceSize} ${displayAudienceSize === 1 ? "person" : "people"}.`
                    : "Pick at least one audience to see how many people this reaches."}
              </p>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="subject"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Subject</FormLabel>
              <FormControl>
                <Input {...field} placeholder="This weekend only: 20% off bouquets" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="body"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Message</FormLabel>
              <FormControl>
                <textarea
                  {...field}
                  rows={8}
                  placeholder="One paragraph per line…"
                  className="border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 w-full rounded-lg border bg-transparent px-2.5 py-1.5 text-sm outline-none focus-visible:ring-3"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" variant="brand" size="lg" disabled={isSending} className="w-fit">
          {isSending ? "Sending…" : "Send Campaign"}
        </Button>
      </form>
    </Form>
  );
}
