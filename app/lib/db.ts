import "server-only";

import { getCloudflareContext } from "@opennextjs/cloudflare";
import type {
  Participant,
  MealSignup,
  DriverVolunteer,
  DeliveryAssignment,
  MealSignupWithParticipant,
  DriverVolunteerWithParticipant,
  MealSignupWithAssignment,
} from "@/app/lib/definitions";

async function getDB(): Promise<D1Database> {
  const { env } = await getCloudflareContext({ async: true });
  return env.purple_fireflies_db;
}

function getDeliveryDay(dateStr: string): "wednesday" | "thursday" {
  const date = new Date(dateStr);
  const day = date.getDay();
  return day === 3 ? "wednesday" : "thursday";
}

const MEAL_SIGNUP_SELECT = `ms.id, ms.participant_id, ms.meal_type, ms.quantity, ms.delivery_day, ms.delivery_date, ms.comments, ms.bag_number, ms.internal_notes, ms.created_at`;
const DRIVER_SELECT = `dv.id, dv.participant_id, dv.on_signal, dv.regions, dv.delivery_day, dv.delivery_date, dv.created_at`;
const PARTICIPANT_SELECT = `p.name as participant_name, p.email as participant_email, p.phone as participant_phone, p.address1 as participant_address1, p.address2 as participant_address2, p.city as participant_city, p.state as participant_state, p.zip_code as participant_zip_code, p.contact_method as participant_contact_method`;
const DRIVER_PARTICIPANT_SELECT = `p.name as participant_name, p.email as participant_email, p.phone as participant_phone`;

export async function getParticipantByEmail(email: string): Promise<Participant | null> {
  const db = await getDB();
  const result = await db
    .prepare("SELECT * FROM participants WHERE LOWER(email) = LOWER(?)")
    .bind(email)
    .first<Participant>();
  return result || null;
}

export async function getParticipantById(id: number): Promise<Participant | null> {
  const db = await getDB();
  const result = await db
    .prepare("SELECT * FROM participants WHERE id = ?")
    .bind(id)
    .first<Participant>();
  return result || null;
}

export async function createParticipant(data: {
  name: string;
  email: string;
  phone: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  zipCode: string;
  contactMethod: "call" | "text" | "email";
}): Promise<Participant> {
  const db = await getDB();
  const result = await db
    .prepare(
      `INSERT INTO participants (name, email, phone, address1, address2, city, state, zip_code, contact_method, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
       RETURNING *`
    )
    .bind(data.name, data.email, data.phone, data.address1, data.address2 || null, data.city, data.state, data.zipCode, data.contactMethod)
    .first<Participant>();
  if (!result) {
    throw new Error("Failed to create participant");
  }
  return result;
}

export async function updateParticipant(id: number, data: {
  name: string;
  email: string;
  phone: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  zipCode: string;
  contactMethod: "call" | "text" | "email";
}): Promise<Participant> {
  const db = await getDB();
  const result = await db
    .prepare(
      `UPDATE participants
       SET name = ?, email = ?, phone = ?, address1 = ?, address2 = ?,
           city = ?, state = ?, zip_code = ?, contact_method = ?, updated_at = datetime('now')
       WHERE id = ?
       RETURNING *`
    )
    .bind(data.name, data.email, data.phone, data.address1, data.address2 || null, data.city, data.state, data.zipCode, data.contactMethod, id)
    .first<Participant>();
  if (!result) {
    throw new Error("Failed to update participant");
  }
  return result;
}

export async function createMealSignup(data: {
  participantId: number;
  mealType: "regular" | "vegan";
  deliveryDate: string;
  comments?: string;
  quantity?: number;
  bagNumber?: string;
  internalNotes?: string;
}): Promise<MealSignup> {
  const db = await getDB();
  const result = await db
    .prepare(
      `INSERT INTO meal_signups (participant_id, meal_type, quantity, delivery_day, delivery_date, comments, bag_number, internal_notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)
       RETURNING *`
    )
    .bind(data.participantId, data.mealType, data.quantity ?? 1, getDeliveryDay(data.deliveryDate), data.deliveryDate, data.comments || null, data.bagNumber || null, data.internalNotes || null)
    .first<MealSignup>();
  if (!result) {
    throw new Error("Failed to create meal signup");
  }
  return result;
}

export async function getMealSignups(): Promise<MealSignupWithParticipant[]> {
  const db = await getDB();
  const result = await db
    .prepare(
      `SELECT ${MEAL_SIGNUP_SELECT}, ${PARTICIPANT_SELECT}
       FROM meal_signups ms
       JOIN participants p ON ms.participant_id = p.id
       WHERE ms.delivery_date >= date('now', '-90 days')
       ORDER BY ms.created_at DESC
       LIMIT 500`
    )
    .all<MealSignupWithParticipant>();
  return result.results || [];
}

export async function getMealSignupsByEmail(email: string): Promise<MealSignupWithParticipant[]> {
  const db = await getDB();
  const today = new Date().toISOString().split("T")[0];
  const result = await db
    .prepare(
      `SELECT ${MEAL_SIGNUP_SELECT}, ${PARTICIPANT_SELECT}
       FROM meal_signups ms
       JOIN participants p ON ms.participant_id = p.id
       WHERE LOWER(p.email) = LOWER(?) AND ms.delivery_date >= ?
       ORDER BY ms.delivery_date ASC`
    )
    .bind(email.toLowerCase(), today)
    .all<MealSignupWithParticipant>();
  return result.results || [];
}

export async function getDriverVolunteersByEmail(email: string): Promise<DriverVolunteerWithParticipant[]> {
  const db = await getDB();
  const today = new Date().toISOString().split("T")[0];
  const result = await db
    .prepare(
      `SELECT ${DRIVER_SELECT}, ${DRIVER_PARTICIPANT_SELECT}
       FROM driver_volunteers dv
       JOIN participants p ON dv.participant_id = p.id
       WHERE LOWER(p.email) = LOWER(?) AND dv.delivery_date >= ?
       ORDER BY dv.delivery_date ASC`
    )
    .bind(email.toLowerCase(), today)
    .all<DriverVolunteerWithParticipant>();
  return result.results || [];
}

export async function updateMealSignup(id: number, data: {
  participantId: number;
  mealType: "regular" | "vegan";
  deliveryDate: string;
  comments?: string;
  quantity?: number;
  bagNumber?: string;
  internalNotes?: string;
}): Promise<MealSignup> {
  const db = await getDB();
  const result = await db
    .prepare(
      `UPDATE meal_signups
       SET participant_id = ?, meal_type = ?, quantity = ?, delivery_day = ?, delivery_date = ?, comments = ?, bag_number = ?, internal_notes = ?
       WHERE id = ?
       RETURNING *`
    )
    .bind(data.participantId, data.mealType, data.quantity ?? 1, getDeliveryDay(data.deliveryDate), data.deliveryDate, data.comments || null, data.bagNumber || null, data.internalNotes || null, id)
    .first<MealSignup>();
  if (!result) {
    throw new Error("Failed to update meal signup");
  }
  return result;
}

export async function createDriverVolunteer(data: {
  participantId: number;
  onSignal: "yes" | "no" | "willing";
  regions: string;
  deliveryDate: string;
}): Promise<DriverVolunteer> {
  const db = await getDB();
  const result = await db
    .prepare(
      `INSERT INTO driver_volunteers (participant_id, on_signal, regions, delivery_day, delivery_date)
       VALUES (?, ?, ?, ?, ?)
       RETURNING *`
    )
    .bind(data.participantId, data.onSignal, data.regions, getDeliveryDay(data.deliveryDate), data.deliveryDate)
    .first<DriverVolunteer>();
  if (!result) {
    throw new Error("Failed to create driver volunteer");
  }
  return result;
}

export async function updateDriverVolunteer(id: number, data: {
  participantId: number;
  onSignal: "yes" | "no" | "willing";
  regions: string;
  deliveryDate: string;
}): Promise<DriverVolunteer> {
  const db = await getDB();
  const result = await db
    .prepare(
      `UPDATE driver_volunteers
       SET participant_id = ?, on_signal = ?, regions = ?, delivery_day = ?, delivery_date = ?
       WHERE id = ?
       RETURNING *`
    )
    .bind(data.participantId, data.onSignal, data.regions, getDeliveryDay(data.deliveryDate), data.deliveryDate, id)
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

export async function getDriverVolunteers(): Promise<DriverVolunteerWithParticipant[]> {
  const db = await getDB();
  const result = await db
    .prepare(
      `SELECT ${DRIVER_SELECT}, ${DRIVER_PARTICIPANT_SELECT}
       FROM driver_volunteers dv
       JOIN participants p ON dv.participant_id = p.id
       WHERE dv.delivery_date >= date('now', '-90 days')
       ORDER BY dv.created_at DESC
       LIMIT 500`
    )
    .all<DriverVolunteerWithParticipant>();
  return result.results || [];
}

export async function getDriverVolunteersByEmailOrPhone(email: string, phone: string): Promise<DriverVolunteerWithParticipant[]> {
  const db = await getDB();
  const today = new Date().toISOString().split("T")[0];
  const result = await db
    .prepare(
      `SELECT ${DRIVER_SELECT}, ${DRIVER_PARTICIPANT_SELECT}
       FROM driver_volunteers dv
       JOIN participants p ON dv.participant_id = p.id
       WHERE (LOWER(p.email) = LOWER(?) OR p.phone = ?) AND dv.delivery_date >= ?
       ORDER BY dv.delivery_date ASC`
    )
    .bind(email.toLowerCase(), phone, today)
    .all<DriverVolunteerWithParticipant>();
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

export async function getMealSignupsWithAssignments(): Promise<MealSignupWithAssignment[]> {
  const db = await getDB();
  const result = await db
    .prepare(
      `SELECT ${MEAL_SIGNUP_SELECT}, ${PARTICIPANT_SELECT},
               da.id as assignment_id, da.driver_volunteer_id as driver_id,
               dp.name as driver_name, dp.phone as driver_phone
       FROM meal_signups ms
       JOIN participants p ON ms.participant_id = p.id
       LEFT JOIN delivery_assignments da ON ms.id = da.meal_signup_id
       LEFT JOIN driver_volunteers dv ON da.driver_volunteer_id = dv.id
       LEFT JOIN participants dp ON dv.participant_id = dp.id
       WHERE ms.delivery_date >= date('now', '-90 days')
       ORDER BY ms.delivery_date ASC, ms.created_at DESC
       LIMIT 500`
    )
    .all<MealSignupWithAssignment>();
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

export async function updateAssignmentDetails(
  mealSignupId: number,
  data: { notes?: string | null; bag_number?: string | null }
): Promise<void> {
  const db = await getDB();
  const existing = await db
    .prepare("SELECT id FROM delivery_assignments WHERE meal_signup_id = ?")
    .bind(mealSignupId)
    .first<{ id: number }>();

  if (!existing) return;

  const sets: string[] = [];
  const values: any[] = [];
  if (data.notes !== undefined) {
    sets.push("notes = ?");
    values.push(data.notes);
  }
  if (data.bag_number !== undefined) {
    sets.push("bag_number = ?");
    values.push(data.bag_number);
  }
  if (sets.length === 0) return;

  values.push(mealSignupId);
  await db
    .prepare(`UPDATE delivery_assignments SET ${sets.join(", ")} WHERE meal_signup_id = ?`)
    .bind(...values)
    .run();
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

export async function updateMealSignupField(id: number, field: string, value: string | null): Promise<void> {
  const db = await getDB();
  await db
    .prepare(`UPDATE meal_signups SET ${field} = ? WHERE id = ?`)
    .bind(value, id)
    .run();
}

export async function getMealSignupById(id: number): Promise<MealSignupWithParticipant | null> {
  const db = await getDB();
  const result = await db
    .prepare(
      `SELECT ${MEAL_SIGNUP_SELECT}, ${PARTICIPANT_SELECT}
       FROM meal_signups ms
       JOIN participants p ON ms.participant_id = p.id
       WHERE ms.id = ?`
    )
    .bind(id)
    .first<MealSignupWithParticipant>();
  return result || null;
}

export async function getDriverById(id: number): Promise<DriverVolunteerWithParticipant | null> {
  const db = await getDB();
  const result = await db
    .prepare(
      `SELECT ${DRIVER_SELECT}, ${DRIVER_PARTICIPANT_SELECT}
       FROM driver_volunteers dv
       JOIN participants p ON dv.participant_id = p.id
       WHERE dv.id = ?`
    )
    .bind(id)
    .first<DriverVolunteerWithParticipant>();
  return result || null;
}

export async function getTomorrowsAssignments(): Promise<TomorrowDriver[]> {
  const db = await getDB();
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split("T")[0];

  const result = await db
    .prepare(
      `SELECT dv.id as driver_id, dp.name as driver_name, dp.email as driver_email, dp.phone as driver_phone,
               ms.id as meal_id, mp.name as meal_name, mp.phone as meal_phone,
               mp.address1, mp.address2, mp.city, mp.state, mp.zip_code,
               ms.comments, ms.meal_type, ms.quantity, ms.delivery_day, ms.delivery_date
       FROM delivery_assignments da
       JOIN driver_volunteers dv ON da.driver_volunteer_id = dv.id
       JOIN participants dp ON dv.participant_id = dp.id
       JOIN meal_signups ms ON da.meal_signup_id = ms.id
       JOIN participants mp ON ms.participant_id = mp.id
       WHERE ms.delivery_date = ?
       ORDER BY dv.id, mp.name`
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
