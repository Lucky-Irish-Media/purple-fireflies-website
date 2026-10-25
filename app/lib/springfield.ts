import { readEnvVar } from "@/app/lib/env";

export interface SpringfieldStats {
  total_boxes_delivered: number;
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