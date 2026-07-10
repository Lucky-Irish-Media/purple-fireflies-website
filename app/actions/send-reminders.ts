"use server";

import { verifySession } from "@/app/lib/dal";
import { getAssignmentsForDate } from "@/app/lib/db";
import { sendEmail } from "@/app/lib/email";

export interface SendRemindersState {
  success: boolean;
  message: string;
  sent: number;
  results?: Array<{
    driver: string;
    email: string;
    deliveries: number;
    status: string;
  }>;
}

export async function sendDriverReminders(
  _prevState: SendRemindersState | null,
  formData: FormData,
): Promise<SendRemindersState> {
  try {
    await verifySession();

    const date = formData.get("date") as string;
    if (!date) {
      return { success: false, message: "Please select a date.", sent: 0, results: [] };
    }

    const drivers = await getAssignmentsForDate(date);

    const formattedDate = new Date(date + "T00:00:00").toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });

    if (drivers.length === 0) {
      return { success: true, message: `No deliveries scheduled for ${formattedDate}.`, sent: 0, results: [] };
    }

    const results: SendRemindersState["results"] = [];

    for (const driver of drivers) {
      const isWednesday = driver.delivery_day === "wednesday";
      const location = isWednesday
        ? "Episcopal Church of the Good Shepherd, 64 University Terrace, Athens, OH 45701"
        : "United Campus Ministries, 18 N College St, Athens, OH 45701";
      const time = isWednesday ? "12:00pm" : "5:00pm";
      const shortLocation = isWednesday ? "Episcopal Church" : "UCM";

      const formattedDate = new Date(driver.delivery_date + "T00:00:00").toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      });
      const subject = `Meal Delivery ${formattedDate} ${time} at ${shortLocation}`;

      let body = `Please arrive at the ${location} at ${time} to pickup the meals.\n\n`;
      body += `Persons you are delivering to:\n`;

      for (const delivery of driver.deliveries) {
        body += `Name: ${delivery.meal_name}\n`;
        body += `Phone: ${delivery.meal_phone}\n`;
        body += `Address: ${delivery.address}\n`;
        body += `Comments: ${delivery.comments || "None"}\n`;
        const mealParts: string[] = [];
        if (delivery.regular_quantity > 0) mealParts.push(`${delivery.regular_quantity} Regular`);
        if (delivery.vegan_quantity > 0) mealParts.push(`${delivery.vegan_quantity} Vegan/GF`);
        body += `Meals: ${mealParts.join(" + ") || "None"}\n\n`;
      }

      body += `Take care,\nMeal Delivery Coordinator\nPurple Fireflies`;

      try {
        await sendEmail({
          to: driver.driver_email,
          subject,
          text: body,
        });
        results.push({
          driver: driver.driver_name,
          email: driver.driver_email,
          deliveries: driver.deliveries.length,
          status: "sent",
        });
      } catch {
        results.push({
          driver: driver.driver_name,
          email: driver.driver_email,
          deliveries: driver.deliveries.length,
          status: "failed: email send error",
        });
      }
    }

    const sent = results.filter((r) => r.status === "sent").length;
    const failed = results.filter((r) => r.status !== "sent").length;
    const message = failed > 0
      ? `Sent ${sent} email(s), ${failed} failed.`
      : `Sent ${sent} reminder email(s).`;

    return { success: failed === 0, message, sent, results };
  } catch {
    console.error("sendDriverReminders action error:");
    return {
      success: false,
      message: "Failed to send reminders. Please try again.",
      sent: 0,
    };
  }
}
