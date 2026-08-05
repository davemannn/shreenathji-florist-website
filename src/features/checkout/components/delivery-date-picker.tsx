"use client";

import { cn } from "@/lib/utils";
import { nowInIst, toIsoDate } from "@/lib/delivery";

interface DeliveryDatePickerProps {
  value: string;
  onChange: (isoDate: string) => void;
}

function nextSevenDays(): { iso: string; weekday: string; day: string; label: string }[] {
  return Array.from({ length: 7 }, (_, i) => {
    const date = nowInIst();
    date.setUTCDate(date.getUTCDate() + i);
    return {
      iso: toIsoDate(date),
      weekday: date.toLocaleDateString("en-IN", { weekday: "short", timeZone: "UTC" }),
      day: date.toLocaleDateString("en-IN", { day: "numeric", timeZone: "UTC" }),
      label:
        i === 0
          ? "Today"
          : i === 1
            ? "Tomorrow"
            : date.toLocaleDateString("en-IN", { month: "short", timeZone: "UTC" }),
    };
  });
}

export function DeliveryDatePicker({ value, onChange }: DeliveryDatePickerProps) {
  const days = nextSevenDays();

  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      {days.map((day) => (
        <button
          key={day.iso}
          type="button"
          onClick={() => onChange(day.iso)}
          className={cn(
            "border-border flex min-w-16 shrink-0 flex-col items-center rounded-xs border px-3 py-2 text-center",
            value === day.iso ? "border-brand bg-brand/10 text-brand" : "hover:bg-muted",
          )}
        >
          <span className="text-[10px] tracking-wide uppercase">{day.weekday}</span>
          <span className="text-lg font-semibold">{day.day}</span>
          <span className="text-[10px]">{day.label}</span>
        </button>
      ))}
    </div>
  );
}
