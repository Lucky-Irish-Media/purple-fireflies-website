"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { verifySession } from "@/app/lib/dal";
import { createDriverVolunteer, updateDriverVolunteer, getDriverVolunteers, getDriverById, getDriverVolunteersByParticipantAndDate, getParticipantByEmail, createParticipant, updateParticipant, updateDriverBag, updateDriverParticipantStatus } from "@/app/lib/db";
import type { DriverVolunteerWithParticipant } from "@/app/lib/definitions";

const phoneRegex = /^(\+1[-\s.]?)?\(?\d{3}\)?[-\s.]?\d{3}[-\s.]?\d{4}$/;

const regions = ["North", "South", "East", "West", "The Plains", "Chauncey", "Glouster/Jacksonville/Trimble"] as const;

const AdminDriverVolunteerSchema = z.object({
  name: z.string().min(1, "Name is required.").trim(),
  email: z.string().email("Please enter a valid email.").trim(),
  phone: z.string().regex(phoneRegex, "Please enter a valid phone number.").trim(),
  onSignal: z.enum(["yes", "no", "willing"], "Please select an option."),
  regions: z.array(z.enum(regions)).min(1, "Select at least one region."),
  deliveryDate: z.string().min(1, "Delivery date is required."),
});

export type AdminDriverVolunteerActionState = {
  errors?: Record<string, string[]>;
  message?: string;
  volunteers?: DriverVolunteerWithParticipant[];
} | undefined;

const AdminDriverVolunteerUpdateSchema = z.object({
  id: z.coerce.number(),
  name: z.string().min(1, "Name is required.").trim(),
  email: z.string().email("Please enter a valid email.").trim(),
  phone: z.string().regex(phoneRegex, "Please enter a valid phone number.").trim(),
  onSignal: z.enum(["yes", "no", "willing"], "Please select an option."),
  regions: z.array(z.enum(regions)).min(1, "Select at least one region."),
  deliveryDate: z.string().min(1, "Delivery date is required."),
});

export async function updateDriverVolunteerAction(
  _prevState: AdminDriverVolunteerActionState,
  formData: FormData,
): Promise<AdminDriverVolunteerActionState> {
  try {
    await verifySession();

    const regions = formData.getAll("regions") as string[];

    const validated = AdminDriverVolunteerUpdateSchema.safeParse({
      id: formData.get("id"),
      name: formData.get("name"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      onSignal: formData.get("onSignal"),
      regions,
      deliveryDate: formData.get("deliveryDate"),
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
        address1: "",
        city: "",
        state: "OH",
        zipCode: "",
        contactMethod: "call",
      });
    } else {
      participant = await createParticipant({
        name: data.name,
        email: data.email,
        phone: data.phone,
        address1: "",
        city: "",
        state: "OH",
        zipCode: "",
        contactMethod: "call",
      });
    }

    await updateDriverVolunteer(data.id, {
      participantId: participant.id,
      onSignal: data.onSignal,
      regions: data.regions.join(", "),
      deliveryDate: data.deliveryDate,
    });

    const volunteers = await getDriverVolunteers();

    revalidatePath("/admin/programs/meal-delivery");

    return { message: "Driver volunteer updated successfully.", volunteers };
  } catch (e) {
    console.error("updateDriverVolunteer action error:", e);
    return { message: "Failed to update driver volunteer. Please try again." };
  }
}

export async function createDriverVolunteerAction(
  _prevState: AdminDriverVolunteerActionState,
  formData: FormData,
): Promise<AdminDriverVolunteerActionState> {
  try {
    await verifySession();

    const regions = formData.getAll("regions") as string[];

    const validated = AdminDriverVolunteerSchema.safeParse({
      name: formData.get("name"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      onSignal: formData.get("onSignal"),
      regions,
      deliveryDate: formData.get("deliveryDate"),
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
        address1: "",
        city: "",
        state: "OH",
        zipCode: "",
        contactMethod: "call",
      });
    } else {
      participant = await createParticipant({
        name: data.name,
        email: data.email,
        phone: data.phone,
        address1: "",
        city: "",
        state: "OH",
        zipCode: "",
        contactMethod: "call",
      });
    }

    await createDriverVolunteer({
      participantId: participant.id,
      onSignal: data.onSignal,
      regions: data.regions.join(", "),
      deliveryDate: data.deliveryDate,
    });

    const volunteers = await getDriverVolunteers();

    revalidatePath("/admin/programs/meal-delivery");

    return { message: "Driver volunteer added successfully.", volunteers };
  } catch (e) {
    console.error("createDriverVolunteer action error:", e);
    return { message: "Failed to add driver volunteer. Please try again." };
  }
}

export async function duplicateDriverVolunteerAction(
  _prevState: AdminDriverVolunteerActionState,
  formData: FormData,
): Promise<AdminDriverVolunteerActionState> {
  try {
    await verifySession();

    const id = Number(formData.get("id"));
    const deliveryDate = formData.get("deliveryDate") as string;

    if (!id || !deliveryDate) {
      return { message: "Missing required fields." };
    }

    const existing = await getDriverById(id);
    if (!existing) {
      return { message: "Original volunteer not found." };
    }

    const existingForDate = await getDriverVolunteersByParticipantAndDate(existing.participant_id, deliveryDate);
    if (existingForDate.length > 0) {
      return { message: "This participant already has a volunteer entry for the selected date." };
    }

    await createDriverVolunteer({
      participantId: existing.participant_id,
      onSignal: existing.on_signal,
      regions: existing.regions,
      deliveryDate,
    });

    const volunteers = await getDriverVolunteers();
    revalidatePath("/admin/programs/meal-delivery");

    return { message: "Volunteer duplicated successfully.", volunteers };
  } catch (e) {
    console.error("duplicateDriverVolunteer action error:", e);
    return { message: "Failed to duplicate volunteer. Please try again." };
  }
}

export async function updateDriverBagAction(formData: FormData): Promise<{ success: boolean; message: string }> {
  try {
    await verifySession();

    const participantId = Number(formData.get("participantId"));
    const bagNumber = formData.get("bagNumber") as string | null;

    if (!participantId) {
      return { success: false, message: "Invalid participant ID." };
    }

    await updateDriverBag(participantId, bagNumber?.trim() ? bagNumber.trim() : null);

    revalidatePath("/admin/programs/meal-delivery");
    return { success: true, message: "Bag updated." };
  } catch (e) {
    console.error("updateDriverBag action error:", e);
    return { success: false, message: "Failed to update bag." };
  }
}

export async function updateDriverStatusAction(formData: FormData): Promise<{ success: boolean; message: string }> {
  try {
    await verifySession();

    const participantId = Number(formData.get("participantId"));
    if (!participantId) {
      return { success: false, message: "Invalid participant ID." };
    }

    const updates: { driver_liability?: number; driver_status?: "active" | "inactive" } = {};

    // Liability is sent as an explicit "on"/"" value from the checkbox cell.
    if (formData.has("liability")) {
      updates.driver_liability = formData.get("liability") === "on" ? 1 : 0;
    }
    // Status is only sent from the status toggle cell.
    if (formData.has("status")) {
      updates.driver_status = formData.get("status") === "active" ? "active" : "inactive";
    }

    if (Object.keys(updates).length === 0) {
      return { success: false, message: "No changes provided." };
    }

    await updateDriverParticipantStatus(participantId, updates);

    revalidatePath("/admin/programs/meal-delivery");
    return { success: true, message: "Driver status updated." };
  } catch (e) {
    console.error("updateDriverStatus action error:", e);
    return { success: false, message: "Failed to update driver status." };
  }
}
