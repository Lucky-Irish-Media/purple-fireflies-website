"use server";

import { revalidatePath } from "next/cache";
import { verifySession } from "@/app/lib/dal";
import { createAssignment, deleteAssignmentByMealSignupId, updateAssignmentDetails } from "@/app/lib/db";

export async function assignDriverAction(formData: FormData): Promise<{ success: boolean; message: string }> {
  try {
    await verifySession();

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

export async function updateAssignmentAction(formData: FormData): Promise<{ success: boolean; message: string }> {
  try {
    await verifySession();

    const mealSignupId = Number(formData.get("mealSignupId"));
    const notes = formData.get("notes") as string | null;
    const bagNumber = formData.get("bagNumber") as string | null;

    if (!mealSignupId) {
      return { success: false, message: "Invalid meal signup ID." };
    }

    await updateAssignmentDetails(mealSignupId, {
      notes: notes || null,
      bag_number: bagNumber || null,
    });

    revalidatePath("/admin/programs/meal-delivery");
    return { success: true, message: "Assignment details updated." };
  } catch (e) {
    console.error("update assignment action error:", e);
    return { success: false, message: "Failed to update assignment details." };
  }
}
