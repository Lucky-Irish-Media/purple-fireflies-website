import { MealSignup } from "@/app/lib/db";

export async function sendMealSignupConfirmation(signup: MealSignup): Promise<void> {
  console.log("[EMAIL STUB] Meal signup confirmation would be sent to:", signup.email);
  console.log("[EMAIL STUB] Signup details:", {
    name: signup.name,
    mealType: signup.meal_type,
    deliveryDay: signup.delivery_day,
    address: signup.address,
  });
}