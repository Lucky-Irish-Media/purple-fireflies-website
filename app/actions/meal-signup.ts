"use server";

import { MealSignupSchema, type MealSignupFormState } from "@/app/lib/definitions";
import { createMealSignup } from "@/app/lib/db";
import { sendMealSignupConfirmation } from "@/app/lib/email";
import { checkRateLimit } from "@/app/lib/rate-limit";

function isFirstWednesday(dateStr: string): boolean {
  const date = new Date(dateStr + "T00:00:00");
  return date.getDay() === 3 && date.getDate() <= 7;
}

function getErrorMessage(): string {
  return "An unexpected error occurred. Please try again.";
}

export async function submitMealSignup(
  _state: MealSignupFormState,
  formData: FormData
): Promise<MealSignupFormState> {
  try {
    const { allowed } = await checkRateLimit("signup:meal");
    if (!allowed) {
      return { message: "Too many signup attempts. Please try again in 15 minutes." };
    }

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

    const invalidDates = data.deliveryDates.filter(
      (d) => data.mealType === "vegan" && isFirstWednesday(d)
    );
    if (invalidDates.length > 0) {
      return {
        errors: {
          deliveryDates: [
            `Vegan / GF meals are not available on ${invalidDates.length === 1 ? "the first Wednesday" : "the first Wednesdays"} of the month. Please select a different date or choose the Regular meal type.`,
          ],
        },
      };
    }

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
    return { message: getErrorMessage() };
  }
}