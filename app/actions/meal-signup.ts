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
    const deliveryDates = formData.getAll("deliveryDates") as string[];

    const validatedFields = MealSignupSchema.safeParse({
      name: formData.get("name"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      address1: formData.get("address1"),
      address2: formData.get("address2"),
      city: formData.get("city"),
      state: formData.get("state"),
      zipCode: formData.get("zipCode"),
      mealType: formData.get("mealType"),
      contactMethod: formData.get("contactMethod"),
      deliveryDates,
      comments: formData.get("comments"),
    });

    if (!validatedFields.success) {
      return { errors: validatedFields.error.flatten().fieldErrors };
    }

    const data = validatedFields.data;

    const signups = [];
    for (const deliveryDate of data.deliveryDates) {
      const signup = await createMealSignup({
        name: data.name,
        email: data.email,
        phone: data.phone,
        address1: data.address1,
        address2: data.address2,
        city: data.city,
        state: data.state,
        zipCode: data.zipCode,
        mealType: data.mealType,
        contactMethod: data.contactMethod,
        deliveryDate,
        comments: data.comments,
      });
      signups.push(signup);
    }

    await sendMealSignupConfirmation(signups[0]);

    const datesFormatted = data.deliveryDates.map((d) => new Date(d).toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })).join(", ");

    return { message: "success", selectedDate: datesFormatted };
  } catch (e) {
    console.error("meal signup action error:", e);
    return { message: getErrorMessage(e) };
  }
}