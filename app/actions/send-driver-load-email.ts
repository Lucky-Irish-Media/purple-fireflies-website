"use server";

import { verifySession } from "@/app/lib/dal";
import { getDriverById } from "@/app/lib/db";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { sendEmail } from "@/app/lib/email";

export interface SendDriverLoadEmailState {
  success: boolean;
  message: string;
}

export async function sendDriverLoadEmail(
  _prevState: SendDriverLoadEmailState | null,
  formData: FormData,
): Promise<SendDriverLoadEmailState> {
  try {
    await verifySession();

    const driverId = Number(formData.get("driver_id"));
    const deliveryDate = formData.get("delivery_date") as string;
    const deliveryDay = formData.get("delivery_day") as string;

    if (!driverId || !deliveryDate || !deliveryDay) {
      return { success: false, message: "Missing required fields." };
    }

    const driver = await getDriverById(driverId);
    if (!driver) {
      return { success: false, message: "Driver not found." };
    }

    const { env } = await getCloudflareContext({ async: true });

    const result = await env.purple_fireflies_db
      .prepare(
        `SELECT mp.name, mp.phone, mp.address1, mp.address2, mp.city, mp.state, mp.zip_code, ms.comments, ms.regular_quantity, ms.vegan_quantity
         FROM delivery_assignments da
         JOIN meal_signups ms ON da.meal_signup_id = ms.id
         JOIN driver_volunteers dv ON da.driver_volunteer_id = dv.id
         JOIN participants mp ON ms.participant_id = mp.id
         WHERE dv.participant_id = ? AND ms.delivery_date = ?
         ORDER BY mp.name`
      )
      .bind(driver.participant_id, deliveryDate)
      .all<{
        name: string;
        phone: string;
        address1: string;
        address2: string | null;
        city: string;
        state: string;
        zip_code: string;
        comments: string | null;
        regular_quantity: number;
        vegan_quantity: number;
      }>();

    const deliveries = result.results || [];

    if (deliveries.length === 0) {
      return { success: false, message: "No deliveries found for this driver on that date." };
    }

    const isWednesday = deliveryDay === "wednesday";
    const location = isWednesday
      ? "Episcopal Church of the Good Shepherd, 64 University Terrace, Athens, OH 45701"
      : "United Campus Ministries, 18 N College St, Athens, OH 45701";
    const time = isWednesday ? "12:00pm" : "5:00pm";
    const shortLocation = isWednesday ? "Episcopal Church" : "UCM";

    const formattedDate = new Date(deliveryDate + "T00:00:00").toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
    const subject = `Meal Delivery ${formattedDate} ${time} at ${shortLocation}`;

    let body = `Hi ${driver.participant_name},\n\n`;
    body += `Please arrive at the ${location} at ${time} to pickup the meals.\n\n`;
    body += `Persons you are delivering to:\n`;

    for (const delivery of deliveries) {
      const address = `${delivery.address1}${delivery.address2 ? ", " + delivery.address2 : ""}, ${delivery.city}, ${delivery.state} ${delivery.zip_code}`;
      body += `Name: ${delivery.name}\n`;
      body += `Phone: ${delivery.phone}\n`;
      body += `Address: ${address}\n`;
      body += `Comments: ${delivery.comments || "None"}\n`;
      const mealParts: string[] = [];
      if (delivery.regular_quantity > 0) mealParts.push(`${delivery.regular_quantity} Regular`);
      if (delivery.vegan_quantity > 0) mealParts.push(`${delivery.vegan_quantity} Vegan/GF`);
      body += `Meals: ${mealParts.join(" + ") || "None"}\n\n`;
    }

    body += `Take care,\nMeal Delivery Coordinator\nPurple Fireflies`;

    await sendEmail({
      to: driver.participant_email,
      subject,
      text: body,
    });

    return { success: true, message: `Load email sent to ${driver.participant_name}.` };
  } catch {
    console.error("sendDriverLoadEmail action error:");
    return {
      success: false,
      message: "Failed to send email. Please try again.",
    };
  }
}
