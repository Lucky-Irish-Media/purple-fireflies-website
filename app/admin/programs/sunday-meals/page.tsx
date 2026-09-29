import { getSundayMealCooks } from "@/app/lib/db";
import { SundayMealCooksTable } from "./SundayMealCooksTable";

export default async function AdminSundayMealsPage() {
  const cooks = await getSundayMealCooks();

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-foreground">Sunday Meals</h1>
      <p className="text-sm text-text-secondary">
        Cook commitments: one row per cook, each committed to cooking once a month for six
        months. Set a cook to <strong className="text-foreground">finished</strong> once
        their six-month term is complete.
      </p>
      <SundayMealCooksTable initialData={cooks} />
    </div>
  );
}
