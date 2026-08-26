"use client";

import { useMemo } from "react";
import {
  createColumnHelper,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  useReactTable,
} from "@tanstack/react-table";
import type { LegalObserverSignup } from "@/app/lib/definitions";
import { formatDateTime, formatPhone } from "@/app/admin/lib/utils";

const columnHelper = createColumnHelper<LegalObserverSignup>();

const columns = [
  columnHelper.accessor("name", {
    header: "Name",
    cell: (info) => (
      <span className="text-foreground font-medium">{info.getValue()}</span>
    ),
  }),
  columnHelper.accessor("email", {
    header: "Email",
    cell: (info) => (
      <span className="text-text-secondary">{info.getValue()}</span>
    ),
  }),
  columnHelper.accessor("phone", {
    header: "Phone",
    cell: (info) => (
      <span className="text-text-secondary">{formatPhone(info.getValue())}</span>
    ),
  }),
  columnHelper.accessor("background", {
    header: "Background",
    cell: (info) => (
      <span className="text-text-secondary">{info.getValue() || "—"}</span>
    ),
  }),
  columnHelper.accessor("motivation", {
    header: "Motivation",
    cell: (info) => (
      <span className="text-text-secondary">{info.getValue() || "—"}</span>
    ),
  }),
  columnHelper.accessor("skills", {
    header: "Skills",
    cell: (info) => (
      <span className="text-text-secondary">{info.getValue() || "—"}</span>
    ),
  }),
  columnHelper.accessor("created_at", {
    header: "Signed Up",
    cell: (info) => (
      <span className="text-text-secondary">{formatDateTime(info.getValue())}</span>
    ),
  }),
];

export function LegalObserverSignupsTable({ initialData }: { initialData: LegalObserverSignup[] }) {
  const data = useMemo(() => initialData, [initialData]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 25 } },
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <input
          type="text"
          placeholder="Search signups..."
          value={(table.getState().globalFilter as string) ?? ""}
          onChange={(e) => table.setGlobalFilter(e.target.value)}
          className="w-full max-w-sm rounded border border-primary/10 bg-background px-3 py-2 text-sm text-foreground placeholder:text-text-secondary focus:outline-none focus:ring-1 focus:ring-primary"
        />
        <span className="text-sm text-text-secondary">{data.length} signup{data.length !== 1 ? "s" : ""}</span>
      </div>

      <div className="overflow-x-auto rounded-lg border border-primary/10">
        <table className="w-full text-sm">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="border-b border-primary/10 bg-card">
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-secondary cursor-pointer select-none hover:text-foreground"
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    <div className="flex items-center gap-1">
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {{ asc: " ↑", desc: " ↓" }[header.column.getIsSorted() as string] ?? ""}
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="border-b border-primary/5 hover:bg-primary/5">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-4 py-3">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {table.getPageCount() > 1 && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-text-secondary">
            Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="rounded-lg border border-primary/10 px-3 py-1.5 text-xs font-medium text-foreground hover:bg-primary/5 transition-colors disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="rounded-lg border border-primary/10 px-3 py-1.5 text-xs font-medium text-foreground hover:bg-primary/5 transition-colors disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
