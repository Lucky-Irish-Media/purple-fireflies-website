import "server-only";

import { getCloudflareContext } from "@opennextjs/cloudflare";

/**
 * Deployment-level switches for the public Community Pet Fund pages.
 *
 * Both values are plain vars, not secrets: `wrangler.toml` keeps production
 * turned off until the launch gates clear and turns preview on so the sponsor
 * block can be exercised before launch. Reads follow `app/lib/springfield.ts`:
 * the Node process env first, then the Cloudflare env binding, and anything
 * missing or unexpected fails safe to the conservative value.
 */

export type NonprofitStatus = "state_only" | "501c3";

export interface CommunityPetsConfig {
  donationsEnabled: boolean;
  nonprofitStatus: NonprofitStatus;
}

async function readEnvVar(name: string): Promise<string | undefined> {
  const fromProcess = process.env[name];

  if (fromProcess) {
    return fromProcess;
  }

  try {
    const { env } = await getCloudflareContext({ async: true });
    return (env as unknown as Record<string, string | undefined>)[name];
  } catch {
    // Cloudflare context not available (e.g., running outside opennext)
    return undefined;
  }
}

export async function getCommunityPetsConfig(): Promise<CommunityPetsConfig> {
  const [donationsRaw, nonprofitRaw] = await Promise.all([
    readEnvVar("COMMUNITY_PETS_DONATIONS_ENABLED"),
    readEnvVar("NONPROFIT_STATUS"),
  ]);

  return {
    // Only the exact string turns the sponsor UI on. A typo, a missing var, or
    // the production default of "false" all leave donations off.
    donationsEnabled: donationsRaw === "true",
    // No determination letter means no deductibility claim, so anything that is
    // not exactly "501c3" renders the state-only copy.
    nonprofitStatus: nonprofitRaw === "501c3" ? "501c3" : "state_only",
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
