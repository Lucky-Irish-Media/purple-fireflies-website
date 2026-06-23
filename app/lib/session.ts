import { SignJWT, jwtVerify } from "jose";
import type { JWTPayload } from "jose";
import { cookies } from "next/headers";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import type { SessionPayload } from "./definitions";

async function getEncodedKey() {
  let secretKey = process.env.SESSION_SECRET;

  if (!secretKey) {
    try {
      const { env } = await getCloudflareContext({ async: true });
      secretKey = (env as Record<string, string | undefined>).SESSION_SECRET;
    } catch {
      // Cloudflare context not available (e.g., running outside opennext)
    }
  }

  if (!secretKey) {
    throw new Error("SESSION_SECRET environment variable is required");
  }
  return new TextEncoder().encode(secretKey);
}

export async function encrypt(
  payload: SessionPayload
): Promise<string> {
  const key = await getEncodedKey();
  return new SignJWT(payload as unknown as JWTPayload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(key);
}

export async function decrypt(
  session: string | undefined = ""
): Promise<SessionPayload | undefined> {
  try {
    const key = await getEncodedKey();
    const { payload } = await jwtVerify(session, key, {
      algorithms: ["HS256"],
    });
    return payload as unknown as SessionPayload;
  } catch {
    return undefined;
  }
}

export async function createSession(
  adminId: number,
  email: string,
  role: string
) {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const session = await encrypt({ adminId, email, role, expiresAt });
  const cookieStore = await cookies();

  cookieStore.set("session", session, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    expires: expiresAt,
    path: "/",
  });
}

export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete("session");
}
