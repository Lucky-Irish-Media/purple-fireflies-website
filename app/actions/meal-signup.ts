"use server";

import { MealSignupSchema, type MealSignupFormState } from "@/app/lib/definitions";
import { createMealSignup } from "@/app/lib/db";
import { sendMealSignupConfirmation } from "@/app/lib/email";

function getErrorMessage(e: unknown): string {
  if (e instanceof Error) {
    console.error("Actual error:", e.message, e.stack);
    if (e.message.includes("D1") || e.message.includes("database") || e.message.includes("getCloudflareContext")) {
      return "Database connection error. Please try again later.";
    }
    return e.message;
  }
  return "An unexpected error occurred. Please try again.";
}

export async function submitMealSignup(
  _state: MealSignupFormState,
  formData: FormData
): Promise<MealSignupFormState> {
  try {
    const validatedFields = MealSignupSchema.safeParse({
      name: formData.get("name"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      address: formData.get("address"),
      mealType: formData.get("mealType"),
      deliveryDay: formData.get("deliveryDay"),
      comments: formData.get("comments"),
    });

    if (!validatedFields.success) {
      return { errors: validatedFields.error.flatten().fieldErrors };
    }

    const data = validatedFields.data;

    const signup = await createMealSignup({
      name: data.name,
      email: data.email,
      phone: data.phone,
      address: data.address,
      mealType: data.mealType,
      deliveryDay: data.deliveryDay,
      comments: data.comments,
    });

    await sendMealSignupConfirmation(signup);

    return { message: "success" };
  } catch (e) {
    console.error("meal signup action error:", e);
    return { message: getErrorMessage(e) };
  }
}