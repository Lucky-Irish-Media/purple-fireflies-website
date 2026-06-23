import { getCloudflareContext } from "@opennextjs/cloudflare";

async function getDB(): Promise<D1Database> {
  const { env } = await getCloudflareContext({ async: true });
  return env.purple_fireflies_db;
}

export interface Admin {
  id: number;
  email: string;
  name: string;
  password_hash: string;
  role: string;
  created_at: string;
}

export async function getAdminByEmail(
  email: string
): Promise<Admin | null> {
  const db = await getDB();
  const result = await db
    .prepare("SELECT * FROM admins WHERE email = ?")
    .bind(email)
    .first<Admin>();
  return result || null;
}

export async function getAdminById(id: number): Promise<Admin | null> {
  const db = await getDB();
  const result = await db
    .prepare("SELECT id, email, name, role, created_at FROM admins WHERE id = ?")
    .bind(id)
    .first<Admin>();
  return result || null;
}
