"use client";

import { useState, useTransition, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { DataTable } from "../../components/DataTable";
import { formatDate, getDeliveryDayBadge, getDeliveryDateStatusBadge } from "../../lib/utils";
import { createColumnHelper, type ColumnDef } from "@tanstack/react-table";
import { setDeliveryDateClosedAction } from "@/app/actions/admin-delivery-dates";
import { getMealsCapForDay } from "@/app/lib/delivery-day";
import type { DeliveryDay } from "@/app/lib/delivery-day";


export interface DeliveryDayOverview {
  delivery_date: string;
  delivery_day: DeliveryDay;
  count: number;
  closed: boolean;
}

const columnHelper = createColumnHelper<DeliveryDayOverview>();

export function DeliveryDaysTable({ initialData }: { initialData: DeliveryDayOverview[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  const handleToggle = useCallback((day: DeliveryDayOverview) => {
    const formData = new FormData();
    formData.set("deliveryDate", day.delivery_date);
    formData.set("closed", String(!day.closed));
    startTransition(async () => {
      const result = await setDeliveryDateClosedAction(formData);
      setMessage(result.message);
      if (result.success) router.refresh();
    });
  }, [router]);

  const columns = useMemo<ColumnDef<DeliveryDayOverview, any>[]>(() => [
    columnHelper.accessor("delivery_date", {
      header: "Date",
      cell: (info) => <span className="text-text-secondary">{formatDate(info.getValue())}</span>,
    }),
    columnHelper.accessor("delivery_day", {
      header: "Day",
      cell: (info) => getDeliveryDayBadge(info.getValue()),
    }),
    columnHelper.display({
      id: "meals",
      header: "Meals Signed Up",
      cell: (info) => {
        const row = info.row.original;
        return (
          <span className={`text-sm ${row.closed ? "text-text-secondary" : "text-foreground font-medium"}`}>
            {row.count} / {getMealsCapForDay(row.delivery_day)}
          </span>
        );
      },
    }),
    columnHelper.display({
      id: "status",
      header: "Status",
      cell: (info) => getDeliveryDateStatusBadge(info.row.original.closed),
    }),
    columnHelper.display({
      id: "actions",
      header: "Actions",
      enableHiding: false,
      cell: (info) => {
        const row = info.row.original;
        return (
          <button
            onClick={() => handleToggle(row)}
            disabled={isPending}
            className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-50 ${
              row.closed
                ? "border-green-500/30 text-green-600 hover:bg-green-500/5"
                : "border-red-500/30 text-red-600 hover:bg-red-500/5"
            }`}
          >
            {row.closed ? "Reopen" : "Close Day"}
          </button>
        );
      },
    }),
  ], [isPending, handleToggle]);

  return (
    <section>
      <h2 className="text-xl font-bold text-foreground mb-4">Delivery Days</h2>
      {message && (
        <div className="mb-4 rounded-lg bg-blue-50 p-3 text-sm text-blue-700" role="alert">
          {message}
        </div>
      )}
      <p className="mb-4 text-sm text-text-secondary">
        Closing a day routes new signups to the waitlist, even if the meal cap hasn&apos;t been reached yet.
      </p>
      <DataTable
        columns={columns}
        data={initialData}
        enableFiltering={false}
        enablePagination={false}
        enableGlobalFilter={false}
        initialSorting={[{ id: "delivery_date", desc: false }]}
      />
    </section>
  );
}
