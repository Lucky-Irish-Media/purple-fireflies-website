"use client";

import { useMemo } from "react";
import type { ParticipantChangeLog } from "@/app/lib/definitions";
import { DataTable } from "../../components/DataTable";
import { formatDateTime } from "../../lib/utils";
import { createColumnHelper, type ColumnDef } from "@tanstack/react-table";

const columnHelper = createColumnHelper<ParticipantChangeLog>();

const FIELD_LABELS: Record<string, string> = {
  name: "Name",
  email: "Email",
  phone: "Phone",
  address1: "Address Line 1",
  address2: "Address Line 2",
  city: "City",
  state: "State",
  zip_code: "ZIP Code",
  contact_method: "Contact Method",
  internal_notes: "Internal Notes",
};

function valueCell(value: string | null) {
  if (value === null || value === "") return <span className="text-text-secondary">—</span>;
  return <span className="text-text-secondary">{value}</span>;
}

export default function ChangeHistoryTable({ initialData }: { initialData: ParticipantChangeLog[] }) {
  const columns = useMemo(() => [
    columnHelper.accessor((row) => row.changed_at, {
      id: "changed_at",
      header: "Changed",
      cell: (info) => <span className="text-text-secondary">{formatDateTime(info.getValue())}</span>,
    }),
    columnHelper.display({
      id: "requester",
      header: "Requester",
      cell: (info) => {
        const r = info.row.original;
        return (
          <div className="space-y-0.5 max-w-[220px]">
            <div className="text-foreground font-medium text-sm">{r.participant_name}</div>
            <div className="text-text-secondary text-xs truncate">{r.participant_email}</div>
          </div>
        );
      },
    }),
    columnHelper.accessor((row) => row.field_name, {
      id: "field_name",
      header: "Field",
      cell: (info) => (
        <span className="text-foreground font-medium text-sm">
          {FIELD_LABELS[info.getValue()] || info.getValue()}
        </span>
      ),
    }),
    columnHelper.accessor((row) => row.old_value, {
      id: "old_value",
      header: "Old Value",
      cell: (info) => valueCell(info.getValue()),
    }),
    columnHelper.accessor((row) => row.new_value, {
      id: "new_value",
      header: "New Value",
      cell: (info) => valueCell(info.getValue()),
    }),
    columnHelper.accessor((row) => row.actor, {
      id: "actor",
      header: "Changed By",
      cell: (info) => {
        const r = info.row.original;
        return (
          <div className="space-y-0.5 max-w-[200px]">
            <div className="text-text-secondary text-xs">{info.getValue() || "unknown"}</div>
            {r.source && <div className="text-text-secondary/70 text-xs truncate">{r.source}</div>}
          </div>
        );
      },
    }),
  ] as const, []);

  const typedColumns = columns as unknown as ColumnDef<ParticipantChangeLog, unknown>[];

  return (
    <section className="space-y-6">
      <h2 className="text-xl font-bold text-foreground">Requester Info Changes</h2>
      <p className="text-sm text-text-secondary">
        Audit log of changes to meal delivery requestors' contact and address information, including the previous value, so mistyped addresses can be recovered.
      </p>
      <DataTable
        data={initialData}
        columns={typedColumns}
        enableSorting
        enableFiltering
        enablePagination
        enableGlobalFilter
        initialSorting={[{ id: "changed_at", desc: true }]}
        pageSize={25}
        storageKey="meal-signup-change-history-column-visibility"
      />
    </section>
  );
}