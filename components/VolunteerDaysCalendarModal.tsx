"use client";

import { useState } from "react";
import type { VolunteerDay } from "@/app/lib/definitions";
import VolunteerDaysCalendar from "@/components/VolunteerDaysCalendar";

export default function VolunteerDaysCalendarModal({
  days,
  slotUsage,
  selectedDate,
  onSelect,
  buttonLabel = "Show Calendar",
}: {
  days: VolunteerDay[];
  slotUsage: Record<number, Record<string, number>>;
  selectedDate?: string | null;
  onSelect?: (date: string) => void;
  buttonLabel?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-lg bg-primary text-white px-4 py-2 text-sm font-medium hover:bg-primary/90"
      >
        {buttonLabel}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-card rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-primary/10">
              <h3 className="text-lg font-bold text-foreground">Volunteer Days Calendar</h3>
              <button
                onClick={() => setOpen(false)}
                className="text-text-secondary hover:text-foreground"
                aria-label="Close"
              >
                ✕
              </button>
            </div>
            <div className="overflow-y-auto p-4">
              <VolunteerDaysCalendar
                days={days}
                slotUsage={slotUsage}
                selectedDate={selectedDate}
                onSelect={onSelect}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
