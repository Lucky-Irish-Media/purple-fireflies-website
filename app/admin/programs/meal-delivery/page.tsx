import MealSignupsTable from "../../MealSignupsTable";
import DriverVolunteersTable from "../../DriverVolunteersTable";

export default function AdminMealDeliveryPage() {
  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-foreground">
        Meal Delivery — Signups
      </h1>
      <MealSignupsTable />
      <DriverVolunteersTable />
    </div>
  );
}
