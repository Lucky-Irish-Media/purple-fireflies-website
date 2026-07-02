import "server-only";

import { getCloudflareContext } from "@opennextjs/cloudflare";
import type { DriverVolunteer, DeliveryAssignment } from "@/app/lib/definitions";

async function getDB(): Promise<D1Database> {
  const { env } = await getCloudflareContext({ async: true });
  return env.purple_fireflies_db;
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
  quantity: number;
  contact_method: "call" | "text" | "email";
  delivery_day: "wednesday" | "thursday";
  delivery_date: string;
  comments: string | null;
  created_at: string;
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
  contactMethod: "call" | "text" | "email";
  deliveryDate: string;
  comments?: string;
  quantity?: number;
}): Promise<MealSignup> {
  const db = await getDB();
  const result = await db
    .prepare(
      `INSERT INTO meal_signups (name, email, phone, address1, address2, city, state, zip_code, meal_type, quantity, contact_method, delivery_day, delivery_date, comments)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       RETURNING *`
    )
    .bind(data.name, data.email, data.phone, data.address1, data.address2 || null, data.city, data.state, data.zipCode, data.mealType, data.quantity ?? 1, data.contactMethod, getDeliveryDay(data.deliveryDate), data.deliveryDate, data.comments || null)
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
    .prepare("SELECT * FROM meal_signups WHERE delivery_date >= date('now', '-90 days') ORDER BY created_at DESC LIMIT 500")
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

export async function updateMealSignup(id: number, data: {
  name: string;
  email: string;
  phone: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  zipCode: string;
  mealType: "regular" | "vegan";
  contactMethod: "call" | "text" | "email";
  deliveryDate: string;
  comments?: string;
  quantity?: number;
}): Promise<MealSignup> {
  const db = await getDB();
  const result = await db
    .prepare(
      `UPDATE meal_signups
       SET name = ?, email = ?, phone = ?, address1 = ?, address2 = ?,
           city = ?, state = ?, zip_code = ?, meal_type = ?,
           quantity = ?, contact_method = ?, delivery_day = ?, delivery_date = ?, comments = ?
       WHERE id = ?
       RETURNING *`
    )
    .bind(data.name, data.email, data.phone, data.address1, data.address2 || null, data.city, data.state, data.zipCode, data.mealType, data.quantity ?? 1, data.contactMethod, getDeliveryDay(data.deliveryDate), data.deliveryDate, data.comments || null, id)
    .first<MealSignup>();
  if (!result) {
    throw new Error("Failed to update meal signup");
  }
  return result;
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

export async function updateDriverVolunteer(id: number, data: {
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
      `UPDATE driver_volunteers
       SET name = ?, email = ?, phone = ?, on_signal = ?, regions = ?, delivery_day = ?, delivery_date = ?
       WHERE id = ?
       RETURNING *`
    )
    .bind(data.name, data.email, data.phone, data.onSignal, data.regions, getDeliveryDay(data.deliveryDate), data.deliveryDate, id)
    .first<DriverVolunteer>();
  if (!result) {
    throw new Error("Failed to update driver volunteer");
  }
  return result;
}

export async function getMealSignupCountsByDate(): Promise<Record<string, number>> {
  const db = await getDB();
  const today = new Date().toISOString().split("T")[0];
  const result = await db
    .prepare("SELECT delivery_date, SUM(quantity) as count FROM meal_signups WHERE delivery_date >= ? GROUP BY delivery_date")
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
    .prepare("SELECT * FROM driver_volunteers WHERE delivery_date >= date('now', '-90 days') ORDER BY created_at DESC LIMIT 500")
    .all<DriverVolunteer>();
  return result.results || [];
}

export async function getDriverVolunteersByEmailOrPhone(email: string, phone: string): Promise<DriverVolunteer[]> {
  const db = await getDB();
  const today = new Date().toISOString().split("T")[0];
  const result = await db
    .prepare("SELECT * FROM driver_volunteers WHERE (email = ? OR phone = ?) AND delivery_date >= ? ORDER BY delivery_date ASC")
    .bind(email.toLowerCase(), phone, today)
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
}

export async function getUsers(): Promise<User[]> {
  const db = await getDB();
  const result = await db
    .prepare(
      `SELECT id, email, name, role, created_at
       FROM users
       ORDER BY created_at DESC`
    )
    .all<User>();
  return result.results || [];
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const db = await getDB();
  const user = await db
    .prepare("SELECT id, email, name, role, created_at, password_hash FROM users WHERE email = ?")
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
  return result;
}

export async function updateUserRecord(id: number, data: {
  name: string;
  email: string;
  role: "admin" | "member";
}): Promise<User> {
  const db = await getDB();
  const result = await db
    .prepare(
      `UPDATE users SET name = ?, email = ?, role = ? WHERE id = ?
       RETURNING id, email, name, role, created_at`
    )
    .bind(data.name, data.email, data.role, id)
    .first<User>();
  if (!result) {
    throw new Error("Failed to update user");
  }
  return result;
}

export async function deleteUserRecord(id: number): Promise<void> {
  const db = await getDB();
  await db
    .prepare("DELETE FROM users WHERE id = ?")
    .bind(id)
    .run();
}

export async function updateUserPassword(id: number, passwordHash: string): Promise<void> {
  const db = await getDB();
  await db
    .prepare("UPDATE users SET password_hash = ? WHERE id = ?")
    .bind(passwordHash, id)
    .run();
}

export interface MealSignupWithAssignmentDb {
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
  quantity: number;
  contact_method: "call" | "text" | "email";
  delivery_day: "wednesday" | "thursday";
  delivery_date: string;
  comments: string | null;
  created_at: string;
  assignment_id: number | null;
  driver_id: number | null;
  driver_name: string | null;
  driver_phone: string | null;
}

export async function getMealSignupsWithAssignments(): Promise<MealSignupWithAssignmentDb[]> {
  const db = await getDB();
  const result = await db
    .prepare(
      `SELECT ms.*, da.id as assignment_id, da.driver_volunteer_id as driver_id, dv.name as driver_name, dv.phone as driver_phone
       FROM meal_signups ms
       LEFT JOIN delivery_assignments da ON ms.id = da.meal_signup_id
       LEFT JOIN driver_volunteers dv ON da.driver_volunteer_id = dv.id
       WHERE ms.delivery_date >= date('now', '-90 days')
       ORDER BY ms.delivery_date ASC, ms.created_at DESC
       LIMIT 500`
    )
    .all<MealSignupWithAssignmentDb>();
  return result.results || [];
}

export async function createAssignment(
  mealSignupId: number,
  driverVolunteerId: number
): Promise<DeliveryAssignment> {
  const db = await getDB();
  const existing = await db
    .prepare("SELECT id FROM delivery_assignments WHERE meal_signup_id = ?")
    .bind(mealSignupId)
    .first<{ id: number }>();

  if (existing) {
    const result = await db
      .prepare("UPDATE delivery_assignments SET driver_volunteer_id = ? WHERE meal_signup_id = ? RETURNING *")
      .bind(driverVolunteerId, mealSignupId)
      .first<DeliveryAssignment>();
    if (!result) throw new Error("Failed to update assignment");
    return result;
  }

  const result = await db
    .prepare("INSERT INTO delivery_assignments (meal_signup_id, driver_volunteer_id) VALUES (?, ?) RETURNING *")
    .bind(mealSignupId, driverVolunteerId)
    .first<DeliveryAssignment>();
  if (!result) throw new Error("Failed to create assignment");
  return result;
}

export async function deleteAssignmentByMealSignupId(mealSignupId: number): Promise<void> {
  const db = await getDB();
  await db
    .prepare("DELETE FROM delivery_assignments WHERE meal_signup_id = ?")
    .bind(mealSignupId)
    .run();
}

export interface TomorrowDelivery {
  meal_name: string;
  meal_phone: string;
  address: string;
  comments: string | null;
  meal_type: string;
  quantity: number;
}

export interface TomorrowDriver {
  driver_id: number;
  driver_name: string;
  driver_email: string;
  driver_phone: string;
  delivery_day: string;
  delivery_date: string;
  deliveries: TomorrowDelivery[];
}

export async function getMealSignupById(id: number): Promise<MealSignup | null> {
  const db = await getDB();
  const result = await db
    .prepare("SELECT * FROM meal_signups WHERE id = ?")
    .bind(id)
    .first<MealSignup>();
  return result || null;
}

export async function getDriverById(id: number): Promise<DriverVolunteer | null> {
  const db = await getDB();
  const result = await db
    .prepare("SELECT * FROM driver_volunteers WHERE id = ?")
    .bind(id)
    .first<DriverVolunteer>();
  return result || null;
}

export async function getTomorrowsAssignments(): Promise<TomorrowDriver[]> {
  const db = await getDB();
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split("T")[0];

  const result = await db
    .prepare(
      `SELECT dv.id as driver_id, dv.name as driver_name, dv.email as driver_email, dv.phone as driver_phone,
               ms.id as meal_id, ms.name as meal_name, ms.phone as meal_phone,
               ms.address1, ms.address2, ms.city, ms.state, ms.zip_code,
               ms.comments, ms.meal_type, ms.quantity, ms.delivery_day, ms.delivery_date
       FROM delivery_assignments da
       JOIN driver_volunteers dv ON da.driver_volunteer_id = dv.id
       JOIN meal_signups ms ON da.meal_signup_id = ms.id
       WHERE ms.delivery_date = ?
       ORDER BY dv.id, ms.name`
    )
    .bind(tomorrowStr)
    .all<{
      driver_id: number;
      driver_name: string;
      driver_email: string;
      driver_phone: string;
      meal_id: number;
      meal_name: string;
      meal_phone: string;
      address1: string;
      address2: string | null;
      city: string;
      state: string;
      zip_code: string;
      comments: string | null;
      meal_type: string;
      quantity: number;
      delivery_day: string;
      delivery_date: string;
    }>();

  if (!result.results || result.results.length === 0) {
    return [];
  }

  const driverMap = new Map<number, TomorrowDriver>();
  for (const row of result.results) {
    if (!driverMap.has(row.driver_id)) {
      driverMap.set(row.driver_id, {
        driver_id: row.driver_id,
        driver_name: row.driver_name,
        driver_email: row.driver_email,
        driver_phone: row.driver_phone,
        delivery_day: row.delivery_day,
        delivery_date: row.delivery_date,
        deliveries: [],
      });
    }
    const address = `${row.address1}${row.address2 ? ", " + row.address2 : ""}, ${row.city}, ${row.state} ${row.zip_code}`;
    driverMap.get(row.driver_id)!.deliveries.push({
      meal_name: row.meal_name,
      meal_phone: row.meal_phone,
      address,
      comments: row.comments,
      meal_type: row.meal_type,
      quantity: row.quantity,
    });
  }

  return Array.from(driverMap.values());
}
