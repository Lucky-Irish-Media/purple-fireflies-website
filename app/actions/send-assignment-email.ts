"use server";

import { verifySession } from "@/app/lib/dal";
import { getMealSignupById, getDriverById } from "@/app/lib/db";
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
    const isWednesday = signup.delivery_day === "wednesday";
    const location = isWednesday
      ? "Episcopal Church of the Good Shepherd, 64 University Terrace, Athens, OH 45701"
      : "United Campus Ministries, 18 N College St, Athens, OH 45701";
    const time = isWednesday ? "12:00pm" : "5:00pm";
    const shortLocation = isWednesday ? "Episcopal Church" : "UCM";
    const dayLabel = isWednesday ? "Wednesday" : "Thursday";
    const mealParts: string[] = [];
    if (signup.regular_quantity > 0) mealParts.push(`${signup.regular_quantity} Regular`);
    if (signup.vegan_quantity > 0) mealParts.push(`${signup.vegan_quantity} Vegan/GF`);
    const subject = `Meal Delivery ${formattedDate} ${time} at ${shortLocation}`;
    const text = `Hi ${driver.participant_name},

You have been assigned a meal delivery.

Delivery: ${formattedDate} (${dayLabel})
Recipient: ${signup.participant_name}
Address: ${address}
Meals: ${mealParts.join(" + ")}

Please arrive at the ${location} at ${time} to pickup the meals.

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
