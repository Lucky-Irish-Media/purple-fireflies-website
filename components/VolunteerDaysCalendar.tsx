"use client";

import type { VolunteerDay } from "@/app/lib/definitions";

const CAPACITY = 5;
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

type DaySlot = { day: VolunteerDay; slots: Record<string, number> };

export default function VolunteerDaysCalendar({
  days,
  slotUsage,
  selectedDate,
  onSelect,
}: {
  days: VolunteerDay[];
  slotUsage: Record<number, Record<string, number>>;
  selectedDate?: string | null;
  onSelect?: (date: string) => void;
}) {
  // group days by month
  const byMonth: Record<string, DaySlot[]> = {};
  for (const d of days) {
    const key = d.date.slice(0, 7); // YYYY-MM
    if (!byMonth[key]) byMonth[key] = [];
    byMonth[key].push({ day: d, slots: slotUsage[d.id] || { cooking: 0, cleaning: 0, packing: 0 } });
  }

  const months = Object.keys(byMonth).sort();

  return (
    <div className="space-y-8">
      {months.map((mk) => {
        const [y, m] = mk.split("-").map(Number);
        const first = new Date(y, m - 1, 1);
        const lastDay = new Date(y, m, 0).getDate();
        const startWeekday = first.getDay(); // 0=Sun
        const dayMap = new Map<string, DaySlot>();
        for (const ds of byMonth[mk]) dayMap.set(ds.day.date, ds);

        const cells: (DaySlot | null)[] = [];
        for (let i = 0; i < startWeekday; i++) cells.push(null);
        for (let d = 1; d <= lastDay; d++) {
          const iso = `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
          cells.push(dayMap.get(iso) || null);
        }
        // pad to complete weeks
        while (cells.length % 7 !== 0) cells.push(null);

        return (
          <div key={mk}>
            <h3 className="mb-3 text-lg font-bold text-foreground">
              {MONTH_NAMES[m - 1]} {y}
            </h3>
            <div className="grid grid-cols-7 gap-1 text-xs">
              {WEEKDAYS.map((w) => (
                <div key={w} className="text-center font-medium text-text-secondary py-1">{w}</div>
              ))}
              {cells.map((cell, i) => {
                if (!cell) {
                  // empty cell (non-volunteer day or padding)
                  const dayNum = i - startWeekday + 1;
                  const showNum = dayNum >= 1 && dayNum <= lastDay && !dayMap.has(`${y}-${String(m).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`);
                  return (
                    <div
                      key={i}
                      className="min-h-[72px] rounded border border-primary/5 bg-background/40 p-1 text-text-secondary"
                    >
                      {showNum && <span className="text-[10px]">{dayNum}</span>}
                    </div>
                  );
                }
                const { day, slots } = cell;
                const rem = {
                  cooking: Math.max(0, CAPACITY - (slots.cooking || 0)),
                  cleaning: Math.max(0, CAPACITY - (slots.cleaning || 0)),
                  packing: Math.max(0, CAPACITY - (slots.packing || 0)),
                };
                const total = rem.cooking + rem.cleaning + rem.packing;
                const closed = day.status !== "open";
                const isSelected = selectedDate === day.date;
                const cellClass = `min-h-[72px] rounded border p-1 text-left w-full ${
                  isSelected ? "ring-2 ring-primary " : ""
                }${
                  closed
                    ? "border-red-200 bg-red-50/50"
                    : total === 0
                    ? "border-amber-200 bg-amber-50/50"
                    : "border-primary bg-primary/10 font-semibold"
                }`;
                const inner = (
                  <>
                    <div className="text-sm font-bold text-primary">
                      {new Date(day.date + "T00:00:00").getDate()}
                    </div>
                    {closed ? (
                      <div className="text-[10px] text-red-600">Closed</div>
                    ) : (
                      <div className="space-y-0.5 text-[10px] text-text-secondary">
                        <div>Cook {rem.cooking}</div>
                        <div>Clean {rem.cleaning}</div>
                        <div>Pack {rem.packing}</div>
                      </div>
                    )}
                  </>
                );
                if (onSelect) {
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => onSelect(day.date)}
                      className={cellClass}
                    >
                      {inner}
                    </button>
                  );
                }
                return (
                  <div key={i} className={cellClass}>
                    {inner}
                  </div>
                );
              })}
            </div>
            <div className="mt-2 text-[10px] text-text-secondary">
              Cook / Clean / Pack = remaining slots of {CAPACITY}
            </div>
          </div>
        );
      })}
    </div>
  );
}
