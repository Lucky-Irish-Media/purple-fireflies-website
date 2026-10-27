import { getCloudflareContext } from "@opennextjs/cloudflare";

export async function readEnvVar(name: string): Promise<string | undefined> {
  const fromProcess = process.env[name];

  if (fromProcess) {
    return fromProcess;
  }

  try {
    const { env } = await getCloudflareContext({ async: true });
    return (env as unknown as Record<string, string | undefined>)[name];
  } catch {
    return undefined;
  }
}
