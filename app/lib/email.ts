import type { Participant, MealSignup } from "@/app/lib/definitions";

export async function sendMealSignupConfirmation(signups: MealSignup[], participant: Participant): Promise<void> {
  if (signups.length === 0) return;
  const address = `${participant.address1}${participant.address2 ? `, ${participant.address2}` : ""}, ${participant.city}, ${participant.state} ${participant.zip_code}`;

  const datesSet = new Set(signups.map((s) => s.delivery_date));
  const datesFormatted = Array.from(datesSet).map((d) =>
    new Date(d + "T00:00:00").toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })
  ).join(", ");

  const grouped = new Map<string, { regular: number; vegan: number }>();
  for (const s of signups) {
    if (!grouped.has(s.delivery_date)) {
      grouped.set(s.delivery_date, { regular: 0, vegan: 0 });
    }
    const g = grouped.get(s.delivery_date)!;
    if (s.meal_type === "regular") g.regular += s.quantity;
    else g.vegan += s.quantity;
  }

  const mealLines: string[] = [];
  for (const [date, counts] of grouped) {
    const parts: string[] = [];
    if (counts.regular > 0) parts.push(`${counts.regular} Regular`);
    if (counts.vegan > 0) parts.push(`${counts.vegan} Vegan / GF`);
    const formatted = new Date(date + "T00:00:00").toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" });
    const day = new Date(date).getDay() === 3 ? "Wednesday" : "Thursday";
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
