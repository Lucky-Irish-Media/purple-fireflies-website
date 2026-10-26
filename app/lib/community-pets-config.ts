import "server-only";

import { readEnvVar } from "@/app/lib/env";

/**
 * Deployment-level switches for the public Community Pet Fund pages.
 *
 * Both values are plain vars, not secrets: `wrangler.toml` keeps production
 * turned off until the launch gates clear and turns preview on so the sponsor
 * block can be exercised before launch. Reads go through `readEnvVar()`: the
 * Node process env first, then the Cloudflare env binding, and anything missing
 * or unexpected fails safe to the conservative value.
 */

export type NonprofitStatus = "state_only" | "501c3";

export interface CommunityPetsConfig {
  donationsEnabled: boolean;
  nonprofitStatus: NonprofitStatus;
  /**
   * Givebutter's Widgets account ID. It is public by nature - it ends up in the
   * library script URL on the pet page - and the embedded form cannot load
   * without it. Empty when unset, which makes the sponsor block fall back to a
   * plain campaign link instead of an empty form.
   */
  givebutterAccountId: string;
}

export async function getCommunityPetsConfig(): Promise<CommunityPetsConfig> {
  const [donationsRaw, nonprofitRaw, widgetAccountRaw] = await Promise.all([
    readEnvVar("COMMUNITY_PETS_DONATIONS_ENABLED"),
    readEnvVar("NONPROFIT_STATUS"),
    readEnvVar("GIVEBUTTER_WIDGET_ACCOUNT_ID"),
  ]);

  return {
    // Only the exact string turns the sponsor UI on. A typo, a missing var, or
    // the production default of "false" all leave donations off.
    donationsEnabled: donationsRaw === "true",
    // No determination letter means no deductibility claim, so anything that is
    // not exactly "501c3" renders the state-only copy.
    nonprofitStatus: nonprofitRaw === "501c3" ? "501c3" : "state_only",
    givebutterAccountId: widgetAccountRaw?.trim() ?? "",
  };
}

/**
 * The one place the tax claim is written. Pages call this instead of embedding
 * either version, so gaining 501(c)(3) status is a var flip and nothing else.
 */
export function getTaxStatusCopy(status: NonprofitStatus): string {
  if (status === "501c3") {
    return "Purple Fireflies is a 501(c)(3) nonprofit, so gifts are tax-deductible to the extent allowed by law.";
  }

  return "Purple Fireflies is a registered Ohio nonprofit corporation. We are not currently a 501(c)(3), so gifts are not tax-deductible.";
}
