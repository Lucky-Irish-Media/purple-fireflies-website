"use server";

import { MealSignupSchema, type MealSignupFormState } from "@/app/lib/definitions";
import { createMealSignup, getParticipantByEmail, createParticipant, updateParticipant } from "@/app/lib/db";
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
      deliveryDates,
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
    for (const deliveryDate of data.deliveryDates) {
      if (data.regularQuantity > 0) {
        const signup = await createMealSignup({
          participantId: participant.id,
          mealType: "regular",
          deliveryDate,
          quantity: data.regularQuantity,
          comments: data.comments,
        });
        signups.push(signup);
      }
      if (data.veganQuantity > 0) {
        const signup = await createMealSignup({
          participantId: participant.id,
          mealType: "vegan",
          deliveryDate,
          quantity: data.veganQuantity,
          comments: data.comments,
        });
        signups.push(signup);
      }
    }

    await sendMealSignupConfirmation(signups, participant);

    const datesFormatted = data.deliveryDates.map((d) => new Date(d).toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })).join(", ");

    return { message: "success", selectedDate: datesFormatted };
  } catch (e) {
    console.error("meal signup action error:", e);
    return { message: getErrorMessage() };
  }
}
