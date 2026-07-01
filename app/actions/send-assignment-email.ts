"use server";

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
    const driverEmail = formData.get("driver_email") as string;
    const driverName = formData.get("driver_name") as string;
    const recipientName = formData.get("recipient_name") as string;
    const deliveryDate = formData.get("delivery_date") as string;
    const deliveryDay = formData.get("delivery_day") as string;
    const mealType = formData.get("meal_type") as string;
    const address = formData.get("address") as string;

    if (!driverEmail || !driverName || !recipientName || !deliveryDate || !deliveryDay || !mealType || !address) {
      return { success: false, message: "Missing required fields." };
    }

    const formattedDate = new Date(deliveryDate + "T00:00:00").toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });

    const dayLabel = deliveryDay === "wednesday" ? "Wednesday" : "Thursday";
    const subject = `Meal Delivery Assignment — ${formattedDate}`;
    const text = `Hi ${driverName},

You have been assigned a meal delivery.

Delivery: ${formattedDate} (${dayLabel})
Recipient: ${recipientName}
Address: ${address}
Meal Type: ${mealType}

Please arrive at the pickup location on time.

Take care,
Mel
Purple Fireflies`;

    await sendEmail({
      to: driverEmail,
      subject,
      text,
    });

    return { success: true, message: `Assignment email sent to ${driverName}.` };
  } catch (e) {
    return {
      success: false,
      message: `Failed to send email: ${e instanceof Error ? e.message : "unknown error"}`,
    };
  }
}
