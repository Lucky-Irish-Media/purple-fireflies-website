"use server";

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
    const driverEmail = formData.get("driver_email") as string;
    const driverName = formData.get("driver_name") as string;
    const deliveryDate = formData.get("delivery_date") as string;
    const deliveryDay = formData.get("delivery_day") as string;

    if (!driverEmail || !driverName || !deliveryDate || !deliveryDay) {
      return { success: false, message: "Missing required fields." };
    }

    const { env } = await getCloudflareContext({ async: true });

    const result = await env.purple_fireflies_db
      .prepare(
        `SELECT ms.name, ms.phone, ms.address1, ms.address2, ms.city, ms.state, ms.zip_code, ms.comments, ms.meal_type
         FROM delivery_assignments da
         JOIN meal_signups ms ON da.meal_signup_id = ms.id
         JOIN driver_volunteers dv ON da.driver_volunteer_id = dv.id
         WHERE dv.email = ? AND ms.delivery_date = ?
         ORDER BY ms.name`
      )
      .bind(driverEmail, deliveryDate)
      .all<{
        name: string;
        phone: string;
        address1: string;
        address2: string | null;
        city: string;
        state: string;
        zip_code: string;
        comments: string | null;
        meal_type: string;
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

    let body = `Hi ${driverName},\n\n`;
    body += `Please arrive at the ${location} at ${time} to pickup the meals.\n\n`;
    body += `Persons you are delivering to:\n`;

    for (const delivery of deliveries) {
      const address = `${delivery.address1}${delivery.address2 ? ", " + delivery.address2 : ""}, ${delivery.city}, ${delivery.state} ${delivery.zip_code}`;
      body += `Name: ${delivery.name}\n`;
      body += `Phone: ${delivery.phone}\n`;
      body += `Address: ${address}\n`;
      body += `Comments: ${delivery.comments || "None"}\n`;
      body += `Meal Type: ${delivery.meal_type}\n\n`;
    }

    body += `Take care,\nMeal Delivery Coordinator\nPurple Fireflies`;

    await sendEmail({
      to: driverEmail,
      subject,
      text: body,
    });

    return { success: true, message: `Load email sent to ${driverName}.` };
  } catch (e) {
    return {
      success: false,
      message: `Failed to send email: ${e instanceof Error ? e.message : "unknown error"}`,
    };
  }
}
