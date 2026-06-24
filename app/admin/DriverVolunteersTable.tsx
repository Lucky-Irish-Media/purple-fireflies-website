"use client";

import { useMemo } from "react";
import type { DriverVolunteer } from "@/app/lib/definitions";
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

function getSignalBadge(signal: string) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
        signal === "yes"
          ? "bg-green-100 text-green-800"
          : signal === "willing"
          ? "bg-yellow-100 text-yellow-800"
          : "bg-gray-100 text-gray-800"
      }`}
    >
      {signal}
    </span>
  );
}

function getDeliveryDayBadge(day: string) {
  return (
    <span className="capitalize text-text-secondary">{day}</span>
  );
}

const columnHelper = createColumnHelper<DriverVolunteer>();

export default function DriverVolunteersTable({ initialData }: { initialData: DriverVolunteer[] }) {
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
    columnHelper.accessor((row) => row.on_signal, {
      id: "on_signal",
      header: "On Signal",
      cell: (info) => getSignalBadge(info.getValue()),
      filterFn: filterFns.equals,
    }),
    columnHelper.accessor((row) => row.regions, {
      id: "regions",
      header: "Regions",
      cell: (info) => <span className="text-text-secondary max-w-xs truncate block">{info.getValue()}</span>,
      filterFn: filterFns.includesString,
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
    columnHelper.accessor((row) => row.created_at, {
      id: "created_at",
      header: "Submitted",
      cell: (info) => (
        <span className="text-text-secondary">{new Date(info.getValue()).toLocaleString()}</span>
      ),
      filterFn: filterFns.includesString,
    }),
  ] as const, []);

  const typedColumns = columns as unknown as ColumnDef<DriverVolunteer, unknown>[];

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