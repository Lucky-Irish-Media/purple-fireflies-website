import { SundayMealCookSignupForm } from "@/components/SundayMealCookSignupForm";

export const metadata = {
  title: "Sunday Meals Cook Signup | Purple Fireflies",
  description:
    "Sign up to cook for Sunday Meals: once a month for six months, making 15 individually served plates for your neighbors.",
};

export default function SundayMealsSignupPage() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <SundayMealCookSignupForm />
    </main>
  );
}
