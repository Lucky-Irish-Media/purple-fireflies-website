"use server";

import { revalidatePath } from "next/cache";
import { createAssignment, deleteAssignmentByMealSignupId } from "@/app/lib/db";

export async function assignDriverAction(formData: FormData): Promise<{ success: boolean; message: string }> {
  try {
    const mealSignupId = Number(formData.get("mealSignupId"));
    const driverVolunteerId = formData.get("driverVolunteerId");

    if (!mealSignupId) {
      return { success: false, message: "Invalid meal signup ID." };
    }

    if (!driverVolunteerId || driverVolunteerId === "0") {
      await deleteAssignmentByMealSignupId(mealSignupId);
      revalidatePath("/admin/programs/meal-delivery");
      return { success: true, message: "Driver unassigned." };
    }

    await createAssignment(mealSignupId, Number(driverVolunteerId));
    revalidatePath("/admin/programs/meal-delivery");
    return { success: true, message: "Driver assigned." };
  } catch (e) {
    console.error("assign driver action error:", e);
    return { success: false, message: "Failed to assign driver." };
  }
}
