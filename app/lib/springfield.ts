import { getCloudflareContext } from "@opennextjs/cloudflare";

export interface SpringfieldStats {
  total_boxes_delivered: number;
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

function toCount(raw: string | undefined): number {
  if (raw === undefined) {
    return 0;
  }

  const parsed = Number.parseInt(raw.trim(), 10);

  if (!Number.isFinite(parsed) || parsed < 0) {
    return 0;
  }

  return parsed;
}

export async function getSpringfieldStats(): Promise<SpringfieldStats> {
  const raw = await readEnvVar("SPRINGFIELD_BOXES_DELIVERED");

  return {
    total_boxes_delivered: toCount(raw),
  };
}