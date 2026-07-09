import type { Participant, MealSignup } from "@/app/lib/definitions";

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
}): Promise<void> {
  const apiKey = process.env.EMAIL_API_KEY;
  const from = process.env.EMAIL_FROM;

  if (!apiKey || !from) {
    console.log("[EMAIL STUB] Would send email:", params);
    return;
  }

  const apiUrl = process.env.EMAIL_API_URL || "https://api.resend.com/emails";

  const response = await fetch(apiUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: params.to,
      subject: params.subject,
      text: params.text,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Email send failed (${response.status}): ${error}`);
  }
}
