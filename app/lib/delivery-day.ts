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

// Wednesdays and Thursdays have a fixed pickup schedule. Other days have no
// published pickup info yet, so emails fall back to a generic message.
export function getDeliveryDaySchedule(day: DeliveryDay): DeliveryDaySchedule {
  return (
    SCHEDULED_DAYS[day] ?? { location: null, shortLocation: null, time: null }
  );
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
