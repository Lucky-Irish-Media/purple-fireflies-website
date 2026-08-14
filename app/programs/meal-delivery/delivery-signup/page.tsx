import { MealSignupForm } from "@/components/MealSignupForm";
import { getMealSignupCountsByDate, getClosedDeliveryDates } from "@/app/lib/db";

export const metadata = {
  title: "Meal Delivery Signup | Purple Fireflies",
  description: "Sign up for free meal delivery on Wednesdays at 12:00 PM or Thursdays at 5:00 PM",
};

export const dynamic = "force-dynamic";

export default async function DeliverySignupPage() {
  const [dateCounts, closedDates] = await Promise.all([
    getMealSignupCountsByDate(),
    getClosedDeliveryDates(),
  ]);
  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <MealSignupForm dateCounts={dateCounts} closedDates={closedDates} />
    </main>
  );
}