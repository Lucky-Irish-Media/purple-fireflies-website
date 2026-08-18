"use server";

import { revalidatePath } from "next/cache";
import { verifySession } from "@/app/lib/dal";
import { createMealSignup, getWaitlistEntryById, updateWaitlistStatus, deleteWaitlistEntry, getMealSignupCountForDate, addToWaitlist, getWaitlistEntriesByDate } from "@/app/lib/db";
import { getMealsCapForDate } from "@/app/lib/delivery-day";
import { sendWaitlistNotification } from "@/app/lib/email";

export async function convertWaitlistToSignupAction(formData: FormData): Promise<{ success: boolean; message: string }> {
  try {
    await verifySession();

    const waitlistId = Number(formData.get("waitlistId"));
    const regularQuantity = Number(formData.get("regularQuantity"));
    const veganQuantity = Number(formData.get("veganQuantity"));

    if (!waitlistId) {
      return { success: false, message: "Missing waitlist entry ID." };
    }

    const entry = await getWaitlistEntryById(waitlistId);
    if (!entry) {
      return { success: false, message: "Waitlist entry not found." };
    }

    if (entry.status !== "waiting") {
      return { success: false, message: "This entry has already been processed." };
    }

    const count = await getMealSignupCountForDate(entry.delivery_date);
    if (count >= getMealsCapForDate(entry.delivery_date)) {
      return { success: false, message: "This date is still at capacity. Cannot convert." };
    }
    await createMealSignup({
      participantId: entry.participant_id,
      regularQuantity,
      veganQuantity,
      deliveryDate: entry.delivery_date,
      comments: entry.comments ?? undefined,
    });

    await updateWaitlistStatus(waitlistId, "converted");

    revalidatePath("/admin/programs/meal-delivery");

    return { success: true, message: "Waitlist entry converted to signup successfully." };
  } catch (e) {
    console.error("convertWaitlist action error:", e);
    return { success: false, message: "Failed to convert waitlist entry." };
  }
}

export async function notifyWaitlistEntryAction(id: number): Promise<{ success: boolean; message: string }> {
  try {
    await verifySession();

    const entry = await getWaitlistEntryById(id);
    if (!entry) {
      return { success: false, message: "Waitlist entry not found." };
    }

    if (entry.status !== "waiting") {
      return { success: false, message: "This entry has already been processed." };
    }

    await sendWaitlistNotification(entry);
    await updateWaitlistStatus(id, "notified");

    revalidatePath("/admin/programs/meal-delivery");

    return { success: true, message: `Notification sent to ${entry.participant_name}.` };
  } catch (e) {
    console.error("notifyWaitlist action error:", e);
    return { success: false, message: "Failed to send notification." };
  }
}

export async function removeWaitlistEntryAction(id: number): Promise<{ success: boolean; message: string }> {
  try {
    await verifySession();

    const entry = await getWaitlistEntryById(id);
    if (!entry) {
      return { success: false, message: "Waitlist entry not found." };
    }

    await deleteWaitlistEntry(id);

    revalidatePath("/admin/programs/meal-delivery");

    return { success: true, message: `${entry.participant_name} removed from waitlist.` };
  } catch (e) {
    console.error("removeWaitlist action error:", e);
    return { success: false, message: "Failed to remove waitlist entry." };
  }
}

export async function duplicateWaitlistEntryAction(
  _prevState: { success: boolean; message: string },
  formData: FormData,
): Promise<{ success: boolean; message: string }> {
  try {
    await verifySession();

    const id = Number(formData.get("id"));
    const deliveryDate = formData.get("deliveryDate") as string;

    if (!id || !deliveryDate) {
      return { success: false, message: "Missing required fields." };
    }

    const original = await getWaitlistEntryById(id);
    if (!original) {
      return { success: false, message: "Original waitlist entry not found." };
    }

    const existingForDate = await getWaitlistEntriesByDate(deliveryDate);
    const duplicateExists = existingForDate.some(
      (e) => e.participant_id === original.participant_id,
    );
    if (duplicateExists) {
      return { success: false, message: "This participant already has a waitlist entry for the selected date." };
    }

    await addToWaitlist({
      participantId: original.participant_id,
      deliveryDate,
      regularQuantity: original.regular_quantity,
      veganQuantity: original.vegan_quantity,
      comments: original.comments ?? undefined,
    });

    revalidatePath("/admin/programs/meal-delivery");

    return { success: true, message: "Waitlist entry duplicated successfully." };
  } catch (e) {
    console.error("duplicateWaitlist action error:", e);
    return { success: false, message: "Failed to duplicate waitlist entry." };
  }
}
