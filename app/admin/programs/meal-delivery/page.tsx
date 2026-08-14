import MealDeliveryTabs from "./MealDeliveryTabs";
import { getMealSignupsWithAssignments, getDriverVolunteers, getWaitlistEntries, getMealSignupCountsByDate, getClosedDeliveryDates } from "@/app/lib/db";
import type { DeliveryDayOverview } from "./DeliveryDaysTable";

function getUpcomingDeliveryDays(weeksAhead = 10): Omit<DeliveryDayOverview, "count" | "closed">[] {
  const days: Omit<DeliveryDayOverview, "count" | "closed">[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const max = new Date(today);
  max.setDate(today.getDate() + weeksAhead * 7);
  for (let d = new Date(today); d <= max; d.setDate(d.getDate() + 1)) {
    const day = d.getDay();
    if (day === 3 || day === 4) {
      days.push({
        delivery_date: d.toISOString().split("T")[0],
        delivery_day: day === 3 ? "wednesday" : "thursday",
      });
    }
  }
  return days;
}

export default async function AdminMealDeliveryPage() {
  const [mealSignups, driverVolunteers, waitlistEntries, dateCounts, closedDates] = await Promise.all([
    getMealSignupsWithAssignments(),
    getDriverVolunteers(),
    getWaitlistEntries(),
    getMealSignupCountsByDate(),
    getClosedDeliveryDates(),
  ]);

  const deliveryDays: DeliveryDayOverview[] = getUpcomingDeliveryDays().map((d) => ({
    ...d,
    count: dateCounts[d.delivery_date] ?? 0,
    closed: closedDates.includes(d.delivery_date),
  }));

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-foreground">
        Meal Delivery
      </h1>
      <MealDeliveryTabs
        mealSignups={mealSignups}
        driverVolunteers={driverVolunteers}
        waitlistEntries={waitlistEntries}
        deliveryDays={deliveryDays}
      />
    </div>
  );
}
