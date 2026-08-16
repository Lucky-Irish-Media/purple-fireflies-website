"use server";

import { verifySession } from "@/app/lib/dal";
import { getMealSignupById, getDriverById } from "@/app/lib/db";
import { getDeliveryDaySchedule } from "@/app/lib/delivery-day";
import { sendEmail } from "@/app/lib/email";

export interface SendAssignmentEmailState {
  success: boolean;
  message: string;
}

export async function sendAssignmentEmail(
  _prevState: SendAssignmentEmailState | null,
  formData: FormData,
): Promise<SendAssignmentEmailState> {
  try {
    await verifySession();

    const signupId = Number(formData.get("signup_id"));
    const driverId = Number(formData.get("driver_id"));

    if (!signupId || !driverId) {
      return { success: false, message: "Missing required fields." };
    }

    const signup = await getMealSignupById(signupId);
    const driver = await getDriverById(driverId);

    if (!signup || !driver) {
      return { success: false, message: "Signup or driver not found." };
    }

    const formattedDate = new Date(signup.delivery_date + "T00:00:00").toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });

    const address = `${signup.participant_address1}${signup.participant_address2 ? ", " + signup.participant_address2 : ""}, ${signup.participant_city}, ${signup.participant_state} ${signup.participant_zip_code}`;
    const schedule = getDeliveryDaySchedule(signup.delivery_day);
    const mealParts: string[] = [];
    if (signup.regular_quantity > 0) mealParts.push(`${signup.regular_quantity} Regular`);
    if (signup.vegan_quantity > 0) mealParts.push(`${signup.vegan_quantity} Vegan/GF`);
    const subject = schedule.shortLocation
      ? `Meal Delivery ${formattedDate} ${schedule.time} at ${schedule.shortLocation}`
      : `Meal Delivery ${formattedDate}`;
    const pickupLine = schedule.location
      ? `Please arrive at the ${schedule.location} at ${schedule.time} to pickup the meals.`
      : "Pickup details will be provided by the meal delivery coordinator.";
    const text = `Hi ${driver.participant_name},

You have been assigned a meal delivery.

Delivery: ${formattedDate}
Recipient: ${signup.participant_name}
Address: ${address}
Meals: ${mealParts.join(" + ")}
Comments: ${signup.comments || "None"}

${pickupLine}

Take care,
Meal Delivery Coordinator
Purple Fireflies`;

    await sendEmail({
      to: driver.participant_email,
      subject,
      text,
    });

    return { success: true, message: `Assignment email sent to ${driver.participant_name}.` };
  } catch {
    console.error("sendAssignmentEmail action error:");
    return {
      success: false,
      message: "Failed to send email. Please try again.",
    };
  }
}
