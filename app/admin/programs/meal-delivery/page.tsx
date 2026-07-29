import MealDeliveryTabs from "./MealDeliveryTabs";
import { getMealSignupsWithAssignments, getDriverVolunteers, getWaitlistEntries } from "@/app/lib/db";

export default async function AdminMealDeliveryPage() {
  const [mealSignups, driverVolunteers, waitlistEntries] = await Promise.all([
    getMealSignupsWithAssignments(),
    getDriverVolunteers(),
    getWaitlistEntries(),
  ]);

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-foreground">
        Meal Delivery
      </h1>
      <MealDeliveryTabs mealSignups={mealSignups} driverVolunteers={driverVolunteers} waitlistEntries={waitlistEntries} />
    </div>
  );
}
