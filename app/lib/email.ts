import { MealSignup } from "@/app/lib/db";

export async function sendMealSignupConfirmation(signup: MealSignup): Promise<void> {
  const address = `${signup.address1}${signup.address2 ? `, ${signup.address2}` : ""}, ${signup.city}, ${signup.state} ${signup.zip_code}`;
  const formattedDate = new Date(signup.delivery_date + "T00:00:00").toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
  const subject = `Meal Signup Confirmed — ${formattedDate}`;
  const text = `Hi ${signup.name},\n\nYour meal delivery signup has been received.\n\nDelivery: ${formattedDate} (${signup.delivery_day === "wednesday" ? "Wednesday" : "Thursday"})\nMeal Type: ${signup.meal_type}\nAddress: ${address}\nContact Method: ${signup.contact_method}\n\nWe'll reach out if anything changes.\n\nTake care,\nMel\nPurple Fireflies`;

  await sendEmail({ to: signup.email, subject, text });
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
