"use client";

import { useActionState } from "react";
import { DataTable } from "@/app/admin/components/DataTable";
import { createColumnHelper } from "@tanstack/react-table";
import { sendAssignmentEmail } from "@/app/actions/send-assignment-email";
import type { WeeklyAssignmentRow } from "@/app/lib/reports";

const wch = createColumnHelper<any>();

const weekCols = [
  wch.accessor("iso_week", { header: "Week", enableSorting: true }),
  wch.accessor("delivery_date", { header: "Delivery Date", enableSorting: true }),
  wch.accessor("delivery_day", { header: "Day", enableSorting: true }),
  wch.accessor("driver_name", { header: "Driver", enableSorting: true }),
  wch.accessor("driver_phone", { header: "Driver Phone" }),
  wch.accessor("recipient_name", { header: "Recipient", enableSorting: true }),
  wch.accessor("recipient_address", { header: "Address" }),
  wch.accessor("recipient_city", { header: "City" }),
  wch.accessor("meal_type", { header: "Meal Type" }),
  wch.display({
    id: "send_email",
    header: "Send Email",
    enableSorting: false,
    cell: ({ row }) => <EmailButton row={row.original} />,
  }),
];

function EmailButton({ row }: { row: WeeklyAssignmentRow }) {
  const [state, formAction, isPending] = useActionState(sendAssignmentEmail, null);

  const address = `${row.recipient_address}, ${row.recipient_city}, ${row.recipient_state} ${row.recipient_zip}`;

  return (
    <form action={formAction}>
      <input type="hidden" name="driver_email" value={row.driver_email} />
      <input type="hidden" name="driver_name" value={row.driver_name} />
      <input type="hidden" name="recipient_name" value={row.recipient_name} />
      <input type="hidden" name="delivery_date" value={row.delivery_date} />
      <input type="hidden" name="delivery_day" value={row.delivery_day} />
      <input type="hidden" name="meal_type" value={row.meal_type} />
      <input type="hidden" name="address" value={address} />
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

export function WeeklyAssignmentsSection({
  weeklyAssignments,
}: {
  weeklyAssignments: WeeklyAssignmentRow[];
}) {
  const weeks = [...new Set(weeklyAssignments.map((r) => r.iso_week))].sort().reverse();

  return (
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
  );
}
