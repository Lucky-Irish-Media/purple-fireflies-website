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

    const address = `${signup.address1}${signup.address2 ? ", " + signup.address2 : ""}, ${signup.city}, ${signup.state} ${signup.zip_code}`;
    const isWednesday = signup.delivery_day === "wednesday";
    const location = isWednesday
      ? "Episcopal Church of the Good Shepherd, 64 University Terrace, Athens, OH 45701"
      : "United Campus Ministries, 18 N College St, Athens, OH 45701";
    const time = isWednesday ? "12:00pm" : "5:00pm";
    const shortLocation = isWednesday ? "Episcopal Church" : "UCM";
    const dayLabel = isWednesday ? "Wednesday" : "Thursday";
    const subject = `Meal Delivery ${formattedDate} ${time} at ${shortLocation}`;
    const text = `Hi ${driver.name},

You have been assigned a meal delivery.

Delivery: ${formattedDate} (${dayLabel})
Recipient: ${signup.name}
Address: ${address}
Meal Type: ${signup.meal_type}

Please arrive at the ${location} at ${time} to pickup the meals.

Take care,
Meal Delivery Coordinator
Purple Fireflies`;

    await sendEmail({
      to: driver.email,
      subject,
      text,
    });

    return { success: true, message: `Assignment email sent to ${driver.name}.` };
  } catch {
    console.error("sendAssignmentEmail action error:");
    return {
      success: false,
      message: "Failed to send email. Please try again.",
    };
  }
}
