import { MealSignupForm } from "@/components/MealSignupForm";

export const metadata = {
  title: "Meal Delivery Signup | Purple Fireflies",
  description: "Sign up for free meal delivery on Wednesdays at 12:00 PM or Thursdays at 5:00 PM",
};

export default function DeliverySignupPage() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <MealSignupForm />
    </main>
  );
}