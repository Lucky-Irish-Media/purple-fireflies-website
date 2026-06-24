"use server";

import { DriverVolunteerSchema, type DriverVolunteerFormState } from "@/app/lib/definitions";
import { createDriverVolunteer, getDriverVolunteers } from "@/app/lib/db";

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

export async function submitDriverVolunteer(
  _state: DriverVolunteerFormState,
  formData: FormData
): Promise<DriverVolunteerFormState> {
  try {
    const deliveryDates = formData.getAll("deliveryDates") as string[];
    const regions = formData.getAll("regions") as string[];

    const validatedFields = DriverVolunteerSchema.safeParse({
      name: formData.get("name"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      onSignal: formData.get("onSignal"),
      deliveryDates,
      regions,
    });

    if (!validatedFields.success) {
      return { errors: validatedFields.error.flatten().fieldErrors };
    }

    const data = validatedFields.data;

    const existingVolunteers = await getDriverVolunteers();
    const existingDates = new Set(
      existingVolunteers
        .filter((v) => v.email === data.email || v.phone === data.phone)
        .map((v) => v.delivery_date)
    );

    const newDates = data.deliveryDates.filter((d) => !existingDates.has(d));
    const duplicateDates = data.deliveryDates.filter((d) => existingDates.has(d));

    const signups = [];
    for (const deliveryDate of newDates) {
      const signup = await createDriverVolunteer({
        name: data.name,
        email: data.email,
        phone: data.phone,
        onSignal: data.onSignal,
        regions: data.regions.join(", "),
        deliveryDate,
      });
      signups.push(signup);
    }

    let message = "success";
    let selectedDates = newDates
      .map((d) => new Date(d).toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" }))
      .join(", ");

    if (duplicateDates.length > 0) {
      const dupFormatted = duplicateDates
        .map((d) => new Date(d).toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" }))
        .join(", ");
      if (newDates.length > 0) {
        message = `Added: ${selectedDates}. Already signed up: ${dupFormatted}.`;
      } else {
        message = `You were already signed up for: ${dupFormatted}.`;
      }
      selectedDates = data.deliveryDates
        .map((d) => new Date(d).toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" }))
        .join(", ");
    }

    return { message, selectedDates };
  } catch (e) {
    console.error("driver volunteer action error:", e);
    return { message: getErrorMessage(e) };
  }
}