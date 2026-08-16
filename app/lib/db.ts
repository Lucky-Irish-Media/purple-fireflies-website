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
  WaitlistEntry,
  WaitlistEntryWithParticipant,
  Event,
  NewsArticle,
  VolunteerDashboard,
  VolunteerSignupWithDeliveries,
} from "@/app/lib/definitions";
import { getDeliveryDay, type DeliveryDay } from "@/app/lib/delivery-day";

async function getDB(): Promise<D1Database> {
  const { env } = await getCloudflareContext({ async: true });
  return env.purple_fireflies_db;
}

const MEAL_SIGNUP_SELECT = `ms.id, ms.participant_id, ms.regular_quantity, ms.vegan_quantity, ms.delivery_day, ms.delivery_date, ms.comments, ms.bag_number, ms.status, ms.created_at`;
const DRIVER_SELECT = `dv.id, dv.participant_id, dv.on_signal, dv.regions, dv.delivery_day, dv.delivery_date, dv.created_at`;
const PARTICIPANT_SELECT = `p.name as participant_name, p.email as participant_email, p.phone as participant_phone, p.address1 as participant_address1, p.address2 as participant_address2, p.city as participant_city, p.state as participant_state, p.zip_code as participant_zip_code, p.contact_method as participant_contact_method, p.internal_notes as participant_internal_notes`;
const DRIVER_PARTICIPANT_SELECT = `p.name as participant_name, p.email as participant_email, p.phone as participant_phone`;
const WAITLIST_SELECT = `wl.id, wl.participant_id, wl.delivery_date, wl.regular_quantity, wl.vegan_quantity, wl.status, wl.created_at`;

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
  internalNotes?: string;
}): Promise<Participant> {
  const db = await getDB();
  const result = await db
    .prepare(
      `INSERT INTO participants (name, email, phone, address1, address2, city, state, zip_code, contact_method, internal_notes, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
       RETURNING *`
    )
    .bind(data.name, data.email, data.phone, data.address1, data.address2 || null, data.city, data.state, data.zipCode, data.contactMethod, data.internalNotes || null)
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
  internalNotes?: string;
}): Promise<Participant> {
  const db = await getDB();
  const result = await db
    .prepare(
      `UPDATE participants
       SET name = ?, email = ?, phone = ?, address1 = ?, address2 = ?,
           city = ?, state = ?, zip_code = ?, contact_method = ?, internal_notes = ?, updated_at = datetime('now')
       WHERE id = ?
       RETURNING *`
    )
    .bind(data.name, data.email, data.phone, data.address1, data.address2 || null, data.city, data.state, data.zipCode, data.contactMethod, data.internalNotes || null, id)
    .first<Participant>();
  if (!result) {
    throw new Error("Failed to update participant");
  }
  return result;
}

export async function createMealSignup(data: {
  participantId: number;
  regularQuantity: number;
  veganQuantity: number;
  deliveryDate: string;
  comments?: string;
  bagNumber?: string;
}): Promise<MealSignup> {
  const db = await getDB();
  const result = await db
    .prepare(
      `INSERT INTO meal_signups (participant_id, regular_quantity, vegan_quantity, delivery_day, delivery_date, comments, bag_number)
       VALUES (?, ?, ?, ?, ?, ?, ?)
       RETURNING *`
    )
    .bind(data.participantId, data.regularQuantity, data.veganQuantity, getDeliveryDay(data.deliveryDate), data.deliveryDate, data.comments || null, data.bagNumber || null)
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
  regularQuantity: number;
  veganQuantity: number;
  deliveryDate: string;
  comments?: string;
  bagNumber?: string;
}): Promise<MealSignup> {
  const db = await getDB();
  const result = await db
    .prepare(
      `UPDATE meal_signups
       SET participant_id = ?, regular_quantity = ?, vegan_quantity = ?, delivery_day = ?, delivery_date = ?, comments = ?, bag_number = ?
       WHERE id = ?
       RETURNING *`
    )
    .bind(data.participantId, data.regularQuantity, data.veganQuantity, getDeliveryDay(data.deliveryDate), data.deliveryDate, data.comments || null, data.bagNumber || null, id)
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
    .prepare("SELECT delivery_date, SUM(regular_quantity + vegan_quantity) as count FROM meal_signups WHERE delivery_date >= ? AND status = 'active' GROUP BY delivery_date")
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

export type UserRole = "admin" | "member" | "volunteer";
export type UserStatus = "active" | "pending";

export interface DriverAssignment {
  meal_signup_id: number;
  delivery_date: string;
  delivery_day: string;
  recipient_name: string;
  recipient_phone: string;
  recipient_address: string;
  comments: string | null;
}

export async function getAssignmentsForDriver(volunteerId: number): Promise<DriverAssignment[]> {
  const db = await getDB();
  const result = await db
    .prepare(
      `SELECT ms.id as meal_signup_id, ms.delivery_date, ms.delivery_day,
              p.name as recipient_name, p.phone as recipient_phone,
              p.address1, p.address2, p.city, p.state, p.zip_code,
              ms.comments
       FROM delivery_assignments da
       JOIN meal_signups ms ON da.meal_signup_id = ms.id
       JOIN participants p ON ms.participant_id = p.id
       WHERE da.driver_volunteer_id = ?
       ORDER BY ms.delivery_date ASC`
    )
    .bind(volunteerId)
    .all<DriverAssignment & { address1: string; address2: string | null; city: string; state: string; zip_code: string }>();
  return (result.results || []).map((row) => ({
    meal_signup_id: row.meal_signup_id,
    delivery_date: row.delivery_date,
    delivery_day: row.delivery_day,
    recipient_name: row.recipient_name,
    recipient_phone: row.recipient_phone,
    recipient_address: `${row.address1}${row.address2 ? `, ${row.address2}` : ""}, ${row.city}, ${row.state} ${row.zip_code}`,
    comments: row.comments,
  }));
}

export async function getVolunteerDashboard(email: string): Promise<VolunteerDashboard> {
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

  const signups = result.results || [];
  const withDeliveries: VolunteerSignupWithDeliveries[] = [];
  for (const signup of signups) {
    withDeliveries.push({
      ...signup,
      deliveries: await getAssignmentsForDriver(signup.id),
    });
  }
  return { signups: withDeliveries };
}

export interface User {
  id: number;
  email: string;
  name: string;
  password_hash?: string;
  role: UserRole;
  status: UserStatus;
  created_at: string;
}

export async function getUsers(): Promise<User[]> {
  const db = await getDB();
  const result = await db
    .prepare(
      `SELECT id, email, name, role, status, created_at
       FROM users
       ORDER BY created_at DESC`
    )
    .all<User>();
  return result.results || [];
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const db = await getDB();
  const user = await db
    .prepare("SELECT id, email, name, role, status, created_at, password_hash FROM users WHERE LOWER(email) = LOWER(?)")
    .bind(email)
    .first<User>();
  return user || null;
}

export async function getUserById(id: number): Promise<User | null> {
  const db = await getDB();
  const user = await db
    .prepare("SELECT id, email, name, role, status, created_at, password_hash FROM users WHERE id = ?")
    .bind(id)
    .first<User>();
  return user || null;
}

export async function createUser(data: {
  email: string;
  name: string;
  passwordHash: string;
  role: UserRole;
  status?: UserStatus;
}): Promise<User> {
  const db = await getDB();
  const result = await db
    .prepare(
      `INSERT INTO users (email, name, password_hash, role, status)
       VALUES (?, ?, ?, ?, ?)
       RETURNING id, email, name, role, status, created_at`
    )
    .bind(data.email.toLowerCase(), data.name, data.passwordHash, data.role, data.status || "active")
    .first<User>();
  if (!result) {
    throw new Error("Failed to create user");
  }
  return result;
}

export async function updateUserRecord(id: number, data: {
  name: string;
  email: string;
  role: UserRole;
}): Promise<User> {
  const db = await getDB();
  const result = await db
    .prepare(
      `UPDATE users SET name = ?, email = ?, role = ? WHERE id = ?
       RETURNING id, email, name, role, status, created_at`
    )
    .bind(data.name, data.email.toLowerCase(), data.role, id)
    .first<User>();
  if (!result) {
    throw new Error("Failed to update user");
  }
  return result;
}

export async function updateUserStatus(id: number, status: UserStatus): Promise<void> {
  const db = await getDB();
  await db
    .prepare("UPDATE users SET status = ? WHERE id = ?")
    .bind(status, id)
    .run();
}

export async function updateUserEmail(id: number, email: string): Promise<void> {
  const db = await getDB();
  await db
    .prepare("UPDATE users SET email = LOWER(?) WHERE id = ?")
    .bind(email, id)
    .run();
}

export async function updateVolunteerSignupContact(participantId: number, onSignal: "yes" | "no" | "willing", regions: string): Promise<void> {
  const db = await getDB();
  const today = new Date().toISOString().split("T")[0];
  await db
    .prepare(
      `UPDATE driver_volunteers
       SET on_signal = ?, regions = ?
       WHERE participant_id = ? AND delivery_date >= ?`
    )
    .bind(onSignal, regions, participantId, today)
    .run();
}

export async function deleteDriverVolunteer(id: number): Promise<void> {
  const db = await getDB();
  await db
    .prepare("DELETE FROM delivery_assignments WHERE driver_volunteer_id = ?")
    .bind(id)
    .run();
  await db
    .prepare("DELETE FROM driver_volunteers WHERE id = ?")
    .bind(id)
    .run();
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

export interface DateDelivery {
  meal_name: string;
  meal_phone: string;
  address: string;
  comments: string | null;
  internal_notes: string | null;
  regular_quantity: number;
  vegan_quantity: number;
}

export interface DateDriver {
  driver_id: number;
  driver_name: string;
  driver_email: string;
  driver_phone: string;
  delivery_day: DeliveryDay;
  delivery_date: string;
  deliveries: DateDelivery[];
}

const ALLOWED_UPDATE_FIELDS = ["bag_number", "status"] as const;

export async function updateMealSignupField(id: number, field: string, value: string | null): Promise<void> {
  const db = await getDB();
  if (!ALLOWED_UPDATE_FIELDS.includes(field as any)) {
    throw new Error(`Invalid field: ${field}`);
  }
  await db
    .prepare(`UPDATE meal_signups SET ${field} = ? WHERE id = ?`)
    .bind(value, id)
    .run();
}

export async function deleteMealSignup(id: number): Promise<void> {
  const db = await getDB();
  await db
    .prepare("DELETE FROM delivery_assignments WHERE meal_signup_id = ?")
    .bind(id)
    .run();
  await db
    .prepare("DELETE FROM meal_signups WHERE id = ?")
    .bind(id)
    .run();
}

export async function getMealSignupsByParticipantAndDate(
  participantId: number,
  deliveryDate: string
): Promise<MealSignup[]> {
  const db = await getDB();
  const result = await db
    .prepare(
      `SELECT ${MEAL_SIGNUP_SELECT}
       FROM meal_signups ms
       WHERE ms.participant_id = ? AND ms.delivery_date = ?`
    )
    .bind(participantId, deliveryDate)
    .all<MealSignup>();
  return result.results || [];
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

export async function getDriverVolunteersByParticipantAndDate(
  participantId: number,
  deliveryDate: string
): Promise<DriverVolunteer[]> {
  const db = await getDB();
  const result = await db
    .prepare(
      `SELECT ${DRIVER_SELECT}
       FROM driver_volunteers dv
       WHERE dv.participant_id = ? AND dv.delivery_date = ?`
    )
    .bind(participantId, deliveryDate)
    .all<DriverVolunteer>();
  return result.results || [];
}

export async function getDeliveryDates(): Promise<string[]> {
  const db = await getDB();
  const today = new Date().toISOString().split("T")[0];

  const result = await db
    .prepare(
      `SELECT DISTINCT ms.delivery_date
       FROM delivery_assignments da
       JOIN meal_signups ms ON da.meal_signup_id = ms.id
       WHERE ms.delivery_date >= ?
       ORDER BY ms.delivery_date`
    )
    .bind(today)
    .all<{ delivery_date: string }>();

  return result.results.map((r) => r.delivery_date);
}

export async function getAssignmentsForDate(dateStr: string): Promise<DateDriver[]> {
  const db = await getDB();

  const result = await db
    .prepare(
      `SELECT dv.id as driver_id, dp.name as driver_name, dp.email as driver_email, dp.phone as driver_phone,
               ms.id as meal_id, mp.name as meal_name, mp.phone as meal_phone,
               mp.address1, mp.address2, mp.city, mp.state, mp.zip_code,
               ms.comments, mp.internal_notes, ms.regular_quantity, ms.vegan_quantity, ms.delivery_day, ms.delivery_date
       FROM delivery_assignments da
       JOIN driver_volunteers dv ON da.driver_volunteer_id = dv.id
       JOIN participants dp ON dv.participant_id = dp.id
       JOIN meal_signups ms ON da.meal_signup_id = ms.id
       JOIN participants mp ON ms.participant_id = mp.id
       WHERE ms.delivery_date = ?
       ORDER BY dv.id, mp.name`
    )
    .bind(dateStr)
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
      internal_notes: string | null;
      regular_quantity: number;
      vegan_quantity: number;
      delivery_day: DeliveryDay;
      delivery_date: string;
    }>();

  if (!result.results || result.results.length === 0) {
    return [];
  }

  const driverMap = new Map<number, DateDriver>();
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
      internal_notes: row.internal_notes,
      regular_quantity: row.regular_quantity,
      vegan_quantity: row.vegan_quantity,
    });
  }

  return Array.from(driverMap.values());
}

export interface ReminderLog {
  id: number;
  delivery_date: string;
  sent_count: number;
  failed_count: number;
  created_at: string;
}

export async function logReminderSent(
  deliveryDate: string,
  sentCount: number,
  failedCount: number,
): Promise<void> {
  const db = await getDB();
  await db
    .prepare(
      `INSERT INTO reminder_logs (delivery_date, sent_count, failed_count) VALUES (?, ?, ?)`
    )
    .bind(deliveryDate, sentCount, failedCount)
    .run();
}

export async function getReminderLogs(): Promise<ReminderLog[]> {
  const db = await getDB();
  const result = await db
    .prepare(
      `SELECT id, delivery_date, sent_count, failed_count, created_at
       FROM reminder_logs
       ORDER BY created_at DESC
       LIMIT 20`
    )
    .all<ReminderLog>();
  return result.results;
}

export const MAX_SIGNUPS_PER_DATE = 15;

export async function getMealSignupCountForDate(deliveryDate: string): Promise<number> {
  const db = await getDB();
  const result = await db
    .prepare("SELECT COALESCE(SUM(regular_quantity + vegan_quantity), 0) as count FROM meal_signups WHERE delivery_date = ? AND status = 'active'")
    .bind(deliveryDate)
    .first<{ count: number }>();
  return result?.count ?? 0;
}

export async function getClosedDeliveryDates(): Promise<string[]> {
  const db = await getDB();
  const result = await db
    .prepare("SELECT delivery_date FROM closed_delivery_dates WHERE delivery_date >= date('now')")
    .all<{ delivery_date: string }>();
  return (result.results || []).map((row) => row.delivery_date);
}

export async function isDeliveryDateClosed(deliveryDate: string): Promise<boolean> {
  const db = await getDB();
  const result = await db
    .prepare("SELECT 1 FROM closed_delivery_dates WHERE delivery_date = ?")
    .bind(deliveryDate)
    .first();
  return !!result;
}

export async function closeDeliveryDate(deliveryDate: string): Promise<void> {
  const db = await getDB();
  await db
    .prepare("INSERT INTO closed_delivery_dates (delivery_date) VALUES (?) ON CONFLICT(delivery_date) DO NOTHING")
    .bind(deliveryDate)
    .run();
}

export async function reopenDeliveryDate(deliveryDate: string): Promise<void> {
  const db = await getDB();
  await db
    .prepare("DELETE FROM closed_delivery_dates WHERE delivery_date = ?")
    .bind(deliveryDate)
    .run();
}

export async function addToWaitlist(data: {
  participantId: number;
  deliveryDate: string;
  regularQuantity: number;
  veganQuantity: number;
}): Promise<WaitlistEntry> {
  const db = await getDB();
  const result = await db
    .prepare(
      `INSERT INTO waitlist (participant_id, delivery_date, regular_quantity, vegan_quantity)
       VALUES (?, ?, ?, ?)
       RETURNING *`
    )
    .bind(data.participantId, data.deliveryDate, data.regularQuantity, data.veganQuantity)
    .first<WaitlistEntry>();
  if (!result) throw new Error("Failed to add to waitlist");
  return result;
}

export async function getWaitlistEntries(): Promise<WaitlistEntryWithParticipant[]> {
  const db = await getDB();
  const result = await db
    .prepare(
      `SELECT ${WAITLIST_SELECT},
              ${PARTICIPANT_SELECT}
       FROM waitlist wl
       JOIN participants p ON wl.participant_id = p.id
       WHERE wl.delivery_date >= date('now', '-30 days')
       ORDER BY wl.delivery_date ASC, wl.created_at ASC`
    )
    .all<WaitlistEntryWithParticipant>();
  return result.results || [];
}

export async function getWaitlistEntriesByDate(deliveryDate: string): Promise<WaitlistEntryWithParticipant[]> {
  const db = await getDB();
  const result = await db
    .prepare(
      `SELECT ${WAITLIST_SELECT},
              ${PARTICIPANT_SELECT}
       FROM waitlist wl
       JOIN participants p ON wl.participant_id = p.id
       WHERE wl.delivery_date = ? AND wl.status = 'waiting'
       ORDER BY wl.created_at ASC`
    )
    .bind(deliveryDate)
    .all<WaitlistEntryWithParticipant>();
  return result.results || [];
}

export async function getWaitlistEntryById(id: number): Promise<WaitlistEntryWithParticipant | null> {
  const db = await getDB();
  const result = await db
    .prepare(
      `SELECT ${WAITLIST_SELECT},
              ${PARTICIPANT_SELECT}
       FROM waitlist wl
       JOIN participants p ON wl.participant_id = p.id
       WHERE wl.id = ?`
    )
    .bind(id)
    .first<WaitlistEntryWithParticipant>();
  return result || null;
}

export async function updateWaitlistStatus(id: number, status: string): Promise<void> {
  const db = await getDB();
  await db
    .prepare("UPDATE waitlist SET status = ? WHERE id = ?")
    .bind(status, id)
    .run();
}

export async function deleteWaitlistEntry(id: number): Promise<void> {
  const db = await getDB();
  await db
    .prepare("DELETE FROM waitlist WHERE id = ?")
    .bind(id)
    .run();
}

export async function getEvents(): Promise<Event[]> {
  const db = await getDB();
  const result = await db
    .prepare("SELECT * FROM events ORDER BY event_date DESC, created_at DESC")
    .all<Event>();
  return result.results || [];
}

export async function getUpcomingEvents(): Promise<Event[]> {
  const db = await getDB();
  const today = new Date().toISOString().split("T")[0];
  const result = await db
    .prepare("SELECT * FROM events WHERE event_date >= ? ORDER BY event_date ASC")
    .bind(today)
    .all<Event>();
  return result.results || [];
}

export async function getPastEvents(): Promise<Event[]> {
  const db = await getDB();
  const today = new Date().toISOString().split("T")[0];
  const result = await db
    .prepare("SELECT * FROM events WHERE event_date < ? ORDER BY event_date DESC")
    .bind(today)
    .all<Event>();
  return result.results || [];
}

export async function getEventById(id: number): Promise<Event | null> {
  const db = await getDB();
  const result = await db
    .prepare("SELECT * FROM events WHERE id = ?")
    .bind(id)
    .first<Event>();
  return result || null;
}

export async function createEvent(data: {
  title: string;
  eventDate: string;
  startTime?: string | null;
  endTime?: string | null;
  location?: string | null;
  description?: string | null;
  url?: string | null;
}): Promise<Event> {
  const db = await getDB();
  const result = await db
    .prepare(
      `INSERT INTO events (title, description, event_date, start_time, end_time, location, url)
       VALUES (?, ?, ?, ?, ?, ?, ?)
       RETURNING *`
    )
    .bind(data.title, data.description || null, data.eventDate, data.startTime || null, data.endTime || null, data.location || null, data.url || null)
    .first<Event>();
  if (!result) {
    throw new Error("Failed to create event");
  }
  return result;
}

export async function updateEvent(id: number, data: {
  title: string;
  eventDate: string;
  startTime?: string | null;
  endTime?: string | null;
  location?: string | null;
  description?: string | null;
  url?: string | null;
}): Promise<Event> {
  const db = await getDB();
  const result = await db
    .prepare(
      `UPDATE events
       SET title = ?, description = ?, event_date = ?, start_time = ?, end_time = ?, location = ?, url = ?
       WHERE id = ?
       RETURNING *`
    )
    .bind(data.title, data.description || null, data.eventDate, data.startTime || null, data.endTime || null, data.location || null, data.url || null, id)
    .first<Event>();
  if (!result) {
    throw new Error("Failed to update event");
  }
  return result;
}

export async function deleteEvent(id: number): Promise<void> {
  const db = await getDB();
  await db
    .prepare("DELETE FROM events WHERE id = ?")
    .bind(id)
    .run();
}

export async function getNewsArticles(): Promise<NewsArticle[]> {
  const db = await getDB();
  const result = await db
    .prepare("SELECT * FROM news_articles ORDER BY published_at DESC, created_at DESC")
    .all<NewsArticle>();
  return result.results || [];
}

export async function getNewsArticleById(id: number): Promise<NewsArticle | null> {
  const db = await getDB();
  const result = await db
    .prepare("SELECT * FROM news_articles WHERE id = ?")
    .bind(id)
    .first<NewsArticle>();
  return result || null;
}

export async function createNewsArticle(data: {
  title: string;
  source: string;
  url: string;
  publishedAt: string;
  excerpt?: string | null;
}): Promise<NewsArticle> {
  const db = await getDB();
  const result = await db
    .prepare(
      `INSERT INTO news_articles (title, source, url, published_at, excerpt)
       VALUES (?, ?, ?, ?, ?)
       RETURNING *`
    )
    .bind(data.title, data.source, data.url, data.publishedAt, data.excerpt || null)
    .first<NewsArticle>();
  if (!result) {
    throw new Error("Failed to create news article");
  }
  return result;
}

export async function updateNewsArticle(id: number, data: {
  title: string;
  source: string;
  url: string;
  publishedAt: string;
  excerpt?: string | null;
}): Promise<NewsArticle> {
  const db = await getDB();
  const result = await db
    .prepare(
      `UPDATE news_articles
       SET title = ?, source = ?, url = ?, published_at = ?, excerpt = ?
       WHERE id = ?
       RETURNING *`
    )
    .bind(data.title, data.source, data.url, data.publishedAt, data.excerpt || null, id)
    .first<NewsArticle>();
  if (!result) {
    throw new Error("Failed to update news article");
  }
  return result;
}

export async function deleteNewsArticle(id: number): Promise<void> {
  const db = await getDB();
  await db
    .prepare("DELETE FROM news_articles WHERE id = ?")
    .bind(id)
    .run();
}
