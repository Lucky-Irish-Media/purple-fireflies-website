"use server";

import { revalidatePath } from "next/cache";
import { verifySession } from "@/app/lib/dal";
import {
  isGivebutterConfigured,
  refreshCampaignTotals,
} from "@/app/lib/givebutter";

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
