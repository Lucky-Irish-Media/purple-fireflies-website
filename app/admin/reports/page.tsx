import { DataTable } from "@/app/admin/components/DataTable";
import type { ColumnDef } from "@tanstack/react-table";
import {
  getWeeklyAssignments,
  getUnassignedSignups,
  getDriverLoad,
  getMealTypeBreakdown,
  getCoverageGaps,
  getVolunteerAvailability,
} from "@/app/lib/reports";
import { createColumnHelper } from "@tanstack/react-table";

const wch = createColumnHelper<any>();
const weekCols = [
  wch.accessor("iso_week", { header: "Week", enableSorting: true }),
  wch.accessor("delivery_date", { header: "Delivery Date", enableSorting: true }),
  wch.accessor("delivery_day", { header: "Day", enableSorting: true }),
  wch.accessor("driver_name", { header: "Driver", enableSorting: true }),
  wch.accessor("driver_phone", { header: "Driver Phone" }),
  wch.accessor("recipient_name", { header: "Recipient", enableSorting: true }),
  wch.accessor(
    (row) =>
      `${row.address1}${row.address2 ? `, ${row.address2}` : ""}, ${row.city}, ${row.state} ${row.zip_code}`,
    {
      id: "address",
      header: "Address",
      enableSorting: true,
    },
  ),
  wch.accessor("meal_type", { header: "Meal Type" }),
] as unknown as ColumnDef<any, unknown>[];

const unsch = createColumnHelper<any>();
const unsCols = [
  unsch.accessor("delivery_date", { header: "Delivery Date", enableSorting: true }),
  unsch.accessor("delivery_day", { header: "Day" }),
  unsch.accessor("name", { header: "Name", enableSorting: true }),
  unsch.accessor("phone", { header: "Phone" }),
  unsch.accessor(
    (row) =>
      `${row.address1}${row.address2 ? `, ${row.address2}` : ""}, ${row.city}, ${row.state} ${row.zip_code}`,
    {
      id: "address",
      header: "Address",
      enableSorting: true,
    },
  ),
  unsch.accessor("meal_type", { header: "Meal Type" }),
] as unknown as ColumnDef<any, unknown>[];

const dlch = createColumnHelper<any>();
const dlCols = [
  dlch.accessor("delivery_date", { header: "Delivery Date", enableSorting: true }),
  dlch.accessor("driver_name", { header: "Driver", enableSorting: true }),
  dlch.accessor("driver_phone", { header: "Phone" }),
  dlch.accessor("assignment_count", { header: "Assignments", enableSorting: true }),
];

const mtch = createColumnHelper<any>();
const mtCols = [
  mtch.accessor("delivery_date", { header: "Delivery Date", enableSorting: true }),
  mtch.accessor("meal_type", { header: "Meal Type" }),
  mtch.accessor("count", { header: "Count", enableSorting: true }),
];

const cgch = createColumnHelper<any>();
const cgCols = [
  cgch.accessor("delivery_date", { header: "Delivery Date", enableSorting: true }),
  cgch.accessor("delivery_day", { header: "Day" }),
  cgch.accessor("signup_count", { header: "Signups", enableSorting: true }),
  cgch.accessor("assigned_count", { header: "Assigned", enableSorting: true }),
  cgch.accessor("unassigned_count", { header: "Unassigned", enableSorting: true }),
  cgch.accessor("driver_count", { header: "Drivers", enableSorting: true }),
];

const vach = createColumnHelper<any>();
const vaCols = [
  vach.accessor("delivery_date", { header: "Delivery Date", enableSorting: true }),
  vach.accessor("delivery_day", { header: "Day" }),
  vach.accessor("on_signal", { header: "Status", enableSorting: true }),
  vach.accessor("count", { header: "Count", enableSorting: true }),
];

export default async function AdminReportsPage() {
  const [
    weeklyAssignments,
    unassignedSignups,
    driverLoad,
    mealTypeBreakdown,
    coverageGaps,
    volunteerAvailability,
  ] = await Promise.all([
    getWeeklyAssignments(),
    getUnassignedSignups(),
    getDriverLoad(),
    getMealTypeBreakdown(),
    getCoverageGaps(),
    getVolunteerAvailability(),
  ]);

  const weeks = [...new Set(weeklyAssignments.map((r) => r.iso_week))].sort().reverse();

  return (
    <div className="space-y-12">
      <h1 className="text-2xl font-bold text-foreground">Meal Delivery Reports</h1>

      {/* Weekly Assignment Report */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Weekly Driver Assignments</h2>
          <p className="text-sm text-text-secondary mt-1">
            All driver-to-meal assignments grouped by ISO week.
          </p>
        </div>
        {weeks.map((week) => {
          const weekRows = weeklyAssignments.filter((r) => r.iso_week === week);
          const { week_start, week_end } = weekRows[0];
          return (
            <details key={week} className="border border-primary/10 rounded-lg" open>
              <summary className="px-4 py-3 bg-card cursor-pointer font-semibold text-foreground hover:bg-primary/5 rounded-lg">
                {week} ({week_start} – {week_end}) — {weekRows.length} assignment{weekRows.length !== 1 ? "s" : ""}
              </summary>
              <div className="p-4">
                <DataTable
                  data={weekRows}
                  columns={weekCols}
                  enableFiltering={false}
                  pageSize={50}
                />
              </div>
            </details>
          );
        })}
        {weeklyAssignments.length === 0 && (
          <p className="text-text-secondary italic">No assignments found in the last 90 days.</p>
        )}
      </section>

      {/* Unassigned Signups */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Unassigned Meal Requests</h2>
          <p className="text-sm text-text-secondary mt-1">
            Upcoming meal requests that still need a driver assigned.
          </p>
        </div>
        {unassignedSignups.length > 0 ? (
          <>
            <div className="inline-block rounded-lg bg-amber-50 border border-amber-200 px-4 py-2 text-sm text-amber-800">
              {unassignedSignups.length} unassigned signup{unassignedSignups.length !== 1 ? "s" : ""}
            </div>
            <DataTable
              data={unassignedSignups}
              columns={unsCols}
              pageSize={20}
            />
          </>
        ) : (
          <p className="text-green-600 text-sm font-medium">All upcoming meal requests have a driver assigned.</p>
        )}
      </section>

      {/* Driver Load */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Driver Load</h2>
          <p className="text-sm text-text-secondary mt-1">
            Number of assignments per driver per delivery date.
          </p>
        </div>
        {driverLoad.length > 0 ? (
          <DataTable
            data={driverLoad}
            columns={dlCols}
            pageSize={20}
            initialSorting={[{ id: "delivery_date", desc: true }]}
          />
        ) : (
          <p className="text-text-secondary italic">No driver load data available.</p>
        )}
      </section>

      {/* Meal Type Breakdown */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Meal Type Breakdown</h2>
          <p className="text-sm text-text-secondary mt-1">
            Regular vs vegan meal counts by delivery date.
          </p>
        </div>
        {mealTypeBreakdown.length > 0 ? (
          <DataTable
            data={mealTypeBreakdown}
            columns={mtCols}
            pageSize={20}
            initialSorting={[{ id: "delivery_date", desc: true }]}
          />
        ) : (
          <p className="text-text-secondary italic">No meal data available.</p>
        )}
      </section>

      {/* Coverage Gaps */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Coverage Gaps</h2>
          <p className="text-sm text-text-secondary mt-1">
            Signup vs assignment counts by delivery date.
          </p>
        </div>
        {coverageGaps.length > 0 ? (
          <>
            {coverageGaps.filter((r) => r.unassigned_count > 0).length > 0 && (
              <div className="inline-block rounded-lg bg-red-50 border border-red-200 px-4 py-2 text-sm text-red-800">
                {coverageGaps.filter((r) => r.unassigned_count > 0).length} date{coverageGaps.filter((r) => r.unassigned_count > 0).length !== 1 ? "s" : ""} with gaps
              </div>
            )}
            <DataTable
              data={coverageGaps}
              columns={cgCols}
              pageSize={20}
              initialSorting={[{ id: "delivery_date", desc: false }]}
            />
          </>
        ) : (
          <p className="text-text-secondary italic">No upcoming delivery dates.</p>
        )}
      </section>

      {/* Volunteer Availability */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Volunteer Availability</h2>
          <p className="text-sm text-text-secondary mt-1">
            Driver availability by status (On Signal / Willing / Not Available) and delivery date.
          </p>
        </div>
        {volunteerAvailability.length > 0 ? (
          <DataTable
            data={volunteerAvailability}
            columns={vaCols}
            pageSize={20}
            initialSorting={[{ id: "delivery_date", desc: false }]}
          />
        ) : (
          <p className="text-text-secondary italic">No volunteer availability data available.</p>
        )}
      </section>
    </div>
  );
}
