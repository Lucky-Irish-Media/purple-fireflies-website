"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createDriverVolunteer, getDriverVolunteers } from "@/app/lib/db";
import type { DriverVolunteer } from "@/app/lib/definitions";

const phoneRegex = /^(\+1[-\s.]?)?\(?\d{3}\)?[-\s.]?\d{3}[-\s.]?\d{4}$/;

const regions = ["North", "South", "East", "West", "The Plains", "Chauncey", "Glouster/Jacksonville/Trimble"] as const;

const AdminDriverVolunteerSchema = z.object({
  name: z.string().min(1, "Name is required.").trim(),
  email: z.string().email("Please enter a valid email.").trim(),
  phone: z.string().regex(phoneRegex, "Please enter a valid phone number.").trim(),
  onSignal: z.enum(["yes", "no", "willing"], "Please select an option."),
  regions: z.string().min(1, "At least one region is required."),
  deliveryDate: z.string().min(1, "Delivery date is required."),
});

export type AdminDriverVolunteerActionState = {
  errors?: Record<string, string[]>;
  message?: string;
  volunteers?: DriverVolunteer[];
} | undefined;

export async function createDriverVolunteerAction(
  _prevState: AdminDriverVolunteerActionState,
  formData: FormData,
): Promise<AdminDriverVolunteerActionState> {
  try {
    const validated = AdminDriverVolunteerSchema.safeParse({
      name: formData.get("name"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      onSignal: formData.get("onSignal"),
      regions: formData.get("regions"),
      deliveryDate: formData.get("deliveryDate"),
    });

    if (!validated.success) {
      return { errors: validated.error.flatten().fieldErrors };
    }

    const data = validated.data;

    await createDriverVolunteer({
      name: data.name,
      email: data.email,
      phone: data.phone,
      onSignal: data.onSignal,
      regions: data.regions,
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
