"use server";

import {
  SundayMealCookSignupSchema,
  type SundayMealCookSignupFormState,
  type SundayMealCookStatus,
} from "@/app/lib/definitions";
import {
  createSundayMealCook,
  getSundayMealCooks,
  updateSundayMealCook,
} from "@/app/lib/db";
import { checkRateLimit } from "@/app/lib/rate-limit";

function getErrorMessage(): string {
  return "An unexpected error occurred. Please try again.";
}

export async function submitSundayMealCookSignup(
  _state: SundayMealCookSignupFormState,
  formData: FormData
): Promise<SundayMealCookSignupFormState> {
  try {
    const { allowed } = await checkRateLimit("signup:sunday-meals");
    if (!allowed) {
      return { message: "Too many signup attempts. Please try again in 15 minutes." };
    }

    const rawServings = formData.get("servings");
    const servings = rawServings === null || String(rawServings).trim() === "" ? undefined : Number(rawServings);

    const validatedFields = SundayMealCookSignupSchema.safeParse({
      name: formData.get("name"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      availability: formData.getAll("availability"),
      cooking_details: formData.get("cooking_details"),
      dietary_notes: formData.get("dietary_notes"),
      servings,
      notes: formData.get("notes"),
    });

    if (!validatedFields.success) {
      return { errors: validatedFields.error.flatten().fieldErrors };
    }

    const data = validatedFields.data;

    await createSundayMealCook({
      name: data.name,
      email: data.email,
      phone: data.phone,
      availability: data.availability,
      cookingDetails: data.cooking_details,
      dietaryNotes: data.dietary_notes,
      servings: data.servings,
      notes: data.notes,
    });

    return { message: "success" };
  } catch (e) {
    console.error("sunday meals signup action error:", e);
    return { message: getErrorMessage() };
  }
}

export async function updateSundayMealCookAction(
  id: number,
  status: SundayMealCookStatus,
  internalNotes: string | null
): Promise<{ success: boolean; message: string; cooks?: Awaited<ReturnType<typeof getSundayMealCooks>> }> {
  try {
    await updateSundayMealCook(id, { status, internal_notes: internalNotes });
    const cooks = await getSundayMealCooks();
    return { success: true, message: "Cook updated successfully.", cooks };
  } catch (e) {
    console.error("updateSundayMealCook action error:", e);
    return { success: false, message: "Failed to update cook." };
  }
}
