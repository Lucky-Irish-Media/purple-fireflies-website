import "server-only";

import { readEnvVar } from "@/app/lib/env";
import {
  getAnimalsWithCampaignCode,
  updateGivebutterTotals,
} from "@/app/lib/db";

/**
 * Givebutter is the source of truth for money. Nothing here ever guesses: the
 * webhook records what a delivery says, and the refresh reads the campaign API
 * and copies `raised` / `donors` across. If the API call fails, the refresh
 * writes nothing rather than zeroing cached totals that the public pages show.
 */

const API_BASE = "https://api.givebutter.com/v1";

/** A page cap so a broken `meta.last_page` cannot spin forever. */
const MAX_PAGES = 50;

export interface GivebutterCampaign {
  id: string;
  code: string;
  title: string;
  /** Dollars, as the API reports them. Convert with `toCents()` before storing. */
  raised: number;
  /** People who gave, which is what `animals.gb_supporters` holds. */
  donors: number;
}

export interface RefreshResult {
  /** Pets whose cached totals now match Givebutter. */
  updated: number;
  /** Pets with a campaign code Givebutter did not return. */
  missing: string[];
  /** Campaigns read from the API, before matching. */
  campaignsFetched: number;
}

export async function getGivebutterApiKey(): Promise<string | undefined> {
  const value = await readEnvVar("GIVEBUTTER_API_KEY");
  return value?.trim() || undefined;
}

export async function getWebhookSecret(): Promise<string | undefined> {
  const value = await readEnvVar("GIVEBUTTER_WEBHOOK_SECRET");
  return value?.trim() || undefined;
}

/** Drives whether the admin refresh control is shown at all. */
export async function isGivebutterConfigured(): Promise<boolean> {
  return Boolean(await getGivebutterApiKey());
}

/**
 * Constant-time string compare for the webhook signature.
 *
 * The signature is a shared secret sent verbatim in a `Signature` header, not an
 * HMAC of the body, so the only correct check is "does it equal the secret". A
 * plain `===` would return early on the first differing byte and leak the
 * secret's prefix through timing. Length still short-circuits, which is fine:
 * the secret's length is not the secret.
 */
export function safeEqual(a: string, b: string): boolean {
  const left = new TextEncoder().encode(a);
  const right = new TextEncoder().encode(b);

  if (left.length !== right.length) {
    return false;
  }

  let diff = 0;
  for (let i = 0; i < left.length; i += 1) {
    diff |= left[i] ^ right[i];
  }
  return diff === 0;
}

/**
 * A stable id for one webhook delivery.
 *
 * `refund.created` and `plan.failed` carry a top-level `id`, so a retry maps to
 * the same row. `transaction.succeeded` does not, so the raw body is hashed:
 * Givebutter retries the exact same bytes, which makes the hash a stable key
 * without trusting a field that may be absent. The literal `"test"` id from the
 * docs examples is ignored so two test deliveries cannot collide.
 */
export async function eventKeyFor(
  rawBody: string,
  payloadId: unknown
): Promise<string> {
  const id =
    typeof payloadId === "string" || typeof payloadId === "number"
      ? String(payloadId).trim()
      : "";

  if (id && id !== "test") {
    return `id:${id}`;
  }

  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(rawBody)
  );
  const hex = Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");

  return `sha256:${hex}`;
}

/** Givebutter reports dollars as numbers; D1 stores integer cents. */
export function toCents(dollars: unknown): number {
  const value = typeof dollars === "string" ? Number(dollars) : dollars;
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return 0;
  }
  return Math.round(value * 100);
}

interface CampaignPage {
  data?: unknown;
  meta?: { last_page?: unknown; current_page?: unknown };
}

function toCampaign(raw: unknown): GivebutterCampaign | null {
  if (!raw || typeof raw !== "object") return null;
  const record = raw as Record<string, unknown>;
  const code = typeof record.code === "string" ? record.code.trim() : "";
  if (!code) return null;

  const raised =
    typeof record.raised === "number"
      ? record.raised
      : Number(record.raised ?? 0);
  const donors =
    typeof record.donors === "number" ? record.donors : Number(record.donors ?? 0);

  return {
    id: record.id === undefined || record.id === null ? "" : String(record.id),
    code,
    title: typeof record.title === "string" ? record.title : "",
    raised: Number.isFinite(raised) ? raised : 0,
    donors: Number.isFinite(donors) ? Math.trunc(donors) : 0,
  };
}

/**
 * Reads every campaign in the account.
 *
 * `GET /v1/campaigns` has no code filter and `GET /v1/campaigns/{campaign}`
 * takes the integer id, not the code, so matching a pet's code to a campaign is
 * always a client-side comparison.
 */
export async function fetchCampaigns(): Promise<GivebutterCampaign[]> {
  const apiKey = await getGivebutterApiKey();
  if (!apiKey) {
    throw new Error("GIVEBUTTER_API_KEY is not set");
  }

  const campaigns: GivebutterCampaign[] = [];
  let page = 1;
  let lastPage = 1;

  while (page <= lastPage && page <= MAX_PAGES) {
    const response = await fetch(`${API_BASE}/campaigns?page=${page}`, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        Accept: "application/json",
      },
      // Campaign totals change slowly and this is an explicit admin action.
      cache: "no-store",
    });

    if (!response.ok) {
      const detail = await response.text();
      throw new Error(
        `Givebutter campaigns request failed (${response.status}): ${detail.slice(0, 300)}`
      );
    }

    const body = (await response.json()) as CampaignPage;
    const rows = Array.isArray(body.data) ? body.data : [];

    for (const row of rows) {
      const campaign = toCampaign(row);
      if (campaign) campaigns.push(campaign);
    }

    const reportedLast = Number(body.meta?.last_page ?? page);
    lastPage = Number.isFinite(reportedLast) && reportedLast > 0 ? reportedLast : page;
    page += 1;
  }

  return campaigns;
}

/**
 * Copies `raised` and `donors` from Givebutter into each pet's cached totals.
 *
 * Order matters: fetch everything first, then write. A network failure or a bad
 * API key leaves the cached numbers exactly as they were, so the public pages
 * keep showing the last known totals instead of dropping to zero.
 */
export async function refreshCampaignTotals(): Promise<RefreshResult> {
  const animals = await getAnimalsWithCampaignCode();
  if (animals.length === 0) {
    return { updated: 0, missing: [], campaignsFetched: 0 };
  }

  const campaigns = await fetchCampaigns();

  const byCode = new Map<string, GivebutterCampaign>();
  for (const campaign of campaigns) {
    byCode.set(campaign.code.trim().toUpperCase(), campaign);
  }

  const missing: string[] = [];
  let updated = 0;

  for (const animal of animals) {
    const code = (animal.gb_campaign_code ?? "").trim().toUpperCase();
    const campaign = code ? byCode.get(code) : undefined;

    if (!campaign) {
      missing.push(animal.name);
      continue;
    }

    await updateGivebutterTotals(animal.id, {
      raisedCents: toCents(campaign.raised),
      supporters: campaign.donors,
    });
    updated += 1;
  }

  return { updated, missing, campaignsFetched: campaigns.length };
}
