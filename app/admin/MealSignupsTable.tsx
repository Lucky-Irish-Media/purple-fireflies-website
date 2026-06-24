"use client";

import { useMemo } from "react";
import type { MealSignup } from "@/app/lib/db";
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

const columnHelper = createColumnHelper<MealSignup>();

export default function MealSignupsTable({ initialData }: { initialData: MealSignup[] }) {
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
    }),
    columnHelper.accessor((row) => row.contact_method, {
      id: "contact_method",
      header: "Contact Method",
      cell: (info) => getContactMethodBadge(info.getValue()),
      filterFn: filterFns.equals,
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
      filterFn: filterFns.includesString,
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
  ] as const, []);

  const typedColumns = columns as unknown as ColumnDef<MealSignup, unknown>[];

  return (
    <DataTable
      data={initialData}
      columns={typedColumns}
      searchKey="name"
      searchPlaceholder="Search by name..."
      enableSorting
      enableFiltering
      enablePagination
      pageSize={15}
    />
  );
}