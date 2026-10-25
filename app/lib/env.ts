import { getCloudflareContext } from "@opennextjs/cloudflare";

/**
 * Reads a plain var or secret from the Worker environment.
 *
 * The Node process env comes first so local dev, scripts, and tests can set a
 * value without a Cloudflare context. Then the OpenNext binding. Anything else
 * (running outside the Worker with nothing set) is `undefined` rather than a
 * throw, because every caller here has a safe default.
 */
export async function readEnvVar(name: string): Promise<string | undefined> {
  const fromProcess = process.env[name];

  if (fromProcess) {
    return fromProcess;
  }

  try {
    const { env } = await getCloudflareContext({ async: true });
    return (env as unknown as Record<string, string | undefined>)[name];
  } catch {
    // Cloudflare context not available (e.g., running outside opennext).
    return undefined;
  }
}
