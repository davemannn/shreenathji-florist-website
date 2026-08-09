"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { createReminderAction } from "../actions";
import {
  createReminderSchema,
  type CreateReminderInput,
  type CreateReminderValues,
} from "../validations";

const OCCASION_OPTIONS = [
  { value: "BIRTHDAY", label: "Birthday" },
  { value: "ANNIVERSARY", label: "Anniversary" },
  { value: "OTHER", label: "Other" },
];

const MONTH_OPTIONS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export function ReminderForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const form = useForm<CreateReminderInput, unknown, CreateReminderValues>({
    resolver: zodResolver(createReminderSchema),
    defaultValues: { occasion: "BIRTHDAY", recipientName: "", month: 1, day: 1, note: "" },
  });

  async function onSubmit(values: CreateReminderValues) {
    try {
      await createReminderAction(values);
      toast.success("Reminder saved.");
      setOpen(false);
      form.reset();
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Couldn't save this reminder.");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="brand" />}>
        <Plus className="size-4" aria-hidden="true" />
        Add Reminder
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Add a reminder</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
            <FormField
              control={form.control}
              name="occasion"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Occasion</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue>
                        {(value: string) => OCCASION_OPTIONS.find((o) => o.value === value)?.label}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {OCCASION_OPTIONS.map((option) => (
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
              name="recipientName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Who&rsquo;s it for?</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Mom, Priya, ..." />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="month"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Month</FormLabel>
                    <Select
                      value={String(field.value)}
                      onValueChange={(value) => field.onChange(Number(value))}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue>
                          {(value: string) => MONTH_OPTIONS[Number(value) - 1]}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {MONTH_OPTIONS.map((label, index) => (
                          <SelectItem key={label} value={String(index + 1)}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="day"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Day</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        max={31}
                        {...field}
                        value={field.value as number}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="note"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Note (optional)</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Favorite flowers, allergy, etc." />
                  </FormControl>
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="brand" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Saving…" : "Save Reminder"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
