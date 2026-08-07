"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { issueGiftCardAction } from "../actions";
import {
  issueGiftCardFormSchema,
  type IssueGiftCardFormInput,
  type IssueGiftCardFormValues,
} from "../validations";

const RECIPIENT_OPTIONS = [
  { value: "SELF", label: "The customer themself" },
  { value: "OTHER", label: "Someone else" },
];

/**
 * Super Admin only — creates spendable balance with no payment behind it.
 * Requires an existing customer account (looked up by email) and a reason,
 * which the server writes to GiftCardAdjustment alongside the card itself.
 */
export function IssueGiftCardDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const form = useForm<IssueGiftCardFormInput, unknown, IssueGiftCardFormValues>({
    resolver: zodResolver(issueGiftCardFormSchema),
    defaultValues: {
      purchaserEmail: "",
      amount: 500,
      recipientType: "SELF",
      recipientName: "",
      recipientEmail: "",
      recipientPhone: "",
      message: "",
      reason: "",
    },
  });
  const recipientType = useWatch({ control: form.control, name: "recipientType" });

  async function onSubmit(values: IssueGiftCardFormValues) {
    try {
      const result = await issueGiftCardAction(values);
      toast.success(`Gift card ${result.code} issued.`);
      setOpen(false);
      form.reset();
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Couldn't issue this gift card.");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="brand" />}>
        <Plus className="size-4" aria-hidden="true" />
        Issue Gift Card
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Issue a gift card</DialogTitle>
          <DialogDescription>
            Creates spendable balance with no payment behind it — use this for goodwill credit or
            compensation, not for a real purchase.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
            <FormField
              control={form.control}
              name="purchaserEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Customer&rsquo;s account email</FormLabel>
                  <FormControl>
                    <Input {...field} type="email" placeholder="customer@example.com" />
                  </FormControl>
                  <FormDescription>
                    They must already have an account — this doesn&rsquo;t create one.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount (₹)</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} value={field.value as number} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="recipientType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Who is this for?</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue>
                        {(value: string) => RECIPIENT_OPTIONS.find((o) => o.value === value)?.label}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {RECIPIENT_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />

            {recipientType === "OTHER" ? (
              <>
                <FormField
                  control={form.control}
                  name="recipientName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Recipient name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="recipientEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Recipient email (optional)</FormLabel>
                      <FormControl>
                        <Input {...field} type="email" />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </>
            ) : null}

            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reason (internal)</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Compensation for delayed order #1234" />
                  </FormControl>
                  <FormDescription>Recorded on this card&rsquo;s audit trail.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="brand" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Issuing…" : "Issue Gift Card"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
