"use client";

import { useMemo } from "react";
import type { DeliverySignupOverview } from "@/app/lib/definitions";
import { DataTable } from "./components/DataTable";
import { formatDate, formatPhone, getDeliveryDayBadge, DeliveryDateFilter, deliveryDateFilterFn } from "./lib/utils";
import { createColumnHelper, type ColumnDef, filterFns } from "@tanstack/react-table";

interface Props {
  initialData: DeliverySignupOverview[];
}

const columnHelper = createColumnHelper<DeliverySignupOverview>();

function RecipientExpandableCell({ row }: { row: any }) {
  const overview = row.original as DeliverySignupOverview;
  if (overview.assigned_recipients.length === 0) {
    return (
      <button
        onClick={(e) => {
          e.stopPropagation();
          row.toggleExpanded();
        }}
        className="text-text-secondary text-sm"
      >
        No deliveries assigned
      </button>
    );
  }
  if (!row.getIsExpanded()) {
    return (
      <button
        onClick={(e) => {
          e.stopPropagation();
          row.toggleExpanded();
        }}
        className="text-text-secondary text-sm cursor-pointer"
      >
        {overview.assigned_recipients.length} recipient{overview.assigned_recipients.length > 1 ? "s" : ""}{" "}
        <span className="text-xs text-text-secondary/50">▶</span>
      </button>
    );
  }
  return (
    <div className="space-y-3">
      {overview.assigned_recipients.map((r) => (
        <div key={r.meal_signup_id} className="rounded-lg border border-primary/10 p-3 space-y-1">
          <div className="flex items-center justify-between gap-2">
            <span className="text-foreground font-medium">{r.recipient_name}</span>
            <span className="text-text-secondary text-xs">
              {r.regular_quantity > 0 ? `${r.regular_quantity} regular` : ""}
              {r.regular_quantity > 0 && r.vegan_quantity > 0 ? " · " : ""}
              {r.vegan_quantity > 0 ? `${r.vegan_quantity} vegan` : ""}
            </span>
          </div>
          <div className="text-text-secondary text-xs">{formatPhone(r.recipient_phone)}</div>
          <div className="text-text-secondary text-xs">{r.address}</div>
          {r.comments ? (
            <div className="text-text-secondary text-xs italic">“{r.comments}”</div>
          ) : null}
        </div>
      ))}
      <button
        onClick={(e) => {
          e.stopPropagation();
          row.toggleExpanded();
        }}
        className="text-xs text-text-secondary/50 cursor-pointer"
      >
        ▲ Collapse
      </button>
    </div>
  );
}

export default function DeliverySignupsTable({ initialData }: Props) {
  const columns = useMemo<ColumnDef<DeliverySignupOverview, any>[]>(
    () => [
      columnHelper.accessor((row) => row.driver_name, {
        id: "driver",
        header: "Driver",
        cell: (info) => <span className="text-foreground font-medium">{info.getValue()}</span>,
        filterFn: filterFns.includesString,
      }),
      columnHelper.accessor((row) => row.driver_phone, {
        id: "phone",
        header: "Phone",
        cell: (info) => <span className="text-text-secondary">{formatPhone(info.getValue())}</span>,
        filterFn: filterFns.includesString,
      }),
      columnHelper.accessor((row) => row.delivery_date, {
        id: "delivery",
        header: "Delivery",
        filterFn: deliveryDateFilterFn,
        meta: { filterComponent: DeliveryDateFilter },
        cell: (info) => {
          const r = info.row.original;
          return (
            <div className="space-y-0.5">
              <div className="text-text-secondary text-sm">{formatDate(r.delivery_date)}</div>
              <div className="text-xs">{getDeliveryDayBadge(r.delivery_day)}</div>
            </div>
          );
        },
      }),
      columnHelper.accessor((row) => row.assigned_count, {
        id: "assigned_count",
        header: "# Assigned",
        cell: (info) => <span className="text-foreground">{info.getValue()}</span>,
        filterFn: filterFns.equals,
      }),
      columnHelper.display({
        id: "recipients",
        header: "Recipients",
        enableColumnFilter: false,
        cell: (info) => <RecipientExpandableCell row={info.row} />,
      }),
      columnHelper.display({
        id: "actions",
        enableHiding: false,
        header: "",
        cell: (info) => (
          <button
            onClick={(e) => {
              e.stopPropagation();
              info.row.toggleExpanded();
            }}
            className="rounded-lg border border-primary/10 px-3 py-1.5 text-xs font-medium text-foreground hover:bg-primary/5 transition-colors"
          >
            {info.row.getIsExpanded() ? "Collapse" : "View Details"}
          </button>
        ),
      }),
    ],
    []
  );

  return (
    <DataTable
      data={initialData}
      columns={columns}
      enableSorting
      enableFiltering
      enablePagination
      enableExpanding
      enableColumnVisibility
      enableGlobalFilter
      enableColumnPinning
      enableColumnResizing
      enableFacetedFilters
      initialColumnPinning={{ left: ["driver"], right: ["actions"] }}
      initialSorting={[{ id: "delivery", desc: true }]}
      pageSize={15}
      storageKey="delivery-signups-column-visibility"
    />
  );
}
