"use client";

import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getExpandedRowModel,
  flexRender,
  createColumnHelper,
  type ColumnDef,
  type SortingState,
  type ColumnFiltersState,
  type PaginationState,
  type ExpandedState,
  type RowData,
  type HeaderContext,
} from "@tanstack/react-table";
import { useState, useMemo } from "react";

type DataTableProps<TData extends RowData> = {
  data: TData[];
  columns: ColumnDef<TData, unknown>[];
  searchKey?: string;
  searchPlaceholder?: string;
  enableSorting?: boolean;
  enableFiltering?: boolean;
  enablePagination?: boolean;
  enableRowSelection?: boolean;
  enableExpanding?: boolean;
  pageSize?: number;
  onRowClick?: (row: TData) => void;
  className?: string;
};

export function DataTable<TData extends RowData>({
  data,
  columns,
  searchKey,
  searchPlaceholder = "Search...",
  enableSorting = true,
  enableFiltering = true,
  enablePagination = true,
  enableRowSelection = false,
  enableExpanding = false,
  pageSize = 10,
  onRowClick,
  className = "",
}: DataTableProps<TData>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize,
  });
  const [expanded, setExpanded] = useState<ExpandedState>({});
  const [rowSelection, setRowSelection] = useState({});

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
      pagination,
      expanded,
      rowSelection,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onPaginationChange: setPagination,
    onExpandedChange: setExpanded,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: enableSorting ? getSortedRowModel() : undefined,
    getFilteredRowModel: enableFiltering ? getFilteredRowModel() : undefined,
    getPaginationRowModel: enablePagination ? getPaginationRowModel() : undefined,
    getExpandedRowModel: enableExpanding ? getExpandedRowModel() : undefined,
  });

  const { getHeaderGroups, getRowModel, getFooterGroups, getState } = table;

  return (
    <div className={`space-y-4 ${className}`}>
      {(searchKey || enableFiltering) && (
        <div className="flex items-center gap-4">
          {searchKey && (
            <div className="flex-1 max-w-md">
              <input
                type="text"
                placeholder={searchPlaceholder}
                value={(table.getColumn(searchKey)?.getFilterValue() as string) || ""}
                onChange={(e) =>
                  table.getColumn(searchKey)?.setFilterValue(e.target.value)
                }
                className="w-full rounded-lg border border-primary/10 bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          )}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left" role="grid">
          <thead>
            {getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="border-b border-primary/10">
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="pb-3 font-semibold text-foreground"
                    style={{
                      cursor: header.column.getCanSort() ? "pointer" : "default",
                      userSelect: "none",
                    }}
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    {{
                      asc: " ▲",
                      desc: " ▼",
                    }[header.column.getIsSorted() as string] ?? null}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-primary/10">
            {getRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="py-8 text-center text-text-secondary">
                  No data available
                </td>
              </tr>
            ) : (
              getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className={`hover:bg-primary/5 transition-colors ${
                    onRowClick ? "cursor-pointer" : ""
                  }`}
                  onClick={() => onRowClick?.(row.original)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="py-3">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
          {enablePagination && (
            <tfoot>
              {getFooterGroups().map((footerGroup) => (
                <tr key={footerGroup.id}>
                  {footerGroup.headers.map((header) => (
                    <th key={header.id} className="pt-3">
                      {flexRender(header.column.columnDef.footer, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </tfoot>
          )}
        </table>
      </div>

      {enablePagination && (
        <div className="flex items-center justify-between text-sm text-text-secondary">
          <div>
            Showing{" "}
            <strong>
              {pagination.pageIndex * pagination.pageSize + 1}{" "}
              to{" "}
              {Math.min(
                (pagination.pageIndex + 1) * pagination.pageSize,
                getRowModel().rows.length
              )}{" "}
              of{" "}
              {getRowModel().rows.length} results
            </strong>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="rounded-lg border border-primary/10 bg-background px-3 py-1.5 text-sm font-medium text-foreground hover:bg-primary/5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="rounded-lg border border-primary/10 bg-background px-3 py-1.5 text-sm font-medium text-foreground hover:bg-primary/5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function createDataColumnHelper<TData extends RowData>() {
  return createColumnHelper<TData>();
}