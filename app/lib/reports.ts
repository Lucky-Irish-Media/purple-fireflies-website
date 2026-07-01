import { getCloudflareContext } from "@opennextjs/cloudflare";

async function getDB(): Promise<D1Database> {
  const { env } = await getCloudflareContext({ async: true });
  return env.purple_fireflies_db;
}

export interface WeeklyAssignmentRow {
  iso_week: string;
  week_start: string;
  week_end: string;
  delivery_date: string;
  delivery_day: "wednesday" | "thursday";
  recipient_name: string;
  address1: string;
  address2: string | null;
  city: string;
  state: string;
  zip_code: string;
  meal_type: "regular" | "vegan";
  driver_name: string;
  driver_phone: string;
  driver_email: string;
  driver_id: number;
}

export async function getWeeklyAssignments(): Promise<WeeklyAssignmentRow[]> {
  const db = await getDB();
  const result = await db
    .prepare(
       `SELECT
         ms.name as recipient_name,
         ms.address1, ms.address2, ms.city, ms.state, ms.zip_code,
         ms.meal_type,
         ms.delivery_date, ms.delivery_day,
         dv.name as driver_name,
         dv.phone as driver_phone,
         dv.email as driver_email,
         dv.id as driver_id
       FROM delivery_assignments da
       JOIN meal_signups ms ON da.meal_signup_id = ms.id
       JOIN driver_volunteers dv ON da.driver_volunteer_id = dv.id
       WHERE ms.delivery_date >= date('now', '-90 days')
       ORDER BY ms.delivery_date DESC, dv.name ASC`
    )
    .all<Omit<WeeklyAssignmentRow, "iso_week" | "week_start" | "week_end">>();
  const rows = result.results || [];

  return rows.map((row) => {
    const date = new Date(row.delivery_date + "T00:00:00");
    const isoWeek = getISOWeek(date);
    const { start, end } = getWeekRange(date);
    return {
      ...row,
      iso_week: isoWeek,
      week_start: start,
      week_end: end,
      _full_address: `${row.address1}${row.address2 ? `, ${row.address2}` : ""}, ${row.city}, ${row.state} ${row.zip_code}`,
    };
  });
}

export interface UnassignedSignup {
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
  delivery_date: string;
  delivery_day: "wednesday" | "thursday";
  comments: string | null;
  created_at: string;
}

export async function getUnassignedSignups(): Promise<UnassignedSignup[]> {
  const db = await getDB();
  const result = await db
    .prepare(
      `SELECT ms.id, ms.name, ms.email, ms.phone, ms.address1, ms.address2, ms.city,
               ms.state, ms.zip_code, ms.meal_type, ms.delivery_date,
              ms.delivery_day, ms.comments, ms.created_at
       FROM meal_signups ms
       LEFT JOIN delivery_assignments da ON ms.id = da.meal_signup_id
       WHERE da.id IS NULL
         AND ms.delivery_date >= date('now')
       ORDER BY ms.delivery_date ASC, ms.name ASC`
    )
    .all<UnassignedSignup>();
  return (result.results || []).map((row) => ({
    ...row,
    _full_address: `${row.address1}${row.address2 ? `, ${row.address2}` : ""}, ${row.city}, ${row.state} ${row.zip_code}`,
  }));
}

export interface DriverLoadRow {
  driver_id: number;
  driver_name: string;
  driver_phone: string;
  driver_email: string;
  delivery_date: string;
  delivery_day: "wednesday" | "thursday";
  assignment_count: number;
}

export async function getDriverLoad(): Promise<DriverLoadRow[]> {
  const db = await getDB();
  const result = await db
    .prepare(
      `SELECT
         dv.id as driver_id,
         dv.name as driver_name,
         dv.phone as driver_phone,
         dv.email as driver_email,
         ms.delivery_date,
         ms.delivery_day,
         COUNT(da.id) as assignment_count
       FROM driver_volunteers dv
       LEFT JOIN delivery_assignments da ON dv.id = da.driver_volunteer_id
       LEFT JOIN meal_signups ms ON da.meal_signup_id = ms.id
       WHERE dv.delivery_date >= date('now', '-30 days')
       GROUP BY dv.id, ms.delivery_date
       ORDER BY ms.delivery_date DESC, assignment_count DESC`
    )
    .all<DriverLoadRow>();
  return result.results || [];
}

export interface MealTypeBreakdownRow {
  delivery_date: string;
  meal_type: "regular" | "vegan";
  count: number;
}

export async function getMealTypeBreakdown(): Promise<MealTypeBreakdownRow[]> {
  const db = await getDB();
  const result = await db
    .prepare(
      `SELECT delivery_date, meal_type, COUNT(*) as count
       FROM meal_signups
       WHERE delivery_date >= date('now', '-60 days')
       GROUP BY delivery_date, meal_type
       ORDER BY delivery_date DESC, meal_type ASC`
    )
    .all<MealTypeBreakdownRow>();
  return result.results || [];
}

export interface CoverageGapRow {
  delivery_date: string;
  delivery_day: "wednesday" | "thursday";
  signup_count: number;
  assigned_count: number;
  driver_count: number;
  unassigned_count: number;
}

export async function getCoverageGaps(): Promise<CoverageGapRow[]> {
  const db = await getDB();
  const result = await db
    .prepare(
      `SELECT
         ms.delivery_date,
         ms.delivery_day,
         COUNT(DISTINCT ms.id) as signup_count,
         COUNT(DISTINCT da.id) as assigned_count,
         COUNT(DISTINCT da.driver_volunteer_id) as driver_count,
         SUM(CASE WHEN da.id IS NULL THEN 1 ELSE 0 END) as unassigned_count
       FROM meal_signups ms
       LEFT JOIN delivery_assignments da ON ms.id = da.meal_signup_id
       WHERE ms.delivery_date >= date('now')
       GROUP BY ms.delivery_date
       ORDER BY ms.delivery_date ASC`
    )
    .all<CoverageGapRow>();
  return result.results || [];
}

export interface VolunteerAvailabilityRow {
  on_signal: "yes" | "no" | "willing";
  delivery_day: "wednesday" | "thursday";
  delivery_date: string;
  count: number;
}

export async function getVolunteerAvailability(): Promise<VolunteerAvailabilityRow[]> {
  const db = await getDB();
  const result = await db
    .prepare(
      `SELECT on_signal, delivery_day, delivery_date, COUNT(*) as count
       FROM driver_volunteers
       WHERE delivery_date >= date('now', '-30 days')
       GROUP BY on_signal, delivery_day, delivery_date
       ORDER BY delivery_date ASC, on_signal ASC`
    )
    .all<VolunteerAvailabilityRow>();
  return result.results || [];
}

export interface DriverTotalAssignmentRow {
  driver_name: string;
  driver_phone: string;
  assignment_count: number;
}

export async function getDriverTotalAssignments(): Promise<DriverTotalAssignmentRow[]> {
  const db = await getDB();
  const result = await db
    .prepare(
      `SELECT
         dv.name as driver_name,
         dv.phone as driver_phone,
         COUNT(da.id) as assignment_count
       FROM driver_volunteers dv
       LEFT JOIN delivery_assignments da ON dv.id = da.driver_volunteer_id
       GROUP BY dv.name, dv.phone
       ORDER BY assignment_count DESC, dv.name ASC`
    )
    .all<DriverTotalAssignmentRow>();
  return result.results || [];
}

export interface DashboardSummary {
  unassigned_count: number;
  upcoming_delivery_dates: number;
  total_meal_signups_30d: number;
  total_drivers_30d: number;
  upcoming_date: string | null;
  upcoming_signup_count: number | null;
  upcoming_assigned_count: number | null;
  next_wednesday_drivers: number;
  next_thursday_drivers: number;
  total_meals_delivered: number;
}

export async function getDashboardSummary(): Promise<DashboardSummary> {
  const db = await getDB();
  const [unassigned, totals, nextDate, wedDrivers, thuDrivers, totalDelivered] = await Promise.all([
    db
      .prepare(
        `SELECT COUNT(*) as count FROM meal_signups ms
         LEFT JOIN delivery_assignments da ON ms.id = da.meal_signup_id
         WHERE da.id IS NULL AND ms.delivery_date >= date('now')`
      )
      .first<{ count: number }>(),
    db
      .prepare(
        `SELECT
           (SELECT COUNT(*) FROM meal_signups WHERE delivery_date >= date('now', '-30 days')) as signups,
           (SELECT COUNT(*) FROM driver_volunteers WHERE delivery_date >= date('now', '-30 days')) as drivers`
      )
      .first<{ signups: number; drivers: number }>(),
    db
      .prepare(
        `SELECT delivery_date,
                COUNT(*) as signup_count,
                SUM(CASE WHEN da.id IS NOT NULL THEN 1 ELSE 0 END) as assigned_count
         FROM meal_signups ms
         LEFT JOIN delivery_assignments da ON ms.id = da.meal_signup_id
         WHERE ms.delivery_date >= date('now')
         GROUP BY ms.delivery_date
         ORDER BY ms.delivery_date ASC
         LIMIT 1`
      )
      .first<{ delivery_date: string; signup_count: number; assigned_count: number }>(),
    db
      .prepare(
        `SELECT delivery_date, COUNT(*) as count
         FROM driver_volunteers
         WHERE delivery_date >= date('now') AND delivery_day = 'wednesday'
         GROUP BY delivery_date ORDER BY delivery_date ASC LIMIT 1`
      )
      .first<{ delivery_date: string; count: number }>(),
    db
      .prepare(
        `SELECT delivery_date, COUNT(*) as count
         FROM driver_volunteers
         WHERE delivery_date >= date('now') AND delivery_day = 'thursday'
         GROUP BY delivery_date ORDER BY delivery_date ASC LIMIT 1`
      )
      .first<{ delivery_date: string; count: number }>(),
    db
      .prepare(
        `SELECT COUNT(*) as count
         FROM delivery_assignments da
         JOIN meal_signups ms ON da.meal_signup_id = ms.id
         WHERE ms.delivery_date < date('now')`
      )
      .first<{ count: number }>(),
  ]);

  return {
    unassigned_count: unassigned?.count ?? 0,
    upcoming_delivery_dates: 0,
    total_meal_signups_30d: totals?.signups ?? 0,
    total_drivers_30d: totals?.drivers ?? 0,
    upcoming_date: nextDate?.delivery_date ?? null,
    upcoming_signup_count: nextDate?.signup_count ?? null,
    upcoming_assigned_count: nextDate?.assigned_count ?? null,
    next_wednesday_drivers: wedDrivers?.count ?? 0,
    next_thursday_drivers: thuDrivers?.count ?? 0,
    total_meals_delivered: totalDelivered?.count ?? 0,
  };
}

function getISOWeek(date: Date): string {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
  const week = Math.ceil(
    ((d.getTime() - new Date(d.getFullYear(), 0, 4).getTime()) / 86400000 + 1) / 7
  );
  return `${d.getFullYear()}-W${String(week).padStart(2, "0")}`;
}

function getWeekRange(date: Date): { start: string; end: string } {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? 6 : day - 1;
  d.setDate(d.getDate() - diff);
  const start = d.toISOString().split("T")[0];
  d.setDate(d.getDate() + 6);
  const end = d.toISOString().split("T")[0];
  return { start, end };
}
