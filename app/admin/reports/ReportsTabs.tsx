"use client";

import { useState, useActionState } from "react";
import { DataTable } from "@/app/admin/components/DataTable";
import type { ColumnDef } from "@tanstack/react-table";
import type {
  WeeklyAssignmentRow,
  UnassignedSignup,
  DriverLoadRow,
  MealTypeBreakdownRow,
  CoverageGapRow,
  VolunteerAvailabilityRow,
  DriverTotalAssignmentRow,
} from "@/app/lib/reports";
import { createColumnHelper } from "@tanstack/react-table";
import { sendAssignmentEmail } from "@/app/actions/send-assignment-email";
import { sendDriverLoadEmail } from "@/app/actions/send-driver-load-email";
import { formatDate, formatPhone, getMealTypeBadge, getMealTypeLabel, getSignalBadge } from "@/app/admin/lib/utils";

type TabKey =
  | "weekly"
  | "unassigned"
  | "driver-load"
  | "meal-breakdown"
  | "coverage-gaps"
  | "availability"
  | "total-assignments";

interface Tab {
  key: TabKey;
  label: string;
}

const tabs: Tab[] = [
  { key: "weekly", label: "Weekly Assignments" },
  { key: "unassigned", label: "Unassigned" },
  { key: "driver-load", label: "Driver Load" },
  { key: "meal-breakdown", label: "Meal Breakdown" },
  { key: "coverage-gaps", label: "Coverage Gaps" },
  { key: "availability", label: "Availability" },
  { key: "total-assignments", label: "Total Assignments" },
];

function EmailButton({ row }: { row: WeeklyAssignmentRow }) {
  const [state, formAction, isPending] = useActionState(sendAssignmentEmail, null);

  return (
    <form action={formAction}>
      <input type="hidden" name="signup_id" value={row.signup_id} />
      <input type="hidden" name="driver_id" value={row.driver_id} />
      <button
        type="submit"
        disabled={isPending || state?.success === true}
        className="rounded bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary hover:bg-primary/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isPending ? "Sending..." : state?.success ? "Sent" : "Send Email"}
      </button>
      {state && !state.success && (
        <p className="text-red-600 text-xs mt-1">{state.message}</p>
      )}
    </form>
  );
}

const wch = createColumnHelper<any>();
const weekCols = [
  wch.accessor("iso_week", { header: "Week", enableSorting: true }),
  wch.accessor("delivery_date", {
    header: "Delivery Date",
    enableSorting: true,
    cell: (info) => <span className="text-text-secondary">{formatDate(info.getValue())}</span>,
  }),
  wch.accessor("delivery_day", { header: "Day", enableSorting: true }),
  wch.accessor("driver_name", {
    header: "Driver",
    enableSorting: true,
    cell: (info) => <span className="text-foreground font-medium">{info.getValue()}</span>,
  }),
  wch.accessor("driver_phone", {
    header: "Driver Phone",
    cell: (info) => <span className="text-text-secondary">{formatPhone(info.getValue() || "")}</span>,
  }),
  wch.accessor("recipient_name", { header: "Recipient", enableSorting: true }),
  wch.accessor("_full_address", { id: "address", header: "Address", enableSorting: true }),
  wch.accessor("regular_quantity", {
    header: "Meal Type",
    cell: (info) => {
      const row = info.row.original;
      return getMealTypeBadge(getMealTypeLabel(row.regular_quantity, row.vegan_quantity));
    },
  }),
  wch.display({
    id: "send_email",
    header: "Send Email",
    enableSorting: false,
    cell: ({ row }) => <EmailButton row={row.original} />,
  }),
] as unknown as ColumnDef<any, unknown>[];

const unsch = createColumnHelper<any>();
const unsCols = [
  unsch.accessor("delivery_date", {
    header: "Delivery Date",
    enableSorting: true,
    cell: (info) => <span className="text-text-secondary">{formatDate(info.getValue())}</span>,
  }),
  unsch.accessor("delivery_day", { header: "Day" }),
  unsch.accessor("name", {
    header: "Name",
    enableSorting: true,
    cell: (info) => <span className="text-foreground font-medium">{info.getValue()}</span>,
  }),
  unsch.accessor("phone", {
    header: "Phone",
    cell: (info) => <span className="text-text-secondary">{formatPhone(info.getValue() || "")}</span>,
  }),
  unsch.accessor("_full_address", { id: "address", header: "Address", enableSorting: true }),
  unsch.accessor("regular_quantity", {
    header: "Meal Type",
    cell: (info) => {
      const row = info.row.original;
      return getMealTypeBadge(getMealTypeLabel(row.regular_quantity, row.vegan_quantity));
    },
  }),
] as unknown as ColumnDef<any, unknown>[];

function DriverLoadEmailButton({ row }: { row: DriverLoadRow }) {
  const [state, formAction, isPending] = useActionState(sendDriverLoadEmail, null);

  return (
    <form action={formAction}>
      <input type="hidden" name="driver_id" value={row.driver_id} />
      <input type="hidden" name="delivery_date" value={row.delivery_date} />
      <input type="hidden" name="delivery_day" value={row.delivery_day} />
      <button
        type="submit"
        disabled={isPending || state?.success === true}
        className="rounded bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary hover:bg-primary/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isPending ? "Sending..." : state?.success ? "Sent" : "Send Email"}
      </button>
      {state && !state.success && (
        <p className="text-red-600 text-xs mt-1">{state.message}</p>
      )}
    </form>
  );
}

const dlch = createColumnHelper<any>();
const dlCols = [
  dlch.accessor("delivery_date", {
    header: "Delivery Date",
    enableSorting: true,
    cell: (info) => <span className="text-text-secondary">{formatDate(info.getValue())}</span>,
  }),
  dlch.accessor("driver_name", {
    header: "Driver",
    enableSorting: true,
    cell: (info) => <span className="text-foreground font-medium">{info.getValue()}</span>,
  }),
  dlch.accessor("driver_phone", {
    header: "Phone",
    cell: (info) => <span className="text-text-secondary">{formatPhone(info.getValue() || "")}</span>,
  }),
  dlch.accessor("assignment_count", { header: "Assignments", enableSorting: true }),
  dlch.display({
    id: "send_email",
    header: "Send Email",
    enableSorting: false,
    cell: ({ row }) => <DriverLoadEmailButton row={row.original} />,
  }),
] as unknown as ColumnDef<any, unknown>[];

const mtch = createColumnHelper<any>();
const mtCols = [
  mtch.accessor("delivery_date", {
    header: "Delivery Date",
    enableSorting: true,
    cell: (info) => <span className="text-text-secondary">{formatDate(info.getValue())}</span>,
  }),
  mtch.accessor("regular_count", { header: "Regular", enableSorting: true }),
  mtch.accessor("vegan_count", { header: "Vegan", enableSorting: true }),
  mtch.accessor("total_count", { header: "Total", enableSorting: true }),
];

const cgch = createColumnHelper<any>();
const cgCols = [
  cgch.accessor("delivery_date", {
    header: "Delivery Date",
    enableSorting: true,
    cell: (info) => <span className="text-text-secondary">{formatDate(info.getValue())}</span>,
  }),
  cgch.accessor("delivery_day", { header: "Day" }),
  cgch.accessor("signup_count", { header: "Signups", enableSorting: true }),
  cgch.accessor("assigned_count", { header: "Assigned", enableSorting: true }),
  cgch.accessor("unassigned_count", { header: "Unassigned", enableSorting: true }),
  cgch.accessor("driver_count", { header: "Drivers", enableSorting: true }),
];

const dtach = createColumnHelper<any>();
const dtaCols = [
  dtach.accessor("driver_name", {
    header: "Driver",
    enableSorting: true,
    cell: (info) => <span className="text-foreground font-medium">{info.getValue()}</span>,
  }),
  dtach.accessor("driver_phone", {
    header: "Phone",
    cell: (info) => <span className="text-text-secondary">{formatPhone(info.getValue() || "")}</span>,
  }),
  dtach.accessor("assignment_count", { header: "Total Assignments", enableSorting: true }),
];

const vach = createColumnHelper<any>();
const vaCols = [
  vach.accessor("delivery_date", {
    header: "Delivery Date",
    enableSorting: true,
    cell: (info) => <span className="text-text-secondary">{formatDate(info.getValue())}</span>,
  }),
  vach.accessor("delivery_day", { header: "Day" }),
  vach.accessor("on_signal", {
    header: "Status",
    enableSorting: true,
    cell: (info) => getSignalBadge(info.getValue()),
  }),
  vach.accessor("count", { header: "Count", enableSorting: true }),
];

interface Props {
  weeklyAssignments: WeeklyAssignmentRow[];
  unassignedSignups: UnassignedSignup[];
  driverLoad: DriverLoadRow[];
  mealTypeBreakdown: MealTypeBreakdownRow[];
  coverageGaps: CoverageGapRow[];
  volunteerAvailability: VolunteerAvailabilityRow[];
  driverTotalAssignments: DriverTotalAssignmentRow[];
  weeks: string[];
}

export default function ReportsTabs({
  weeklyAssignments,
  unassignedSignups,
  driverLoad,
  mealTypeBreakdown,
  coverageGaps,
  volunteerAvailability,
  driverTotalAssignments,
  weeks,
}: Props) {
  const [activeTab, setActiveTab] = useState<TabKey>("weekly");

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Meal Delivery Reports</h1>

      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? "bg-primary text-white"
                : "bg-card border border-primary/10 text-text-secondary hover:bg-primary/5 hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Weekly Driver Assignments */}
      {activeTab === "weekly" && (
        <section className="space-y-4">
          <div>
            <h2 className="text-xl font-bold text-foreground">Weekly Driver Assignments</h2>
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
                  {week} ({week_start} – {week_end}) — {weekRows.length} assignment
                  {weekRows.length !== 1 ? "s" : ""}
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
      )}

      {/* Unassigned Signups */}
      {activeTab === "unassigned" && (
        <section className="space-y-4">
          <div>
            <h2 className="text-xl font-bold text-foreground">Unassigned Meal Requests</h2>
            <p className="text-sm text-text-secondary mt-1">
              Upcoming meal requests that still need a driver assigned.
            </p>
          </div>
          {unassignedSignups.length > 0 ? (
            <>
              <div className="inline-block rounded-lg bg-amber-50 border border-amber-200 px-4 py-2 text-sm text-amber-800">
                {unassignedSignups.length} unassigned signup
                {unassignedSignups.length !== 1 ? "s" : ""}
              </div>
              <DataTable data={unassignedSignups} columns={unsCols} pageSize={20} />
            </>
          ) : (
            <p className="text-green-600 text-sm font-medium">
              All upcoming meal requests have a driver assigned.
            </p>
          )}
        </section>
      )}

      {/* Driver Load */}
      {activeTab === "driver-load" && (
        <section className="space-y-4">
          <div>
            <h2 className="text-xl font-bold text-foreground">Driver Load</h2>
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
      )}

      {/* Meal Type Breakdown */}
      {activeTab === "meal-breakdown" && (
        <section className="space-y-4">
          <div>
            <h2 className="text-xl font-bold text-foreground">Meal Type Breakdown</h2>
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
      )}

      {/* Coverage Gaps */}
      {activeTab === "coverage-gaps" && (
        <section className="space-y-4">
          <div>
            <h2 className="text-xl font-bold text-foreground">Coverage Gaps</h2>
            <p className="text-sm text-text-secondary mt-1">
              Signup vs assignment counts by delivery date.
            </p>
          </div>
          {coverageGaps.length > 0 ? (
            <>
              {coverageGaps.filter((r) => r.unassigned_count > 0).length > 0 && (
                <div className="inline-block rounded-lg bg-red-50 border border-red-200 px-4 py-2 text-sm text-red-800">
                  {coverageGaps.filter((r) => r.unassigned_count > 0).length} date
                  {coverageGaps.filter((r) => r.unassigned_count > 0).length !== 1 ? "s" : ""} with gaps
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
      )}

      {/* Volunteer Availability */}
      {activeTab === "availability" && (
        <section className="space-y-4">
          <div>
            <h2 className="text-xl font-bold text-foreground">Volunteer Availability</h2>
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
      )}

      {/* Driver Total Assignments */}
      {activeTab === "total-assignments" && (
        <section className="space-y-4">
          <div>
            <h2 className="text-xl font-bold text-foreground">Driver Total Assignments</h2>
            <p className="text-sm text-text-secondary mt-1">
              All-time assignment count per driver.
            </p>
          </div>
          {driverTotalAssignments.length > 0 ? (
            <DataTable
              data={driverTotalAssignments}
              columns={dtaCols}
              pageSize={20}
              initialSorting={[{ id: "assignment_count", desc: true }]}
            />
          ) : (
            <p className="text-text-secondary italic">No assignment data available.</p>
          )}
        </section>
      )}
    </div>
  );
}
