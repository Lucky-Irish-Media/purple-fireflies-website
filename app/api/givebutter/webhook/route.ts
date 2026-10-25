import "server-only";

import {
  adjustAnimalTotals,
  createSponsorshipIfMissing,
  deleteGivebutterEvent,
  getAnimalByCampaignCode,
  getSponsorshipByTransactionId,
  hasOtherSucceededSponsorship,
  hasPriorSponsorshipFromDonor,
  recordGivebutterEvent,
  reduceSponsorshipAmount,
  setSponsorshipStatus,
} from "@/app/lib/db";
import {
  eventKeyFor,
  getWebhookSecret,
  safeEqual,
  toCents,
} from "@/app/lib/givebutter";
import {
  sendPlanFailureEmail,
  sendSponsorshipAcknowledgementEmail,
} from "@/app/lib/email";
import type { SponsorshipStatus } from "@/app/lib/definitions";

/**
 * Givebutter webhook receiver.
 *
 * Public by necessity: `middleware.ts` excludes `/api`, and Givebutter cannot
 * hold a session. The only authentication is the shared secret Givebutter sends
 * verbatim in a `Signature` header.
 *
 * Every write is idempotent. The event id is claimed in `givebutter_events`
 * before processing, and a claim that fails to process is released so a retry
 * can still run. `animal_sponsorships.gb_transaction_id` is UNIQUE as a second
 * line of defence, so a replay cannot record a second gift even if the event
 * table were lost.
 *
 * Money direction: Givebutter reports dollars, D1 stores cents.
 */

export const dynamic = "force-dynamic";

const HANDLED_EVENTS = new Set([
  "transaction.succeeded",
  "refund.created",
  "plan.failed",
]);

interface WebhookPayload {
  id?: unknown;
  event?: unknown;
  data?: unknown;
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function asString(value: unknown): string {
  if (typeof value === "string") return value.trim();
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return "";
}

function asNullableString(value: unknown): string | null {
  const text = asString(value);
  return text || null;
}

function json(body: Record<string, unknown>, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

/** A non-2xx makes Givebutter retry; a 2xx tells it to stop. */
export async function POST(request: Request): Promise<Response> {
  const secret = await getWebhookSecret();
  if (!secret) {
    console.error("[givebutter] GIVEBUTTER_WEBHOOK_SECRET is not set");
    return json({ error: "Webhook is not configured" }, 500);
  }

  // The body is read once, as text, because the signature is checked against
  // the delivery itself and re-serialising parsed JSON would change the bytes.
  const rawBody = await request.text();

  const signature =
    request.headers.get("Signature") ??
    request.headers.get("X-Givebutter-Signature") ??
    "";

  if (!signature || !safeEqual(signature, secret)) {
    console.warn("[givebutter] rejected delivery with a missing or bad signature");
    return json({ error: "Invalid signature" }, 401);
  }

  let payload: WebhookPayload;
  try {
    payload = JSON.parse(rawBody) as WebhookPayload;
  } catch {
    return json({ error: "Invalid JSON" }, 400);
  }

  const eventType = asString(payload.event);
  const data = asRecord(payload.data);

  if (!eventType || !data) {
    return json({ error: "Missing event or data" }, 400);
  }

  if (!HANDLED_EVENTS.has(eventType)) {
    console.log(`[givebutter] ignoring unhandled event ${eventType}`);
    return json({ ok: true, ignored: true });
  }

  const eventId = await eventKeyFor(rawBody, payload.id);

  try {
    switch (eventType) {
      case "transaction.succeeded":
        return await handleTransactionSucceeded(eventId, data);
      case "refund.created":
        return await handleRefundCreated(eventId, data);
      case "plan.failed":
        return await handlePlanFailed(eventId, data);
      default:
        return json({ ok: true, ignored: true });
    }
  } catch (error) {
    // Release the claim so Givebutter's retry is not swallowed as a duplicate.
    try {
      await deleteGivebutterEvent(eventId);
    } catch (releaseError) {
      console.error("[givebutter] failed to release event claim", releaseError);
    }
    console.error(`[givebutter] ${eventType} processing failed`, error);
    return json({ error: "Processing failed" }, 500);
  }
}

async function handleTransactionSucceeded(
  eventId: string,
  data: Record<string, unknown>
): Promise<Response> {
  const transactionId = asString(data.id);
  if (!transactionId) {
    return json({ error: "Missing transaction id" }, 400);
  }

  const campaignCode = asString(data.campaign_code);
  const animal = campaignCode
    ? await getAnimalByCampaignCode(campaignCode)
    : null;

  // A gift to a campaign that is not a pet (or one whose code was mistyped)
  // must not enter the pet ledger. The cached totals still get reconciled by
  // the next refresh, so nothing is lost from the public numbers.
  if (!animal) {
    const claimed = await recordGivebutterEvent({
      eventId,
      type: "transaction.succeeded",
      animalId: null,
    });
    if (claimed) {
      console.warn(
        `[givebutter] transaction ${transactionId} has campaign code "${campaignCode || "(none)"}" which matches no pet`
      );
    }
    return json({ ok: true, unlinked: true });
  }

  const claimed = await recordGivebutterEvent({
    eventId,
    type: "transaction.succeeded",
    animalId: animal.id,
  });

  // Already processed. The second unique key would also stop a duplicate row,
  // but skipping here avoids re-reading donor history and re-sending email.
  if (!claimed) {
    return json({ ok: true, duplicate: true });
  }

  const donorEmail = asNullableString(data.email);
  const donorFirstName = asNullableString(data.first_name);
  const donorLastName = asNullableString(data.last_name);
  const givingSpace = asRecord(data.giving_space);
  const displayName = asNullableString(givingSpace?.name);

  const amountCents = toCents(data.amount);
  const isRecurring = Boolean(
    data.is_recurring ?? data.plan_id ?? false
  );
  const status = normaliseStatus(data.status);

  // Supporters are people, not gifts: a monthly donor's second charge must not
  // add a second supporter. Checked before the insert, because the insert is
  // what would make this donor "prior".
  const isFirstGift = donorEmail
    ? !(await hasPriorSponsorshipFromDonor(animal.id, donorEmail))
    : true;

  const sponsorship = await createSponsorshipIfMissing({
    animalId: animal.id,
    transactionId,
    planId: asNullableString(data.plan_id),
    campaignCode: campaignCode || null,
    amountCents,
    feeCents: toCents(data.fee),
    donatedCents: toCents(data.donated),
    isRecurring,
    donorFirstName,
    donorLastName,
    donorEmail,
    displayName,
    status,
    occurredAt:
      asNullableString(data.transacted_at) ?? asNullableString(data.created_at),
  });

  // Lost the race with a concurrent delivery of the same transaction.
  if (!sponsorship) {
    return json({ ok: true, duplicate: true });
  }

  // A `transaction.succeeded` event should always carry status `succeeded`.
  // If it does not, the row is kept for the ledger but the money is not counted
  // and no thank-you is sent.
  if (status !== "succeeded") {
    return json({ ok: true, recorded: true, counted: false });
  }

  await adjustAnimalTotals(animal.id, amountCents, isFirstGift ? 1 : 0);

  // Email is best effort. A mail outage must not make Givebutter retry a gift
  // that is already recorded, which would then be rejected as a duplicate and
  // the acknowledgement would never be sent anyway.
  if (donorEmail && isFirstGift) {
    try {
      await sendSponsorshipAcknowledgementEmail({
        to: donorEmail,
        donorName: [donorFirstName, donorLastName].filter(Boolean).join(" "),
        animalName: animal.name,
        amountCents,
        isRecurring,
        campaignUrl: animal.gb_campaign_url,
      });
    } catch (error) {
      console.error("[givebutter] acknowledgement email failed", error);
    }
  }

  return json({ ok: true, recorded: true });
}

async function handleRefundCreated(
  eventId: string,
  data: Record<string, unknown>
): Promise<Response> {
  const transactionId = asString(data.transaction_id);
  if (!transactionId) {
    return json({ error: "Missing transaction_id" }, 400);
  }

  const sponsorship = await getSponsorshipByTransactionId(transactionId);
  if (!sponsorship) {
    // Nothing to reverse. Claim the event so a retry does not loop forever, and
    // log loudly: a refund we cannot find is a ledger gap someone should see.
    const claimed = await recordGivebutterEvent({
      eventId,
      type: "refund.created",
      animalId: null,
    });
    if (claimed) {
      console.warn(
        `[givebutter] refund for unknown transaction ${transactionId}`
      );
    }
    return json({ ok: true, unknown: true });
  }

  const claimed = await recordGivebutterEvent({
    eventId,
    type: "refund.created",
    animalId: sponsorship.animal_id,
  });
  if (!claimed) {
    return json({ ok: true, duplicate: true });
  }

  const isFull = asString(data.type).toLowerCase() !== "partial";
  const reportedCents = toCents(data.amount);

  if (isFull) {
    // A fully refunded gift no longer counts as a supporter, unless the same
    // donor still has another succeeded gift to this pet.
    if (sponsorship.status !== "refunded") {
      let supporterDelta = -1;
      if (sponsorship.animal_id && sponsorship.donor_email) {
        const stillCounts = await hasOtherSucceededSponsorship(
          sponsorship.animal_id,
          sponsorship.donor_email,
          sponsorship.id
        );
        if (stillCounts) supporterDelta = 0;
      }

      await setSponsorshipStatus(sponsorship.id, "refunded");
      if (sponsorship.animal_id) {
        const reversed =
          reportedCents > 0
            ? Math.min(reportedCents, sponsorship.amount_cents)
            : sponsorship.amount_cents;
        await adjustAnimalTotals(
          sponsorship.animal_id,
          -reversed,
          supporterDelta
        );
      }
    }
  } else {
    // A partial refund shrinks the gift. `amount_cents` becomes the net amount
    // the fund kept, so the admin ledger's raised total stays truthful.
    const reversed = Math.min(reportedCents, sponsorship.amount_cents);
    if (reversed > 0) {
      await reduceSponsorshipAmount(sponsorship.id, reversed);
      if (sponsorship.animal_id) {
        await adjustAnimalTotals(sponsorship.animal_id, -reversed, 0);
      }
    }
  }

  return json({ ok: true, refunded: true });
}

async function handlePlanFailed(
  eventId: string,
  data: Record<string, unknown>
): Promise<Response> {
  const planId = asString(data.id) || "unknown";
  const claimed = await recordGivebutterEvent({
    eventId,
    type: "plan.failed",
    animalId: null,
  });
  if (!claimed) {
    return json({ ok: true, duplicate: true });
  }

  const donorName = [asString(data.first_name), asString(data.last_name)]
    .filter(Boolean)
    .join(" ");

  try {
    await sendPlanFailureEmail({
      planId,
      donorName,
      donorEmail: asString(data.email),
      amountCents: toCents(data.amount),
      frequency: asNullableString(data.frequency),
      nextBillDate: asNullableString(data.next_bill_date),
    });
  } catch (error) {
    // The event is already claimed, so a retry would be a duplicate. Log it and
    // let the next failed billing cycle surface the problem again.
    console.error("[givebutter] plan failure email failed", error);
  }

  return json({ ok: true, notified: true });
}

function normaliseStatus(value: unknown): SponsorshipStatus {
  const status = asString(value).toLowerCase();
  if (status === "refunded" || status === "failed") {
    return status;
  }
  return "succeeded";
}
