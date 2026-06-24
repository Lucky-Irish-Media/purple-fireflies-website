import DriverVolunteersTable from "./DriverVolunteersTable";
import MealSignupsTable from "./MealSignupsTable";

export default function AdminDashboard() {
  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
      <MealSignupsTable />
      <DriverVolunteersTable />
    </div>
  );
}
