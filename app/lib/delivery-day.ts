export type DeliveryDay =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";

export const DELIVERY_DAYS: readonly DeliveryDay[] = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

const DAY_FROM_INDEX: Record<number, DeliveryDay> = {
  0: "sunday",
  1: "monday",
  2: "tuesday",
  3: "wednesday",
  4: "thursday",
  5: "friday",
  6: "saturday",
};

export function getDeliveryDay(dateStr: string): DeliveryDay {
  const date = new Date(dateStr + "T00:00:00");
  return DAY_FROM_INDEX[date.getDay()] ?? "thursday";
}

export function formatDeliveryDay(day: DeliveryDay): string {
  return day.charAt(0).toUpperCase() + day.slice(1);
}

// The public signup forms only offer Wednesday/Thursday; admins can schedule any day.
export function isStandardDeliveryDay(dateStr: string): boolean {
  const day = getDeliveryDay(dateStr);
  return day === "wednesday" || day === "thursday";
}

export interface DeliveryDaySchedule {
  location: string | null;
  shortLocation: string | null;
  time: string | null;
}

const SCHEDULED_DAYS: Partial<Record<DeliveryDay, DeliveryDaySchedule>> = {
  wednesday: {
    location: "Episcopal Church of the Good Shepherd, 64 University Terrace, Athens, OH 45701",
    shortLocation: "Episcopal Church",
    time: "12:00pm",
  },
  thursday: {
    location: "United Campus Ministries, 18 N College St, Athens, OH 45701",
    shortLocation: "UCM",
    time: "5:00pm",
  },
};

// All Wednesdays except the first of the month use the UCM pickup location
// (same as Thursday) while keeping the Wednesday 12:00pm pickup time.
const OTHER_WEDNESDAY_SCHEDULE: DeliveryDaySchedule = {
  location: "United Campus Ministries, 18 N College St, Athens, OH 45701",
  shortLocation: "UCM",
  time: "12:00pm",
};

// The first weekday of a given type in a month always falls on a day between
// the 1st and the 7th, so a date with day-of-month <= 7 is the first one.
function isFirstWeekdayOfMonth(dateStr: string, day: DeliveryDay): boolean {
  const date = new Date(dateStr + "T00:00:00");
  return getDeliveryDay(dateStr) === day && date.getDate() <= 7;
}

// Wednesdays and Thursdays have a fixed pickup schedule. Other days have no
// published pickup info yet, so emails fall back to a generic message.
export function getDeliveryDaySchedule(day: DeliveryDay): DeliveryDaySchedule {
  return (
    SCHEDULED_DAYS[day] ?? { location: null, shortLocation: null, time: null }
  );
}

// Date-aware variant: Wednesday pickup location depends on the week of the
// month (first Wednesday keeps the Episcopal Church pickup; all other
// Wednesdays use the UCM pickup like Thursday).
export function getDeliveryDayScheduleForDate(dateStr: string): DeliveryDaySchedule {
  const day = getDeliveryDay(dateStr);
  if (day === "wednesday" && !isFirstWeekdayOfMonth(dateStr, "wednesday")) {
    return OTHER_WEDNESDAY_SCHEDULE;
  }
  return getDeliveryDaySchedule(day);
}

const CAP_BY_DAY: Record<DeliveryDay, number> = {
  monday: 40,
  friday: 40,
  tuesday: 15,
  wednesday: 15,
  thursday: 15,
  saturday: 15,
  sunday: 15,
};

export function getMealsCapForDay(day: DeliveryDay): number {
  return CAP_BY_DAY[day];
}

export function getMealsCapForDate(dateStr: string): number {
  return getMealsCapForDay(getDeliveryDay(dateStr));
}

// UCM (and the Episcopal Church) are closed on certain holidays, so no
// Wednesday/Thursday meal delivery or driver pickup happens on those dates.
// These dates are removed from the public signup forms and rejected by the
// server actions. Admins can still schedule other days.
function nthWeekdayOfMonth(year: number, month: number, weekday: number, n: number): Date {
  // month is 0-based; weekday is 0 (Sun) .. 6 (Sat).
  const first = new Date(Date.UTC(year, month, 1));
  const offset = (weekday - first.getUTCDay() + 7) % 7;
  const day = 1 + offset + (n - 1) * 7;
  return new Date(Date.UTC(year, month, day));
}

function lastWeekdayOfMonth(year: number, month: number, weekday: number): Date {
  const last = new Date(Date.UTC(year, month + 1, 0));
  const offset = (last.getUTCDay() - weekday + 7) % 7;
  return new Date(Date.UTC(year, month + 1, 0 - offset));
}

export function getHolidayClosureDates(year: number): Set<string> {
  const iso = (d: Date) => d.toISOString().split("T")[0];
  const dates = new Set<string>();

  // Fixed-date holidays (with weekend observance).
  const fixed: Array<[number, number]> = [
    [1, 1],   // New Year's Day
    [6, 19],  // Juneteenth
    [7, 4],   // Independence Day
    [11, 11], // Veterans Day
    [12, 25], // Christmas Day
  ];
  for (const [m, day] of fixed) {
    const d = new Date(Date.UTC(year, m - 1, day));
    const dow = d.getUTCDay();
    let observed = d;
    if (dow === 6) observed = new Date(Date.UTC(year, m - 1, day - 1)); // Sat -> Fri
    if (dow === 0) observed = new Date(Date.UTC(year, m - 1, day + 1)); // Sun -> Mon
    dates.add(iso(observed));
  }

  // Weekday-based holidays.
  dates.add(iso(nthWeekdayOfMonth(year, 0, 1, 3)));   // MLK Day: 3rd Monday Jan
  dates.add(iso(nthWeekdayOfMonth(year, 1, 1, 3)));   // Presidents Day: 3rd Monday Feb
  dates.add(iso(lastWeekdayOfMonth(year, 4, 1)));     // Memorial Day: last Monday May
  dates.add(iso(nthWeekdayOfMonth(year, 8, 1, 1)));   // Labor Day: 1st Monday Sep
  dates.add(iso(nthWeekdayOfMonth(year, 9, 1, 2)));   // Columbus Day: 2nd Monday Oct
  dates.add(iso(nthWeekdayOfMonth(year, 10, 4, 4)));  // Thanksgiving: 4th Thursday Nov

  return dates;
}

export function isHolidayClosure(dateStr: string): boolean {
  const d = new Date(dateStr + "T00:00:00");
  if (isNaN(d.getTime())) return false;
  return getHolidayClosureDates(d.getFullYear()).has(dateStr);
}

// Backwards/alternative names for the same check.
export const isUcmClosedDate = isHolidayClosure;
export const isUcmClosedOnDate = isHolidayClosure;
export const isClosedHoliday = isHolidayClosure;
export const isHoliday = isHolidayClosure;
