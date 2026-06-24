"use server";

import { DriverVolunteerSchema, type DriverVolunteerFormState } from "@/app/lib/definitions";
import { createDriverVolunteer } from "@/app/lib/db";

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
      deliveryDates,
      regions,
    });

    if (!validatedFields.success) {
      return { errors: validatedFields.error.flatten().fieldErrors };
    }

    const data = validatedFields.data;

    const signups = [];
    for (const deliveryDate of data.deliveryDates) {
      const signup = await createDriverVolunteer({
        name: data.name,
        email: data.email,
        phone: data.phone,
        regions: data.regions.join(", "),
        deliveryDate,
      });
      signups.push(signup);
    }

    const datesFormatted = data.deliveryDates
      .map((d) => new Date(d).toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" }))
      .join(", ");

    return { message: "success", selectedDates: datesFormatted };
  } catch (e) {
    console.error("driver volunteer action error:", e);
    return { message: getErrorMessage(e) };
  }
}