import { MealSignup } from "@/app/lib/db";

export async function sendMealSignupConfirmation(signup: MealSignup): Promise<void> {
  const address = `${signup.address1}${signup.address2 ? `, ${signup.address2}` : ""}, ${signup.city}, ${signup.state} ${signup.zip_code}`;
  console.log("[EMAIL STUB] Meal signup confirmation would be sent to:", signup.email);
  console.log("[EMAIL STUB] Signup details:", {
    name: signup.name,
    contactMethod: signup.contact_method,
    mealType: signup.meal_type,
    deliveryDay: signup.delivery_day,
    address,
  });
}