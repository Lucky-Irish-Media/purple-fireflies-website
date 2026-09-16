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
