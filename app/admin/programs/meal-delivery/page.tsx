import MealSignupsTable from "../../MealSignupsTable";
import DriverVolunteersTable from "../../DriverVolunteersTable";
import { getMealSignupsWithAssignments, getDriverVolunteers } from "@/app/lib/db";

export default async function AdminMealDeliveryPage() {
  const [mealSignups, driverVolunteers] = await Promise.all([
    getMealSignupsWithAssignments(),
    getDriverVolunteers(),
  ]);

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-foreground">
        Meal Delivery — Signups
      </h1>
      <MealSignupsTable initialData={mealSignups} drivers={driverVolunteers} />
      <DriverVolunteersTable initialData={driverVolunteers} />
    </div>
  );
}
