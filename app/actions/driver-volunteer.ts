"use server";

import { DriverVolunteerSchema, type DriverVolunteerFormState } from "@/app/lib/definitions";
import { createDriverVolunteer, getParticipantByEmail, createParticipant, updateParticipant, getDriverVolunteersByEmailOrPhone } from "@/app/lib/db";
import { checkRateLimit } from "@/app/lib/rate-limit";

function getErrorMessage(): string {
  return "An unexpected error occurred. Please try again.";
}

export async function submitDriverVolunteer(
  _state: DriverVolunteerFormState,
  formData: FormData
): Promise<DriverVolunteerFormState> {
  try {
    const { allowed } = await checkRateLimit("signup:driver");
    if (!allowed) {
      return { message: "Too many signup attempts. Please try again in 15 minutes." };
    }

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

    const existingVolunteers = await getDriverVolunteersByEmailOrPhone(data.email, data.phone);
    const existingDates = new Set(
      existingVolunteers.map((v) => v.delivery_date)
    );

    const newDates = data.deliveryDates.filter((d) => !existingDates.has(d));
    const duplicateDates = data.deliveryDates.filter((d) => existingDates.has(d));

    const signups = [];
    for (const deliveryDate of newDates) {
      const signup = await createDriverVolunteer({
        participantId: participant.id,
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
    return { message: getErrorMessage() };
  }
}
