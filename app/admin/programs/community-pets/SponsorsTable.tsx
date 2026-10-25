"use client";

import { useMemo } from "react";
import {
  createColumnHelper,
  filterFns,
  type Column,
  type ColumnDef,
  type Table,
} from "@tanstack/react-table";
import type {
  AnimalSponsorshipWithAnimal,
  SponsorshipStatus,
} from "@/app/lib/definitions";
import { DataTable } from "../../components/DataTable";
import {
  formatCents,
  formatDateTime,
  getSponsorshipStatusBadge,
} from "../../lib/utils";

const columnHelper = createColumnHelper<AnimalSponsorshipWithAnimal>();

const STATUS_OPTIONS: { value: SponsorshipStatus; label: string }[] = [
  { value: "succeeded", label: "Succeeded" },
  { value: "refunded", label: "Refunded" },
  { value: "failed", label: "Failed" },
];

function donorLabel(sponsorship: AnimalSponsorshipWithAnimal): string {
  const name = [sponsorship.donor_first_name, sponsorship.donor_last_name]
    .filter(Boolean)
    .join(" ");
  return name || sponsorship.display_name || "Anonymous";
}

function animalLabel(sponsorship: AnimalSponsorshipWithAnimal): string {
  return sponsorship.animal_name ?? "Unlinked";
}

function AnimalFilter({
  column,
  table,
}: {
  column: Column<AnimalSponsorshipWithAnimal, unknown>;
  table: Table<AnimalSponsorshipWithAnimal>;
}) {
  const value = (column.getFilterValue() as string | undefined) ?? "";
  const options = Array.from(
    new Set(table.options.data.map((row) => animalLabel(row))),
  ).sort((a, b) => a.localeCompare(b));

  return (
    <select
      value={value}
      onChange={(e) => {
        e.stopPropagation();
        column.setFilterValue(e.target.value || undefined);
      }}
      onClick={(e) => e.stopPropagation()}
      className="w-full rounded border border-primary/10 bg-background px-2 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
    >
      <option value="">All</option>
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  );
}

function StatusFilter({
  column,
}: {
  column: Column<AnimalSponsorshipWithAnimal, unknown>;
}) {
  const value = (column.getFilterValue() as string | undefined) ?? "";
  return (
    <select
      value={value}
      onChange={(e) => {
        e.stopPropagation();
        column.setFilterValue(e.target.value || undefined);
      }}
      onClick={(e) => e.stopPropagation()}
      className="w-full rounded border border-primary/10 bg-background px-2 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
    >
      <option value="">All</option>
      {STATUS_OPTIONS.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

const columns = [
  columnHelper.accessor((row) => row.occurred_at ?? row.created_at, {
    id: "date",
    header: "Date",
    enableColumnFilter: false,
    cell: (info) => (
      <span className="text-text-secondary">{formatDateTime(info.getValue())}</span>
    ),
  }),
  columnHelper.accessor((row) => animalLabel(row), {
    id: "animal",
    header: "Animal",
    filterFn: filterFns.equals,
    meta: { filterComponent: AnimalFilter },
    cell: (info) => {
      const sponsorship = info.row.original;
      return (
        <div className="space-y-0.5">
          <div className="text-foreground font-medium">{info.getValue()}</div>
          {sponsorship.animal_slug ? (
            <div className="text-text-secondary text-xs">
              {sponsorship.animal_slug}
            </div>
          ) : null}
        </div>
      );
    },
  }),
  columnHelper.accessor((row) => donorLabel(row), {
    id: "donor",
    header: "Donor",
    filterFn: filterFns.includesString,
    cell: (info) => (
      <span className="text-foreground font-medium">{info.getValue()}</span>
    ),
  }),
  columnHelper.accessor((row) => row.donor_email ?? "", {
    id: "donor_email",
    header: "Donor Email",
    filterFn: filterFns.includesString,
    cell: (info) => (
      <span className="text-text-secondary">{info.getValue() || "-"}</span>
    ),
  }),
  columnHelper.accessor((row) => row.amount_cents, {
    id: "amount",
    header: "Amount",
    enableColumnFilter: false,
    cell: (info) => (
      <span className="text-text-secondary">{formatCents(info.getValue())}</span>
    ),
  }),
  columnHelper.accessor((row) => row.is_recurring, {
    id: "recurring",
    header: "Recurring",
    enableColumnFilter: false,
    cell: (info) => (
      <span className="text-text-secondary">
        {info.getValue() ? "Monthly" : "One-time"}
      </span>
    ),
  }),
  columnHelper.accessor((row) => row.status, {
    id: "status",
    header: "Status",
    filterFn: filterFns.equals,
    meta: { filterComponent: StatusFilter },
    cell: (info) => getSponsorshipStatusBadge(info.getValue()),
  }),
] as const;

const typedColumns = columns as unknown as ColumnDef<
  AnimalSponsorshipWithAnimal,
  unknown
>[];

export function SponsorsTable({
  sponsorships,
}: {
  sponsorships: AnimalSponsorshipWithAnimal[];
}) {
  const data = useMemo(() => sponsorships, [sponsorships]);

  const totals = useMemo(() => {
    let raisedCents = 0;
    let refundedCents = 0;
    for (const sponsorship of data) {
      if (sponsorship.status === "succeeded") {
        raisedCents += sponsorship.amount_cents;
      } else if (sponsorship.status === "refunded") {
        refundedCents += sponsorship.amount_cents;
      }
    }
    return { raisedCents, refundedCents, count: data.length };
  }, [data]);

  if (data.length === 0) {
    return (
      <section className="space-y-6">
        <div>
          <h2 className="text-xl font-bold text-foreground">Sponsors</h2>
          <p className="mt-1 text-sm text-text-secondary">
            No sponsorships recorded yet
          </p>
        </div>
        <div className="rounded-lg border border-primary/10 bg-card p-6">
          <p className="text-sm font-medium text-foreground">
            Donor transactions appear here once Givebutter capture ships.
          </p>
          <p className="mt-2 text-sm text-text-secondary">
            Until then, sponsors are recorded in the Givebutter dashboard. This
            tab reads the local ledger only, so it stays empty instead of showing
            numbers it cannot verify.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground">Sponsors</h2>
        <p className="mt-1 text-sm text-text-secondary">
          {totals.count} gift{totals.count === 1 ? "" : "s"} recorded
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="rounded-lg border border-primary/10 bg-card p-4">
          <div className="text-xs font-medium uppercase tracking-wider text-text-secondary">
            Total raised
          </div>
          <div className="mt-1 text-xl font-bold text-foreground">
            {formatCents(totals.raisedCents)}
          </div>
          <div className="mt-1 text-xs text-text-secondary">
            Succeeded gifts only
          </div>
        </div>
        <div className="rounded-lg border border-primary/10 bg-card p-4">
          <div className="text-xs font-medium uppercase tracking-wider text-text-secondary">
            Refunded
          </div>
          <div className="mt-1 text-xl font-bold text-foreground">
            {formatCents(totals.refundedCents)}
          </div>
          <div className="mt-1 text-xs text-text-secondary">
            Excluded from total raised
          </div>
        </div>
        <div className="rounded-lg border border-primary/10 bg-card p-4">
          <div className="text-xs font-medium uppercase tracking-wider text-text-secondary">
            Gifts
          </div>
          <div className="mt-1 text-xl font-bold text-foreground">
            {totals.count}
          </div>
          <div className="mt-1 text-xs text-text-secondary">
            All transactions, refunds included
          </div>
        </div>
      </div>

      <DataTable
        data={data}
        columns={typedColumns}
        enableSorting
        enableFiltering
        enablePagination
        enableGlobalFilter
        enableColumnPinning
        initialColumnPinning={{ left: ["animal"] }}
        initialSorting={[{ id: "date", desc: true }]}
        pageSize={25}
      />
    </section>
  );
}
