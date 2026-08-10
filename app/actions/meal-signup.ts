"use server";

import { MealSignupSchema, type MealSignupFormState } from "@/app/lib/definitions";
import { createMealSignup, getParticipantByEmail, createParticipant, updateParticipant, getMealSignupsByEmail, getMealSignupCountForDate, MAX_SIGNUPS_PER_DATE, addToWaitlist } from "@/app/lib/db";
import { sendMealSignupConfirmation } from "@/app/lib/email";
import { checkRateLimit } from "@/app/lib/rate-limit";

function isFirstWednesday(dateStr: string): boolean {
  const date = new Date(dateStr + "T00:00:00");
  return date.getDay() === 3 && date.getDate() <= 7;
}

function getErrorMessage(): string {
  return "An unexpected error occurred. Please try again.";
}

export async function submitMealSignup(
  _state: MealSignupFormState,
  formData: FormData
): Promise<MealSignupFormState> {
  try {
    const { allowed } = await checkRateLimit("signup:meal");
    if (!allowed) {
      return { message: "Too many signup attempts. Please try again in 15 minutes." };
    }

    const deliveryDates = formData.getAll("deliveryDates") as string[];
    const waitlistDates = formData.getAll("waitlistDates") as string[];

    const allDates = [...new Set([...deliveryDates, ...waitlistDates])];

    const validatedFields = MealSignupSchema.safeParse({
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
      deliveryDates: allDates,
      comments: formData.get("comments"),
    });

    if (!validatedFields.success) {
      return { errors: validatedFields.error.flatten().fieldErrors };
    }

    const data = validatedFields.data;

    if (data.veganQuantity > 0) {
      const invalidDates = data.deliveryDates.filter((d) => isFirstWednesday(d));
      if (invalidDates.length > 0) {
        return {
          errors: {
            veganQuantity: [
              `Vegan / GF meals are not available on ${invalidDates.length === 1 ? "the first Wednesday" : "the first Wednesdays"} of the month. Please select a different date or choose the Regular meal type.`,
            ],
          },
        };
      }
    }

    const existingSignups = await getMealSignupsByEmail(data.email);
    const existingDates = new Set(existingSignups.map((s) => s.delivery_date));

    const newDates = deliveryDates.filter((d) => !existingDates.has(d));
    const newWaitlistDates = waitlistDates.filter((d) => !existingDates.has(d));
    const duplicateDates = [...new Set([...deliveryDates, ...waitlistDates])].filter((d) => existingDates.has(d));

    for (const date of newDates) {
      const count = await getMealSignupCountForDate(date);
      if (count >= MAX_SIGNUPS_PER_DATE) {
        return { message: `${new Date(date).toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })} is now full. Please add it to the waitlist instead.` };
      }
    }

    for (const date of newWaitlistDates) {
      const count = await getMealSignupCountForDate(date);
      if (count < MAX_SIGNUPS_PER_DATE) {
        return { message: `${new Date(date).toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })} still has space available. Please sign up instead of joining the waitlist.` };
      }
    }

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

    const signups = [];
    for (const deliveryDate of newDates) {
      const signup = await createMealSignup({
        participantId: participant.id,
        regularQuantity: data.regularQuantity,
        veganQuantity: data.veganQuantity,
        deliveryDate,
        comments: data.comments,
      });
      signups.push(signup);
    }

    const waitlisted: string[] = [];
    for (const deliveryDate of newWaitlistDates) {
      await addToWaitlist({
        participantId: participant.id,
        deliveryDate,
        regularQuantity: data.regularQuantity,
        veganQuantity: data.veganQuantity,
      });
      waitlisted.push(deliveryDate);
    }

    await sendMealSignupConfirmation(signups, participant, waitlisted.length > 0 ? waitlisted : undefined);

    const formatDate = (d: string) => new Date(d).toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" });

    if (duplicateDates.length > 0) {
      const dupFormatted = duplicateDates.map(formatDate).join(", ");
      const addedDates = [...newDates, ...newWaitlistDates];
      if (addedDates.length > 0) {
        return { message: `Added: ${addedDates.map(formatDate).join(", ")}. Already signed up: ${dupFormatted}.` };
      }
      return { message: `You were already signed up for: ${dupFormatted}.` };
    }

    if (signups.length > 0 && waitlisted.length === 0) {
      const datesFormatted = newDates.map(formatDate).join(", ");
      return { message: "success", selectedDate: datesFormatted };
    }

    if (signups.length === 0 && waitlisted.length > 0) {
      const datesFormatted = newWaitlistDates.map(formatDate).join(", ");
      return { message: "waitlist_success", selectedDate: datesFormatted };
    }

    const signedUp = newDates.map(formatDate).join(", ");
    const waitlistedStr = newWaitlistDates.map(formatDate).join(", ");
    return { message: "mixed_success", selectedDate: signedUp, waitlistedDates: waitlistedStr };
  } catch (e) {
    console.error("meal signup action error:", e);
    return { message: getErrorMessage() };
  }
}
