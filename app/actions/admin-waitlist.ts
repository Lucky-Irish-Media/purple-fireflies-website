"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { verifySession } from "@/app/lib/dal";
import { createMealSignup, getWaitlistEntryById, updateWaitlistStatus, deleteWaitlistEntry, getMealSignupCountForDate, addToWaitlist, getWaitlistEntriesByDate, getParticipantByEmail, createParticipant, updateParticipant } from "@/app/lib/db";
import { getMealsCapForDate } from "@/app/lib/delivery-day";
import { sendWaitlistNotification } from "@/app/lib/email";

const phoneRegex = /^(\+1[-\s.]?)?\(?\d{3}\)?[-\s.]?\d{3}[-\s.]?\d{4}$/;

const stateAbbreviations = [
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA",
  "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
  "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
  "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC",
  "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY"
] as const;

const CreateWaitlistEntrySchema = z.object({
  name: z.string().min(1, "Name is required.").trim(),
  email: z.string().email("Please enter a valid email.").trim(),
  phone: z.string().regex(phoneRegex, "Please enter a valid phone number.").trim(),
  address1: z.string().min(1, "Address is required.").trim(),
  address2: z.string().optional(),
  city: z.string().min(1, "City is required.").trim(),
  state: z.enum(stateAbbreviations, "Please select a valid state."),
  zipCode: z.string().min(5, "ZIP code is required.").max(10).trim(),
  contactMethod: z.enum(["call", "text", "email"], "Please select a contact method."),
  deliveryDate: z.string().min(1, "Delivery date is required."),
  regularQuantity: z.coerce.number().int().min(0).max(10),
  veganQuantity: z.coerce.number().int().min(0).max(10),
  comments: z.string().optional(),
  internalNotes: z.string().optional(),
}).refine((data) => {
  const total = data.regularQuantity + data.veganQuantity;
  return total >= 1;
}, { message: "Total meals must be at least 1.", path: ["regularQuantity"] });

export type AdminWaitlistActionState = {
  errors?: Record<string, string[]>;
  message?: string;
  success?: boolean;
} | undefined;

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

export async function createWaitlistEntryAction(
  _prevState: AdminWaitlistActionState,
  formData: FormData,
): Promise<AdminWaitlistActionState> {
  try {
    await verifySession();

    const validated = CreateWaitlistEntrySchema.safeParse({
      name: formData.get("name"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      address1: formData.get("address1"),
      address2: formData.get("address2"),
      city: formData.get("city"),
      state: formData.get("state"),
      zipCode: formData.get("zipCode"),
      contactMethod: formData.get("contactMethod"),
      deliveryDate: formData.get("deliveryDate"),
      regularQuantity: formData.get("regularQuantity"),
      veganQuantity: formData.get("veganQuantity"),
      comments: formData.get("comments"),
      internalNotes: formData.get("internalNotes"),
    });

    if (!validated.success) {
      return { errors: validated.error.flatten().fieldErrors };
    }

    const data = validated.data;

    let participant = await getParticipantByEmail(data.email);
    if (participant) {
      participant = await updateParticipant(participant.id, {
        name: data.name,
        email: data.email,
        phone: data.phone,
        address1: data.address1,
        address2: data.address2,
        city: data.city,
        state: data.state,
        zipCode: data.zipCode,
        contactMethod: data.contactMethod,
        internalNotes: data.internalNotes,
      });
    } else {
      participant = await createParticipant({
        name: data.name,
        email: data.email,
        phone: data.phone,
        address1: data.address1,
        address2: data.address2,
        city: data.city,
        state: data.state,
        zipCode: data.zipCode,
        contactMethod: data.contactMethod,
        internalNotes: data.internalNotes,
      });
    }

    const existingForDate = await getWaitlistEntriesByDate(data.deliveryDate);
    const duplicateExists = existingForDate.some(
      (e) => e.participant_id === participant.id,
    );
    if (duplicateExists) {
      return { message: "This participant already has a waitlist entry for the selected date." };
    }

    await addToWaitlist({
      participantId: participant.id,
      deliveryDate: data.deliveryDate,
      regularQuantity: data.regularQuantity,
      veganQuantity: data.veganQuantity,
      comments: data.comments,
    });

    revalidatePath("/admin/programs/meal-delivery");

    return { message: "Waitlist entry added successfully.", success: true };
  } catch (e) {
    console.error("createWaitlistEntry action error:", e);
    return { message: "Failed to add waitlist entry. Please try again." };
  }
}
