"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { VolunteerDay } from "@/app/lib/definitions";
import VolunteerDaysCalendarModal from "@/components/VolunteerDaysCalendarModal";
import {
  createVolunteerDayAction,
  updateVolunteerDayAction,
  closeVolunteerDayAction,
  reopenVolunteerDayAction,
  deleteVolunteerDayAction,
} from "@/app/actions/volunteer-meals";

export default function VolunteerDaysTable({
  days,
  slotUsage,
}: {
  days: VolunteerDay[];
  slotUsage: Record<number, Record<string, number>>;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [status, setStatus] = useState<{ message: string; success: boolean } | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(days[0]?.date ?? null);
  const [editing, setEditing] = useState(false);

  const selectedDay = days.find((d) => d.date === selectedDate) || null;

  function run(fd: FormData, action: (f: FormData) => Promise<{ success: boolean; message: string }>) {
    startTransition(async () => {
      const res = await action(fd);
      setStatus(res);
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      {status && <p className={`text-sm ${status.success ? "text-green-600" : "text-red-500"}`}>{status.message}</p>}

      <section className="space-y-3">
        <h2 className="text-xl font-bold text-foreground">Add volunteer day</h2>
        <form
          action={(fd) => run(fd, createVolunteerDayAction)}
          className="grid grid-cols-1 sm:grid-cols-4 gap-3 border border-primary/10 rounded-lg p-4"
        >
          <input name="date" type="date" required className="rounded border border-primary/10 bg-background px-2 py-1 text-sm" />
          <input name="title" placeholder="Title (optional)" className="rounded border border-primary/10 bg-background px-2 py-1 text-sm" />
          <input name="notes" placeholder="Notes" className="rounded border border-primary/10 bg-background px-2 py-1 text-sm" />
          <button type="submit" disabled={pending} className="rounded-lg bg-primary text-white px-4 py-2 text-sm font-medium disabled:opacity-50">
            Add Day
          </button>
        </form>
      </section>

      <VolunteerDaysCalendarModal
        days={days}
        slotUsage={slotUsage}
        selectedDate={selectedDate}
        onSelect={setSelectedDate}
        buttonLabel="Show Calendar"
      />

      {selectedDay && (
        <section className="border border-primary/10 rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="font-medium text-foreground">
                {new Date(selectedDay.date + "T00:00:00").toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
              </p>
              <p className="text-xs text-text-secondary">
                Status: {selectedDay.status}
                {selectedDay.title ? ` · ${selectedDay.title}` : ""}
              </p>
              {selectedDay.notes && <p className="text-xs text-text-secondary">{selectedDay.notes}</p>}
            </div>
            <div className="flex gap-2 flex-wrap">
              {selectedDay.status === "open" ? (
                <form action={(fd) => run(fd, closeVolunteerDayAction)}>
                  <input type="hidden" name="id" value={selectedDay.id} />
                  <button type="submit" disabled={pending} className="rounded-lg border border-primary/10 px-3 py-1.5 text-xs font-medium">Close</button>
                </form>
              ) : (
                <form action={(fd) => run(fd, reopenVolunteerDayAction)}>
                  <input type="hidden" name="id" value={selectedDay.id} />
                  <button type="submit" disabled={pending} className="rounded-lg border border-primary/10 px-3 py-1.5 text-xs font-medium">Reopen</button>
                </form>
              )}
              <button
                onClick={() => setEditing((v) => !v)}
                className="rounded-lg border border-primary/10 px-3 py-1.5 text-xs font-medium"
              >
                Edit
              </button>
              <form action={(fd) => run(fd, deleteVolunteerDayAction)}>
                <input type="hidden" name="id" value={selectedDay.id} />
                <button type="submit" disabled={pending} className="rounded-lg border border-red-200 text-red-600 px-3 py-1.5 text-xs font-medium">
                  Delete
                </button>
              </form>
            </div>
          </div>

          {editing && (
            <form
              action={(fd) => run(fd, updateVolunteerDayAction)}
              className="grid grid-cols-1 sm:grid-cols-4 gap-3 border-t border-primary/10 pt-3"
            >
              <input type="hidden" name="id" value={selectedDay.id} />
              <input name="date" type="date" defaultValue={selectedDay.date} className="rounded border border-primary/10 bg-background px-2 py-1 text-sm" />
              <input name="title" defaultValue={selectedDay.title || ""} placeholder="Title" className="rounded border border-primary/10 bg-background px-2 py-1 text-sm" />
              <input name="notes" defaultValue={selectedDay.notes || ""} placeholder="Notes" className="rounded border border-primary/10 bg-background px-2 py-1 text-sm" />
              <select name="status" defaultValue={selectedDay.status} className="rounded border border-primary/10 bg-background px-2 py-1 text-sm">
                <option value="open">open</option>
                <option value="closed">closed</option>
              </select>
              <button type="submit" disabled={pending} className="sm:col-span-4 rounded-lg bg-primary text-white px-4 py-2 text-sm font-medium disabled:opacity-50">
                Save
              </button>
            </form>
          )}
        </section>
      )}
    </div>
  );
}
