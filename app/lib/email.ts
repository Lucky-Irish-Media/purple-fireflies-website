import type { Participant, MealSignup } from "@/app/lib/definitions";
import type { DateDriver } from "@/app/lib/db";

export async function sendMealSignupConfirmation(signups: MealSignup[], participant: Participant): Promise<void> {
  if (signups.length === 0) return;
  const address = `${participant.address1}${participant.address2 ? `, ${participant.address2}` : ""}, ${participant.city}, ${participant.state} ${participant.zip_code}`;

  const datesSet = new Set(signups.map((s) => s.delivery_date));
  const datesFormatted = Array.from(datesSet).map((d) =>
    new Date(d + "T00:00:00").toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })
  ).join(", ");

  const mealLines: string[] = [];
  for (const s of signups) {
    const parts: string[] = [];
    if (s.regular_quantity > 0) parts.push(`${s.regular_quantity} Regular`);
    if (s.vegan_quantity > 0) parts.push(`${s.vegan_quantity} Vegan / GF`);
    const formatted = new Date(s.delivery_date + "T00:00:00").toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" });
    const day = new Date(s.delivery_date).getDay() === 3 ? "Wednesday" : "Thursday";
    mealLines.push(`${formatted} (${day}): ${parts.join(" + ")}`);
  }

  const subject = `Meal Signup Confirmed — ${datesFormatted}`;
  const text = `Hi ${participant.name},\n\nYour meal delivery signup has been received.\n\n${mealLines.join("\n")}\nAddress: ${address}\nContact Method: ${participant.contact_method}\n\nWe'll reach out if anything changes.\n\nTake care,\nMeal Delivery Coordinator\nPurple Fireflies`;

  await sendEmail({ to: participant.email, subject, text });
}

export async function sendEmail(params: {
  to: string;
  subject: string;
  text: string;
  html?: string;
}): Promise<void> {
  const apiKey = process.env.EMAIL_API_KEY;
  const from = process.env.EMAIL_FROM;

  if (!apiKey || !from) {
    console.log("[EMAIL STUB] Would send email:", params);
    return;
  }

  const apiUrl = process.env.EMAIL_API_URL || "https://api.resend.com/emails";

  const body: Record<string, string> = {
    from,
    to: params.to,
    subject: params.subject,
    text: params.text,
  };
  if (params.html) {
    body.html = params.html;
  }

  const response = await fetch(apiUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Email send failed (${response.status}): ${error}`);
  }
}

export async function sendDeliverySummaryEmail(date: string, drivers: DateDriver[]): Promise<void> {
  const formattedDate = new Date(date + "T00:00:00").toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const rows: Array<{
    name: string;
    phone: string;
    address: string;
    meals: string;
    driver: string;
  }> = [];

  for (const driver of drivers) {
    for (const d of driver.deliveries) {
      const parts: string[] = [];
      if (d.regular_quantity > 0) parts.push(`${d.regular_quantity} Regular`);
      if (d.vegan_quantity > 0) parts.push(`${d.vegan_quantity} Vegan/GF`);
      rows.push({
        name: d.meal_name,
        phone: d.meal_phone,
        address: d.address,
        meals: parts.join(" + ") || "None",
        driver: driver.driver_name,
      });
    }
  }

  if (rows.length === 0) return;

  const tableRows = rows
    .map(
      (r) => `          <tr>
            <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;font-size:14px;">${r.name}</td>
            <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;font-size:14px;">${r.phone}</td>
            <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;font-size:14px;">${r.address}</td>
            <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;font-size:14px;">${r.meals}</td>
            <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;font-size:14px;">${r.driver}</td>
          </tr>`,
    )
    .join("\n");

  const html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;font-family:Arial,sans-serif;background-color:#f9fafb;">
  <div style="max-width:900px;margin:20px auto;background:#ffffff;border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;">
    <div style="background-color:#6b21a8;padding:16px 24px;">
      <h1 style="margin:0;color:#ffffff;font-size:18px;font-weight:600;">Meal Delivery Summary — ${formattedDate}</h1>
    </div>
    <div style="padding:16px 24px;">
      <p style="margin:0 0 12px;font-size:14px;color:#374151;">${rows.length} delivery(ies) across ${drivers.length} driver(s).</p>
      <table style="width:100%;border-collapse:collapse;border:1px solid #e5e7eb;">
        <thead>
          <tr style="background-color:#f3f4f6;">
            <th style="padding:8px 12px;text-align:left;font-size:12px;font-weight:600;color:#6b7280;border-bottom:1px solid #e5e7eb;">Name</th>
            <th style="padding:8px 12px;text-align:left;font-size:12px;font-weight:600;color:#6b7280;border-bottom:1px solid #e5e7eb;">Phone</th>
            <th style="padding:8px 12px;text-align:left;font-size:12px;font-weight:600;color:#6b7280;border-bottom:1px solid #e5e7eb;">Address</th>
            <th style="padding:8px 12px;text-align:left;font-size:12px;font-weight:600;color:#6b7280;border-bottom:1px solid #e5e7eb;">Meals</th>
            <th style="padding:8px 12px;text-align:left;font-size:12px;font-weight:600;color:#6b7280;border-bottom:1px solid #e5e7eb;">Driver</th>
          </tr>
        </thead>
        <tbody>
${tableRows}
        </tbody>
      </table>
    </div>
  </div>
</body>
</html>`;

  const text = `Meal Delivery Summary — ${formattedDate}\n${rows.length} delivery(ies) across ${drivers.length} driver(s).\n\n` +
    rows.map((r) => `${r.name} | ${r.phone} | ${r.address} | ${r.meals} | ${r.driver}`).join("\n");

  await sendEmail({
    to: "meal.delivery@purplefireflies.org",
    subject: `Meal Delivery Summary — ${formattedDate}`,
    text,
    html,
  });
}
