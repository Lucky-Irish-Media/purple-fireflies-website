"use server";

import { revalidatePath } from "next/cache";
import { verifySession } from "@/app/lib/dal";
import {
  isGivebutterConfigured,
  refreshCampaignTotals,
  toCents as givebutterToCents,
  verifyCampaignCode,
} from "@/app/lib/givebutter";
import { updateAnimalGivebutterCampaign } from "@/app/lib/db";

function toField(value: FormDataEntryValue | null): string {
  return value === null ? "" : String(value);
}

/**
 * Copies Givebutter's campaign totals into the cached columns the public pages
 * read. Manual on purpose: the webhook keeps individual gifts current, and this
 * is the reconciliation pass for anything it missed (imported gifts, a delivery
 * that failed, or a campaign edited by hand in Givebutter).
 */

export interface GivebutterRefreshState {
  success?: boolean;
  message?: string;
  updated?: number;
  missing?: string[];
}

export async function refreshGivebutterTotalsAction(
  _prevState: GivebutterRefreshState,
  _formData: FormData
): Promise<GivebutterRefreshState> {
  await verifySession();

  if (!(await isGivebutterConfigured())) {
    return {
      success: false,
      message:
        "Givebutter is not configured. Set GIVEBUTTER_API_KEY on the Worker first.",
    };
  }

  try {
    const result = await refreshCampaignTotals();

    revalidatePath("/admin/programs/sponsor-a-pet");
    revalidatePath("/admin/programs");
    // "layout" reaches the pet detail pages too, so each profile picks up its
    // new totals instead of waiting for its own revalidation window.
    revalidatePath("/programs/sponsor-a-pet", "layout");

    const updatedLabel = `${result.updated} pet${result.updated === 1 ? "" : "s"}`;
    const parts = [
      result.campaignsFetched === 0
        ? "Givebutter returned no campaigns."
        : `Updated ${updatedLabel} from ${result.campaignsFetched} campaign${
            result.campaignsFetched === 1 ? "" : "s"
          }.`,
    ];

    if (result.missing.length > 0) {
      parts.push(`No campaign matched: ${result.missing.join(", ")}.`);
    }

    return {
      success: true,
      message: parts.join(" "),
      updated: result.updated,
      missing: result.missing,
    };
  } catch (error) {
    // The refresh fetches before it writes, so a failure here left every cached
    // total exactly as it was.
    return {
      success: false,
      message:
        error instanceof Error
          ? `Refresh failed: ${error.message}`
          : "Refresh failed.",
    };
  }
}

export interface GivebutterVerifyState {
  success?: boolean;
  message?: string;
  code?: string;
  url?: string;
  goalCents?: number;
  available?: string[];
}

export async function verifyGivebutterCampaignAction(
  _prevState: GivebutterVerifyState,
  formData: FormData,
): Promise<GivebutterVerifyState> {
  try {
    await verifySession();

    const code = toField(formData.get("code"));
    const animalIdRaw = formData.get("animal_id");
    const animalId = animalIdRaw ? Number(animalIdRaw) : null;

    if (!code.trim()) {
      return { success: false, message: "Enter a campaign code first." };
    }

    if (!(await isGivebutterConfigured())) {
      return {
        success: false,
        message:
          "Givebutter is not configured. Set GIVEBUTTER_API_KEY on the Worker first.",
      };
    }

    const verification = await verifyCampaignCode(code);
    if (verification.error) {
      return {
        success: false,
        message: `Verification failed: ${verification.error}`,
      };
    }

    if (!verification.campaign) {
      const available = verification.campaigns.map(
        (campaign) => `${campaign.title} (${campaign.code})`,
      );
      return {
        success: false,
        message: `No campaign matched code "${code}".`,
        available,
      };
    }

    const canonicalCode = verification.campaign.code;
    const url = verification.campaign.url || null;
    const goalCents =
      verification.campaign.goal !== null
        ? givebutterToCents(verification.campaign.goal)
        : undefined;

    if (animalId && Number.isFinite(animalId)) {
      await updateAnimalGivebutterCampaign(
        animalId,
        canonicalCode,
        url,
        goalCents ?? null,
      );
      revalidatePath("/admin/programs/sponsor-a-pet");
      revalidatePath("/admin/programs");
      revalidatePath("/programs/sponsor-a-pet", "layout");
    }

    return {
      success: true,
      message: `Verified: ${verification.campaign.title} (${canonicalCode}).`,
      code: canonicalCode,
      url: url ?? undefined,
      goalCents,
    };
  } catch (error) {
    console.error("verifyGivebutterCampaignAction error:", error);
    return {
      success: false,
      message:
        error instanceof Error
          ? `Verification failed: ${error.message}`
          : "Verification failed.",
    };
  }
}
