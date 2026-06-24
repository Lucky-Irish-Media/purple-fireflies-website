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

export async function createDriverVolunteer(data: {
  name: string;
  email: string;
  phone: string;
  deliveryDate: string;
}): Promise<DriverVolunteer> {
  const db = await getDB();
  const result = await db
    .prepare(
      `INSERT INTO driver_volunteers (name, email, phone, delivery_day, delivery_date)
       VALUES (?, ?, ?, ?, ?)
       RETURNING *`
    )
    .bind(data.name, data.email, data.phone, getDeliveryDay(data.deliveryDate), data.deliveryDate)
    .first<DriverVolunteer>();
  if (!result) {
    throw new Error("Failed to create driver volunteer");
  }
  return result;
}

export async function getDriverVolunteers(): Promise<DriverVolunteer[]> {
  const db = await getDB();
  const result = await db
    .prepare("SELECT * FROM driver_volunteers ORDER BY created_at DESC")
    .all<DriverVolunteer>();
  return result.results || [];
}
