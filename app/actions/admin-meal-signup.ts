"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { verifySession } from "@/app/lib/dal";
import { createMealSignup, updateMealSignup, getMealSignupsWithAssignments, getParticipantByEmail, createParticipant, updateParticipant, getMealSignupById } from "@/app/lib/db";
import type { MealSignupWithAssignment } from "@/app/lib/definitions";

const phoneRegex = /^(\+1[-\s.]?)?\(?\d{3}\)?[-\s.]?\d{3}[-\s.]?\d{4}$/;

const stateAbbreviations = [
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA",
  "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
  "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
  "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC",
  "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY"
] as const;

const AdminMealSignupSchema = z.object({
  name: z.string().min(1, "Name is required.").trim(),
  email: z.string().email("Please enter a valid email.").trim(),
  phone: z.string().regex(phoneRegex, "Please enter a valid phone number.").trim(),
  address1: z.string().min(1, "Address is required.").trim(),
  address2: z.string().optional(),
  city: z.string().min(1, "City is required.").trim(),
  state: z.enum(stateAbbreviations, "Please select a valid state."),
  zipCode: z.string().min(5, "ZIP code is required.").max(10).trim(),
  regularQuantity: z.coerce.number().int().min(0).max(2),
  veganQuantity: z.coerce.number().int().min(0).max(2),
  contactMethod: z.enum(["call", "text", "email"], "Please select a contact method."),
  deliveryDate: z.string().min(1, "Delivery date is required."),
  comments: z.string().optional(),
  bagNumber: z.string().optional(),
  internalNotes: z.string().optional(),
}).refine((data) => {
  const total = data.regularQuantity + data.veganQuantity;
  return total >= 1 && total <= 2;
}, { message: "Total meals must be 1 or 2.", path: ["regularQuantity"] });

export type AdminMealSignupActionState = {
  errors?: Record<string, string[]>;
  message?: string;
  signups?: MealSignupWithAssignment[];
} | undefined;

const AdminMealSignupUpdateSchema = z.object({
  id: z.coerce.number(),
  name: z.string().min(1, "Name is required.").trim(),
  email: z.string().email("Please enter a valid email.").trim(),
  phone: z.string().regex(phoneRegex, "Please enter a valid phone number.").trim(),
  address1: z.string().min(1, "Address is required.").trim(),
  address2: z.string().optional(),
  city: z.string().min(1, "City is required.").trim(),
  state: z.enum(stateAbbreviations, "Please select a valid state."),
  zipCode: z.string().min(5, "ZIP code is required.").max(10).trim(),
  regularQuantity: z.coerce.number().int().min(0).max(2),
  veganQuantity: z.coerce.number().int().min(0).max(2),
  contactMethod: z.enum(["call", "text", "email"], "Please select a contact method."),
  deliveryDate: z.string().min(1, "Delivery date is required."),
  comments: z.string().optional(),
  bagNumber: z.string().optional(),
  internalNotes: z.string().optional(),
}).refine((data) => {
  const total = data.regularQuantity + data.veganQuantity;
  return total >= 1 && total <= 2;
}, { message: "Total meals must be 1 or 2.", path: ["regularQuantity"] });

export async function updateMealSignupAction(
  _prevState: AdminMealSignupActionState,
  formData: FormData,
): Promise<AdminMealSignupActionState> {
  try {
    await verifySession();

    const validated = AdminMealSignupUpdateSchema.safeParse({
      id: formData.get("id"),
      name: formData.get("name"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      address1: formData.get("address1"),
      address2: formData.get("address2"),
      city: formData.get("city"),
      state: formData.get("state"),
      zipCode: formData.get("zipCode"),
      regularQuantity: formData.get("regularQuantity"),
      veganQuantity: formData.get("veganQuantity"),
      contactMethod: formData.get("contactMethod"),
      deliveryDate: formData.get("deliveryDate"),
      comments: formData.get("comments"),
      bagNumber: formData.get("bagNumber"),
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
      });
    }

    const existingSignup = await getMealSignupById(data.id);
    const existingParticipantId = existingSignup?.participant_id ?? participant.id;

    await updateMealSignup(data.id, {
      participantId: participant.id,
      regularQuantity: data.regularQuantity,
      veganQuantity: data.veganQuantity,
      deliveryDate: data.deliveryDate,
      comments: data.comments,
      bagNumber: data.bagNumber,
      internalNotes: data.internalNotes,
    });

    const signups = await getMealSignupsWithAssignments();

    revalidatePath("/admin/programs/meal-delivery");

    return { message: "Signup updated successfully.", signups };
  } catch (e) {
    console.error("updateMealSignup action error:", e);
    return { message: "Failed to update signup. Please try again." };
  }
}

export async function createMealSignupAction(
  _prevState: AdminMealSignupActionState,
  formData: FormData,
): Promise<AdminMealSignupActionState> {
  try {
    await verifySession();

    const validated = AdminMealSignupSchema.safeParse({
      name: formData.get("name"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      address1: formData.get("address1"),
      address2: formData.get("address2"),
      city: formData.get("city"),
      state: formData.get("state"),
      zipCode: formData.get("zipCode"),
      regularQuantity: formData.get("regularQuantity"),
      veganQuantity: formData.get("veganQuantity"),
      contactMethod: formData.get("contactMethod"),
      deliveryDate: formData.get("deliveryDate"),
      comments: formData.get("comments"),
      bagNumber: formData.get("bagNumber"),
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
      });
    }

    await createMealSignup({
      participantId: participant.id,
      regularQuantity: data.regularQuantity,
      veganQuantity: data.veganQuantity,
      deliveryDate: data.deliveryDate,
      comments: data.comments,
      bagNumber: data.bagNumber,
      internalNotes: data.internalNotes,
    });

    const signups = await getMealSignupsWithAssignments();

    revalidatePath("/admin/programs/meal-delivery");

    return { message: "Signup added successfully.", signups };
  } catch (e) {
    console.error("createMealSignup action error:", e);
    return { message: "Failed to add signup. Please try again." };
  }
}

export async function updateMealSignupFieldAction(formData: FormData): Promise<{ success: boolean; message: string }> {
  try {
    await verifySession();

    const id = Number(formData.get("id"));
    const field = formData.get("field") as string;
    const value = formData.get("value") as string;

    if (!id || !field) {
      return { success: false, message: "Invalid request." };
    }

    if (field !== "bag_number" && field !== "internal_notes") {
      return { success: false, message: "Invalid field." };
    }

    const { updateMealSignupField } = await import("@/app/lib/db");
    await updateMealSignupField(id, field, value || null);

    revalidatePath("/admin/programs/meal-delivery");
    return { success: true, message: "Updated." };
  } catch (e) {
    console.error("updateMealSignupField action error:", e);
    return { success: false, message: "Failed to update." };
  }
}
