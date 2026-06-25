"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { MealSignupWithAssignmentDb } from "@/app/lib/db";
import type { DriverVolunteer } from "@/app/lib/definitions";
import { assignDriverAction } from "@/app/actions/assignments";
import { DataTable } from "./components/DataTable";
import { createColumnHelper, type ColumnDef, filterFns } from "@tanstack/react-table";

function formatDate(isoDate: string): string {
  const [year, month, day] = isoDate.split("-");
  return `${month}/${day}/${year}`;
}

function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  if (digits.length === 11 && digits.startsWith("1")) {
    return `(${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
  }
  return phone;
}

function getMealTypeBadge(mealType: string) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        mealType === "vegan"
          ? "bg-green-100 text-green-800"
          : "bg-blue-100 text-blue-800"
      }`}
    >
      {mealType}
    </span>
  );
}

function getContactMethodBadge(method: string) {
  return (
    <span className="capitalize text-text-secondary">{method}</span>
  );
}

function getDeliveryDayBadge(day: string) {
  return (
    <span className="capitalize text-text-secondary">{day}</span>
  );
}

function todayLocal(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function MealTypeFilter({ column }: { column: any }) {
  const value = column.getFilterValue() as string | undefined;
  return (
    <select
      value={value || ""}
      onChange={(e) => {
        e.stopPropagation();
        column.setFilterValue(e.target.value || undefined);
      }}
      className="w-full rounded border border-primary/10 bg-background px-2 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
    >
      <option value="">All Meal Types</option>
      <option value="regular">Regular</option>
      <option value="vegan">Vegan</option>
    </select>
  );
}

function ContactMethodFilter({ column }: { column: any }) {
  const value = column.getFilterValue() as string | undefined;
  return (
    <select
      value={value || ""}
      onChange={(e) => {
        e.stopPropagation();
        column.setFilterValue(e.target.value || undefined);
      }}
      className="w-full rounded border border-primary/10 bg-background px-2 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
    >
      <option value="">All Methods</option>
      <option value="call">Call</option>
      <option value="text">Text</option>
      <option value="email">Email</option>
    </select>
  );
}

function DeliveryDateFilter({ column }: { column: any }) {
  const value = column.getFilterValue() as string | undefined;
  const today = todayLocal();
  return (
    <select
      value={value || ""}
      onChange={(e) => {
        e.stopPropagation();
        column.setFilterValue(e.target.value || undefined);
      }}
      className="w-full rounded border border-primary/10 bg-background px-2 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
    >
      <option value="">All Dates</option>
      <option value="future">Future Dates Only</option>
      <option value="past">Past Dates Only</option>
      <option value="today">Today</option>
    </select>
  );
}

function deliveryDateFilterFn(row: any, columnId: string, value: string): boolean {
  const date = row.getValue(columnId);
  const today = todayLocal();
  switch (value) {
    case "future":
      return date >= today;
    case "past":
      return date < today;
    case "today":
      return date === today;
    default:
      return true;
  }
}

const columnHelper = createColumnHelper<MealSignupWithAssignmentDb>();

function DriverSelectCell({ row, drivers, isPending, onAssign }: {
  row: { original: MealSignupWithAssignmentDb };
  drivers: DriverVolunteer[];
  isPending: boolean;
  onAssign: (mealSignupId: number, driverVolunteerId: string) => void;
}) {
  const signup = row.original;
  const availableDrivers = useMemo(
    () => drivers.filter((d) => d.delivery_date === signup.delivery_date),
    [drivers, signup.delivery_date]
  );

  return (
    <div>
      <select
        value={signup.driver_id ? String(signup.driver_id) : "0"}
        onChange={(e) => onAssign(signup.id, e.target.value)}
        disabled={isPending}
        className="text-sm border border-primary/20 rounded px-2 py-1 bg-background text-foreground max-w-[140px]"
      >
        <option value="0">—</option>
        {availableDrivers.map((d) => (
          <option key={d.id} value={d.id}>
            {d.name}
          </option>
        ))}
      </select>
      {signup.driver_name && (
        <span className="ml-1 text-xs text-text-secondary block truncate max-w-[140px]">
          {formatPhone(signup.driver_phone || "")}
        </span>
      )}
    </div>
  );
}

export default function MealSignupsTable({
  initialData,
  drivers,
}: {
  initialData: MealSignupWithAssignmentDb[];
  drivers: DriverVolunteer[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleAssignment(mealSignupId: number, driverVolunteerId: string) {
    const formData = new FormData();
    formData.set("mealSignupId", String(mealSignupId));
    formData.set("driverVolunteerId", driverVolunteerId);
    startTransition(async () => {
      await assignDriverAction(formData);
      router.refresh();
    });
  }

  const columns = useMemo(() => [
    columnHelper.accessor((row) => row.name, {
      id: "name",
      header: "Name",
      cell: (info) => <span className="text-foreground">{info.getValue()}</span>,
      filterFn: filterFns.includesString,
    }),
    columnHelper.accessor((row) => row.email, {
      id: "email",
      header: "Email",
      cell: (info) => <span className="text-text-secondary">{info.getValue()}</span>,
      filterFn: filterFns.includesString,
    }),
    columnHelper.accessor((row) => row.phone, {
      id: "phone",
      header: "Phone",
      cell: (info) => <span className="text-text-secondary">{formatPhone(info.getValue())}</span>,
      filterFn: filterFns.includesString,
    }),
    columnHelper.accessor((row) => row.address1, {
      id: "address1",
      header: "Address",
      cell: (info) => {
        const row = info.row.original;
        return (
          <span className="text-text-secondary max-w-xs truncate block">
            {row.address1}
            {row.address2 && `, ${row.address2}`}
            {`, ${row.city}, ${row.state} ${row.zip_code}`}
          </span>
        );
      },
      filterFn: filterFns.includesString,
    }),
    columnHelper.accessor((row) => row.meal_type, {
      id: "meal_type",
      header: "Meal Type",
      cell: (info) => getMealTypeBadge(info.getValue()),
      filterFn: filterFns.equals,
      meta: { filterComponent: MealTypeFilter },
    }),
    columnHelper.accessor((row) => row.contact_method, {
      id: "contact_method",
      header: "Contact Method",
      cell: (info) => getContactMethodBadge(info.getValue()),
      filterFn: filterFns.equals,
      meta: { filterComponent: ContactMethodFilter },
    }),
    columnHelper.accessor((row) => row.delivery_day, {
      id: "delivery_day",
      header: "Delivery Day",
      cell: (info) => getDeliveryDayBadge(info.getValue()),
      filterFn: filterFns.equals,
    }),
    columnHelper.accessor((row) => row.delivery_date, {
      id: "delivery_date",
      header: "Delivery Date",
      cell: (info) => <span className="text-text-secondary">{formatDate(info.getValue())}</span>,
      filterFn: deliveryDateFilterFn,
      meta: { filterComponent: DeliveryDateFilter },
    }),
    columnHelper.accessor((row) => row.comments, {
      id: "comments",
      header: "Comments",
      cell: (info) => <span className="text-text-secondary max-w-xs truncate block">{info.getValue() || "—"}</span>,
      filterFn: filterFns.includesString,
    }),
    columnHelper.accessor((row) => row.created_at, {
      id: "created_at",
      header: "Submitted",
      cell: (info) => (
        <span className="text-text-secondary">{new Date(info.getValue()).toLocaleString()}</span>
      ),
      filterFn: filterFns.includesString,
    }),
    columnHelper.display({
      id: "assigned_driver",
      header: "Assigned Driver",
      cell: (info) => (
        <DriverSelectCell
          row={info.row}
          drivers={drivers}
          isPending={isPending}
          onAssign={handleAssignment}
        />
      ),
    }),
  ] as const, [drivers, isPending, handleAssignment]);

  const typedColumns = columns as unknown as ColumnDef<MealSignupWithAssignmentDb, unknown>[];

  return (
    <DataTable
      data={initialData}
      columns={typedColumns}
      enableSorting
      enableFiltering
      enablePagination
      pageSize={15}
    />
  );
}
