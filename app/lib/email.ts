import type { Participant, MealSignup, WaitlistEntryWithParticipant } from "@/app/lib/definitions";
import type { DateDriver } from "@/app/lib/db";
import { formatDeliveryDay, getDeliveryDay } from "@/app/lib/delivery-day";
import {
  getCommunityPetsConfig,
  getTaxStatusCopy,
} from "@/app/lib/community-pets-config";
import { readEnvVar } from "@/app/lib/env";

export async function sendMealSignupConfirmation(signups: MealSignup[], participant: Participant, waitlistedDates?: string[]): Promise<void> {
  if (signups.length === 0 && (!waitlistedDates || waitlistedDates.length === 0)) return;
  const address = `${participant.address1}${participant.address2 ? `, ${participant.address2}` : ""}, ${participant.city}, ${participant.state} ${participant.zip_code}`;

  const signupDates = Array.from(new Set(signups.map((s) => s.delivery_date)));
  const datesFormatted = signupDates.map((d) =>
    new Date(d + "T00:00:00").toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })
  ).join(", ");

  const mealLines: string[] = [];
  for (const s of signups) {
    const parts: string[] = [];
    if (s.regular_quantity > 0) parts.push(`${s.regular_quantity} Regular`);
    if (s.vegan_quantity > 0) parts.push(`${s.vegan_quantity} Vegan / GF`);
    const formatted = new Date(s.delivery_date + "T00:00:00").toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" });
    const day = formatDeliveryDay(s.delivery_day);
    mealLines.push(`${formatted} (${day}): ${parts.join(" + ")}`);
  }

  const parts: string[] = [];
  if (signups.length > 0) {
    if (signups[0].regular_quantity > 0) parts.push(`${signups[0].regular_quantity} Regular`);
    if (signups[0].vegan_quantity > 0) parts.push(`${signups[0].vegan_quantity} Vegan / GF`);
  }

  let text = "";
  if (signups.length > 0) {
    text += `Your meal delivery signup has been received.\n\n${mealLines.join("\n")}\nAddress: ${address}\nContact Method: ${participant.contact_method}\n\n`;
  }

  if (waitlistedDates && waitlistedDates.length > 0) {
    const waitlistedFormatted = waitlistedDates.map((d) => {
      const formatted = new Date(d + "T00:00:00").toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" });
      const day = formatDeliveryDay(getDeliveryDay(d));
      return `${formatted} (${day}): ${parts.join(" + ") || "None"}`;
    }).join("\n");

    text += `You have been added to the waitlist for:\n${waitlistedFormatted}\n\nWe will notify you if a spot opens up.\n\n`;
  }

  text += `Take care,\nMeal Delivery Coordinator\nPurple Fireflies`;

  const allDatesFormatted = [...signupDates, ...(waitlistedDates || [])].map((d) =>
    new Date(d + "T00:00:00").toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })
  ).join(", ");
  const subject = `Meal Signup Confirmed — ${allDatesFormatted}`;

  await sendEmail({ to: participant.email, subject, text });
}

export async function sendWaitlistNotification(entry: WaitlistEntryWithParticipant): Promise<void> {
  const formattedDate = new Date(entry.delivery_date + "T00:00:00").toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" });
  const subject = `Spot Available — ${formattedDate}`;
  const text = `Hi ${entry.participant_name},\n\nA spot has opened up for meal delivery on ${formattedDate}! Please sign up as soon as possible at:\n\nhttps://purplefireflies.org/programs/meal-delivery/delivery-signup\n\nThis spot will be offered to the next person on the waitlist if not claimed.\n\nTake care,\nMeal Delivery Coordinator\nPurple Fireflies`;
  await sendEmail({ to: entry.participant_email, subject, text });
}

export async function sendVolunteerAccountEmail(to: string, name: string, tempPassword: string): Promise<void> {
  const subject = "Your Purple Fireflies volunteer account";
  const text = `Hi ${name},

An account has been created for you to sign in and manage your meal delivery volunteer signups.

Temporary password: ${tempPassword}

Sign in at: https://purplefireflies.org/login

Your account is awaiting approval from our coordinators. You'll be able to sign in once it has been approved.

After signing in, you can change your password from the Volunteer Portal.

Take care,
Meal Delivery Coordinator
Purple Fireflies`;
  await sendEmail({ to, subject, text });
}

export async function sendInviteEmail(to: string, name: string, tempPassword: string, status: string): Promise<void> {
  const subject = "Your Purple Fireflies account";
  const approvalNote =
    status === "pending"
      ? "\nYour account is awaiting approval from our coordinators. You'll be able to sign in once it has been approved.\n"
      : "";
  const text = `Hi ${name},

Your password has been reset. Here is your new temporary password to sign in to your Purple Fireflies account:

Temporary password: ${tempPassword}

Sign in at: https://purplefireflies.org/login
${approvalNote}
After signing in, you can change your password from your account settings.

Take care,
Meal Delivery Coordinator
Purple Fireflies`;
  await sendEmail({ to, subject, text });
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

export async function sendDeliverySummaryEmail(date: string, drivers: DateDriver[], waitlistEntries?: WaitlistEntryWithParticipant[]): Promise<void> {
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
    notes: string;
    driver: string;
  }> = [];

  for (const driver of drivers) {
    for (const d of driver.deliveries) {
      const parts: string[] = [];
      if (d.regular_quantity > 0) parts.push(`${d.regular_quantity} Regular`);
      if (d.vegan_quantity > 0) parts.push(`${d.vegan_quantity} Vegan/GF`);
      const notes: string[] = [];
      if (d.comments) notes.push(`Comments: ${d.comments}`);
      if (d.internal_notes) notes.push(`Internal Notes: ${d.internal_notes}`);
      rows.push({
        name: d.meal_name,
        phone: d.meal_phone,
        address: d.address,
        meals: parts.join(" + ") || "None",
        notes: notes.join("; ") || "None",
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
            <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;font-size:14px;">${r.notes}</td>
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
      <p style="margin:0 0 12px;font-size:14px;color:#374151;">${rows.length} delivery(ies) across ${drivers.length} driver(s)${waitlistEntries && waitlistEntries.length > 0 ? `, ${waitlistEntries.length} on waitlist` : ""}.</p>
      <table style="width:100%;border-collapse:collapse;border:1px solid #e5e7eb;">
        <thead>
          <tr style="background-color:#f3f4f6;">
            <th style="padding:8px 12px;text-align:left;font-size:12px;font-weight:600;color:#6b7280;border-bottom:1px solid #e5e7eb;">Name</th>
            <th style="padding:8px 12px;text-align:left;font-size:12px;font-weight:600;color:#6b7280;border-bottom:1px solid #e5e7eb;">Phone</th>
            <th style="padding:8px 12px;text-align:left;font-size:12px;font-weight:600;color:#6b7280;border-bottom:1px solid #e5e7eb;">Address</th>
            <th style="padding:8px 12px;text-align:left;font-size:12px;font-weight:600;color:#6b7280;border-bottom:1px solid #e5e7eb;">Meals</th>
            <th style="padding:8px 12px;text-align:left;font-size:12px;font-weight:600;color:#6b7280;border-bottom:1px solid #e5e7eb;">Notes</th>
            <th style="padding:8px 12px;text-align:left;font-size:12px;font-weight:600;color:#6b7280;border-bottom:1px solid #e5e7eb;">Driver</th>
          </tr>
        </thead>
        <tbody>
${tableRows}
        </tbody>
      </table>
      ${waitlistEntries && waitlistEntries.length > 0 ? `
      <h2 style="font-size:16px;font-weight:600;color:#6b21a8;margin:24px 0 8px;">Waitlist (${waitlistEntries.length})</h2>
      <table style="width:100%;border-collapse:collapse;border:1px solid #e5e7eb;">
        <thead>
          <tr style="background-color:#f3f4f6;">
            <th style="padding:8px 12px;text-align:left;font-size:12px;font-weight:600;color:#6b7280;border-bottom:1px solid #e5e7eb;">Name</th>
            <th style="padding:8px 12px;text-align:left;font-size:12px;font-weight:600;color:#6b7280;border-bottom:1px solid #e5e7eb;">Phone</th>
            <th style="padding:8px 12px;text-align:left;font-size:12px;font-weight:600;color:#6b7280;border-bottom:1px solid #e5e7eb;">Email</th>
            <th style="padding:8px 12px;text-align:left;font-size:12px;font-weight:600;color:#6b7280;border-bottom:1px solid #e5e7eb;">Meals</th>
            <th style="padding:8px 12px;text-align:left;font-size:12px;font-weight:600;color:#6b7280;border-bottom:1px solid #e5e7eb;">Waitlisted</th>
          </tr>
        </thead>
        <tbody>
          ${waitlistEntries.map((w) => {
            const parts: string[] = [];
            if (w.regular_quantity > 0) parts.push(`${w.regular_quantity} Regular`);
            if (w.vegan_quantity > 0) parts.push(`${w.vegan_quantity} Vegan/GF`);
            const waitlistedDate = new Date(w.created_at + (w.created_at.includes("T") ? "" : "T00:00:00")).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
            return `          <tr>
            <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;font-size:14px;">${w.participant_name}</td>
            <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;font-size:14px;">${w.participant_phone}</td>
            <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;font-size:14px;">${w.participant_email}</td>
            <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;font-size:14px;">${parts.join(" + ") || "None"}</td>
            <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;font-size:14px;">${waitlistedDate}</td>
          </tr>`;
          }).join("\n")}
        </tbody>
      </table>` : ""}
    </div>
  </div>
</body>
</html>`;

  let text = `Meal Delivery Summary — ${formattedDate}\n${rows.length} delivery(ies) across ${drivers.length} driver(s)${waitlistEntries && waitlistEntries.length > 0 ? `, ${waitlistEntries.length} on waitlist` : ""}.\n\n` +
    rows.map((r) => `${r.name} | ${r.phone} | ${r.address} | ${r.meals} | ${r.notes} | ${r.driver}`).join("\n");

  if (waitlistEntries && waitlistEntries.length > 0) {
    text += `\n\n--- Waitlist (${waitlistEntries.length}) ---\n`;
    for (const w of waitlistEntries) {
      const parts: string[] = [];
      if (w.regular_quantity > 0) parts.push(`${w.regular_quantity} Regular`);
      if (w.vegan_quantity > 0) parts.push(`${w.vegan_quantity} Vegan/GF`);
      const waitlistedDate = new Date(w.created_at + (w.created_at.includes("T") ? "" : "T00:00:00")).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
      text += `\n${w.participant_name} | ${w.participant_phone} | ${w.participant_email} | ${parts.join(" + ") || "None"} | Waitlisted: ${waitlistedDate}`;
    }
  }

  await sendEmail({
    to: "meal.delivery@purplefireflies.org",
    subject: `Meal Delivery Summary — ${formattedDate}`,
    text,
    html,
  });
}

/**
 * Sponsor a Pet Program gift acknowledgement.
 *
 * Sent once per donor per pet (the first gift), not on every recurring charge,
 * so a monthly sponsor does not get twelve near-identical emails a year. The tax
 * line comes from `getTaxStatusCopy()` rather than being written here, so
 * gaining 501(c)(3) status is a var flip and this copy follows.
 */
export async function sendSponsorshipAcknowledgementEmail(params: {
  to: string;
  donorName: string;
  animalName: string;
  amountCents: number;
  isRecurring: boolean;
  campaignUrl: string | null;
}): Promise<void> {
  const { nonprofitStatus } = await getCommunityPetsConfig();
  const taxCopy = getTaxStatusCopy(nonprofitStatus);
  const amount = formatUsd(params.amountCents);
  const greeting = params.donorName.trim() || "there";

  const recurringLine = params.isRecurring
    ? `\nYour gift is recurring, so it will be charged again on the schedule you chose in Givebutter. You can change or cancel it there at any time.\n`
    : "";

  const campaignLine = params.campaignUrl
    ? `\nYou can see ${params.animalName}'s progress any time at:\n${params.campaignUrl}\n`
    : "";

  const text = `Hi ${greeting},

Thank you for sponsoring ${params.animalName} through the Sponsor a Pet Program. Your gift of ${amount} has been received and will go toward this pet's care.

${taxCopy}${recurringLine}${campaignLine}
If ${params.animalName}'s listed needs are fully met, or the pet leaves the program, any remaining gifts stay in the Sponsor a Pet Program and support other neighbors' pets. We do not pay leftovers to the owner. We never publish donor names, email addresses, or individual gift amounts.

With gratitude,
Purple Fireflies`;

  await sendEmail({
    to: params.to,
    subject: `Thank you for sponsoring ${params.animalName}`,
    text,
  });
}

/**
 * Internal alert for a failed recurring plan.
 *
 * Goes to `ADMIN_EMAIL` when set, otherwise the public contact address, so a
 * lapsed plan is not silently missed. Deliberately not sent to the donor: a
 * failed card is Givebutter's retry flow to handle, and a second email from us
 * would only confuse them.
 */
export async function sendPlanFailureEmail(params: {
  planId: string;
  donorName: string;
  donorEmail: string;
  amountCents: number;
  frequency: string | null;
  nextBillDate: string | null;
}): Promise<void> {
  const adminEmail = (await readEnvVar("ADMIN_EMAIL"))?.trim() || "info@purplefireflies.org";

  const lines = [
    `Plan ID: ${params.planId}`,
    `Donor: ${params.donorName || "Unknown"} <${params.donorEmail || "no email"}>`,
    `Amount: ${formatUsd(params.amountCents)}`,
    `Frequency: ${params.frequency || "unknown"}`,
    `Next bill date: ${params.nextBillDate || "unknown"}`,
  ];

  const text = `A recurring Sponsor a Pet Program plan failed in Givebutter.

${lines.join("\n")}

Givebutter retries failed plans on its own schedule. Check the plan in the Givebutter dashboard if it keeps failing.

Purple Fireflies`;

  await sendEmail({
    to: adminEmail,
    subject: `Givebutter plan failed - ${params.donorName || params.planId}`,
    text,
  });
}

function formatUsd(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format((Number.isFinite(cents) ? cents : 0) / 100);
}

export async function sendNewsletterConfirmation(email: string, name: string | null, confirmToken: string): Promise<void> {
  const link = `https://purplefireflies.org/newsletters/confirm?token=${confirmToken}`;
  const subject = "Confirm your Purple Fireflies newsletter subscription";
  const text = `Hi${name ? " " + name : ""},

Thanks for subscribing to the Purple Fireflies newsletter. Please confirm your email address by clicking the link below:

${link}

If you didn't request this, you can ignore this email.

Take care,
Purple Fireflies`;
  const html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;font-family:Arial,sans-serif;background-color:#f9fafb;">
  <div style="max-width:560px;margin:20px auto;background:#ffffff;border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;">
    <div style="background-color:#6b21a8;padding:16px 24px;">
      <h1 style="margin:0;color:#ffffff;font-size:18px;font-weight:600;">Confirm your subscription</h1>
    </div>
    <div style="padding:24px;">
      <p style="margin:0 0 12px;font-size:14px;color:#374151;">Hi${name ? " " + name : ""},</p>
      <p style="margin:0 0 16px;font-size:14px;color:#374151;">Thanks for subscribing to the Purple Fireflies newsletter. Please confirm your email address by clicking the button below.</p>
      <p style="text-align:center;margin:24px 0;">
        <a href="${link}" style="display:inline-block;background-color:#7C3AED;color:#ffffff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;">Confirm subscription</a>
      </p>
      <p style="margin:0;font-size:12px;color:#6b7280;">If you didn't request this, you can ignore this email.</p>
    </div>
  </div>
</body>
</html>`;
  await sendEmail({ to: email, subject, text, html });
}

export async function sendNewsletterIssue(params: {
  to: string;
  subject: string;
  htmlBody: string;
  unsubscribeToken: string;
}): Promise<void> {
  const unsubLink = `https://purplefireflies.org/newsletters/unsubscribe?token=${params.unsubscribeToken}`;
  const html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;font-family:Arial,sans-serif;background-color:#f9fafb;">
  <div style="max-width:640px;margin:20px auto;background:#ffffff;border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;">
    <div style="background-color:#6b21a8;padding:16px 24px;">
      <h1 style="margin:0;color:#ffffff;font-size:18px;font-weight:600;">${params.subject}</h1>
    </div>
    <div style="padding:24px;font-size:14px;color:#374151;line-height:1.6;">
      ${params.htmlBody}
    </div>
    <div style="padding:16px 24px;border-top:1px solid #e5e7eb;font-size:12px;color:#6b7280;">
      <p style="margin:0;">You are receiving this because you subscribed to the Purple Fireflies newsletter.</p>
      <p style="margin:4px 0 0;"><a href="${unsubLink}" style="color:#7C3AED;">Unsubscribe</a></p>
    </div>
  </div>
</body>
</html>`;
  const text = `${params.subject}\n\n${params.htmlBody.replace(/<[^>]+>/g, "")}\n\nUnsubscribe: ${unsubLink}`;
  await sendEmail({ to: params.to, subject: params.subject, text, html });
}
