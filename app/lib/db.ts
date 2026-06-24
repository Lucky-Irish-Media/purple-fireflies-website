import { getCloudflareContext } from "@opennextjs/cloudflare";
import type { DriverVolunteer } from "@/app/lib/definitions";

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

export interface MealSignup {
  id: number;
  name: string;
  email: string;
  phone: string;
  address1: string;
  address2: string | null;
  city: string;
  state: string;
  zip_code: string;
  meal_type: "regular" | "vegan";
  delivery_day: "wednesday" | "thursday";
  delivery_date: string;
  comments: string | null;
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

export async function createMealSignup(data: {
  name: string;
  email: string;
  phone: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  zipCode: string;
  mealType: "regular" | "vegan";
  deliveryDate: string;
  comments?: string;
}): Promise<MealSignup> {
  const db = await getDB();
  const result = await db
    .prepare(
      `INSERT INTO meal_signups (name, email, phone, address1, address2, city, state, zip_code, meal_type, delivery_day, delivery_date, comments)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       RETURNING *`
    )
    .bind(data.name, data.email, data.phone, data.address1, data.address2 || null, data.city, data.state, data.zipCode, data.mealType, getDeliveryDay(data.deliveryDate), data.deliveryDate, data.comments || null)
    .first<MealSignup>();
  if (!result) {
    throw new Error("Failed to create meal signup");
  }
  return result;
}

function getDeliveryDay(dateStr: string): "wednesday" | "thursday" {
  const date = new Date(dateStr);
  const day = date.getDay();
  return day === 3 ? "wednesday" : "thursday";
}

export async function getMealSignups(): Promise<MealSignup[]> {
  const db = await getDB();
  const result = await db
    .prepare("SELECT * FROM meal_signups ORDER BY created_at DESC")
    .all<MealSignup>();
  return result.results || [];
}

export async function getMealSignupsByEmail(email: string): Promise<MealSignup[]> {
  const db = await getDB();
  const today = new Date().toISOString().split("T")[0];
  const result = await db
    .prepare("SELECT * FROM meal_signups WHERE email = ? AND delivery_date >= ? ORDER BY delivery_date ASC")
    .bind(email.toLowerCase(), today)
    .all<MealSignup>();
  return result.results || [];
}

export async function getDriverVolunteersByEmail(email: string): Promise<DriverVolunteer[]> {
  const db = await getDB();
  const today = new Date().toISOString().split("T")[0];
  const result = await db
    .prepare("SELECT * FROM driver_volunteers WHERE email = ? AND delivery_date >= ? ORDER BY delivery_date ASC")
    .bind(email.toLowerCase(), today)
    .all<DriverVolunteer>();
  return result.results || [];
}

export async function createDriverVolunteer(data: {
  name: string;
  email: string;
  phone: string;
  onSignal: "yes" | "no" | "willing";
  regions: string;
  deliveryDate: string;
}): Promise<DriverVolunteer> {
  const db = await getDB();
  const result = await db
    .prepare(
      `INSERT INTO driver_volunteers (name, email, phone, on_signal, regions, delivery_day, delivery_date)
       VALUES (?, ?, ?, ?, ?, ?, ?)
       RETURNING *`
    )
    .bind(data.name, data.email, data.phone, data.onSignal, data.regions, getDeliveryDay(data.deliveryDate), data.deliveryDate)
    .first<DriverVolunteer>();
  if (!result) {
    throw new Error("Failed to create driver volunteer");
  }
  return result;
}

export async function getMealSignupCountsByDate(): Promise<Record<string, number>> {
  const db = await getDB();
  const today = new Date().toISOString().split("T")[0];
  const result = await db
    .prepare("SELECT delivery_date, COUNT(*) as count FROM meal_signups WHERE delivery_date >= ? GROUP BY delivery_date")
    .bind(today)
    .all<{ delivery_date: string; count: number }>();
  const counts: Record<string, number> = {};
  for (const row of result.results || []) {
    counts[row.delivery_date] = row.count;
  }
  return counts;
}

export async function getDriverVolunteers(): Promise<DriverVolunteer[]> {
  const db = await getDB();
  const result = await db
    .prepare("SELECT * FROM driver_volunteers ORDER BY created_at DESC")
    .all<DriverVolunteer>();
  return result.results || [];
}

export interface User {
  id: number;
  email: string;
  name: string;
  password_hash?: string;
  role: "admin" | "member";
  created_at: string;
  source: "admins" | "users";
}

export async function getUsers(): Promise<User[]> {
  const db = await getDB();
  const result = await db
    .prepare(
      `SELECT id, email, name, 'admin' as role, created_at, 'admins' as source FROM admins
       UNION ALL
       SELECT id, email, name, role, created_at, 'users' as source FROM users
       ORDER BY created_at DESC`
    )
    .all<User>();
  return result.results || [];
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const db = await getDB();
  const admin = await db
    .prepare("SELECT id, email, name, 'admin' as role, created_at, 'admins' as source, password_hash FROM admins WHERE email = ?")
    .bind(email)
    .first<User>();
  if (admin) return admin;
  const user = await db
    .prepare("SELECT id, email, name, role, created_at, 'users' as source, password_hash FROM users WHERE email = ?")
    .bind(email)
    .first<User>();
  return user || null;
}

export async function createUser(data: {
  email: string;
  name: string;
  passwordHash: string;
  role: "admin" | "member";
}): Promise<User> {
  const db = await getDB();
  const result = await db
    .prepare(
      `INSERT INTO users (email, name, password_hash, role)
       VALUES (?, ?, ?, ?)
       RETURNING id, email, name, role, created_at`
    )
    .bind(data.email, data.name, data.passwordHash, data.role)
    .first<User>();
  if (!result) {
    throw new Error("Failed to create user");
  }
  return { ...result, source: "users" as const };
}

export async function deleteUserRecord(id: number, source: "admins" | "users"): Promise<void> {
  const db = await getDB();
  const table = source === "admins" ? "admins" : "users";
  await db
    .prepare(`DELETE FROM ${table} WHERE id = ?`)
    .bind(id)
    .run();
}

export async function updateUserPassword(id: number, passwordHash: string, source: "admins" | "users"): Promise<void> {
  const db = await getDB();
  const table = source === "admins" ? "admins" : "users";
  await db
    .prepare(`UPDATE ${table} SET password_hash = ? WHERE id = ?`)
    .bind(passwordHash, id)
    .run();
}
