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
  type VisibilityState,
} from "@tanstack/react-table";
import { useState, useMemo, useRef, useEffect } from "react";

export type FilterComponent<TData extends RowData> = (props: {
  column: any;
  table: any;
  header: any;
}) => React.ReactNode;

type DataTableProps<TData extends RowData> = {
  data: TData[];
  columns: ColumnDef<TData, unknown>[];
  enableSorting?: boolean;
  enableFiltering?: boolean;
  enablePagination?: boolean;
  enableRowSelection?: boolean;
  enableExpanding?: boolean;
  enableColumnVisibility?: boolean;
  initialVisibility?: VisibilityState;
  initialSorting?: SortingState;
  pageSize?: number;
  onRowClick?: (row: TData) => void;
  className?: string;
};

export function DataTable<TData extends RowData>({
  data,
  columns,
  enableSorting = true,
  enableFiltering = true,
  enablePagination = true,
  enableRowSelection = false,
  enableExpanding = false,
  enableColumnVisibility = false,
  initialVisibility = {},
  initialSorting = [],
  pageSize = 10,
  onRowClick,
  className = "",
}: DataTableProps<TData>) {
  const [showFilters, setShowFilters] = useState(false);
  const [sorting, setSorting] = useState<SortingState>(initialSorting);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize,
  });
  const [expanded, setExpanded] = useState<ExpandedState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(
    enableColumnVisibility ? initialVisibility : {}
  );
  const [columnVisibilityOpen, setColumnVisibilityOpen] = useState(false);
  const columnVisibilityRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (columnVisibilityRef.current && !columnVisibilityRef.current.contains(event.target as Node)) {
        setColumnVisibilityOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
      pagination,
      expanded,
      rowSelection,
      columnVisibility,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onPaginationChange: setPagination,
    onExpandedChange: setExpanded,
    onRowSelectionChange: setRowSelection,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: enableSorting ? getSortedRowModel() : undefined,
    getFilteredRowModel: enableFiltering ? getFilteredRowModel() : undefined,
    getPaginationRowModel: enablePagination ? getPaginationRowModel() : undefined,
    getExpandedRowModel: enableExpanding ? getExpandedRowModel() : undefined,
  });

  const { getHeaderGroups, getRowModel, getFooterGroups, getState } = table;

  return (
    <div className={`space-y-4 ${className}`}>
      {(enableFiltering || enableColumnVisibility) && (
        <div className="flex items-center gap-2 flex-wrap">
          {enableFiltering && (
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="rounded-lg border border-primary/10 bg-background px-3 py-1.5 text-sm font-medium text-foreground hover:bg-primary/5 transition-colors"
            >
              {showFilters ? "Hide Filters" : "Show Filters"}
            </button>
          )}
          <div className="flex-1" />
          {enableColumnVisibility && (
            <div ref={columnVisibilityRef} className="relative">
              <button
                onClick={() => setColumnVisibilityOpen(!columnVisibilityOpen)}
                className="rounded-lg border border-primary/10 bg-background px-3 py-1.5 text-sm font-medium text-foreground hover:bg-primary/5 transition-colors"
              >
                Columns ▾
              </button>
              {columnVisibilityOpen && (
                <div className="absolute right-0 mt-1 w-48 rounded-lg border border-primary/10 bg-background shadow-lg z-50">
                  {table.getAllLeafColumns().filter((col) => col.getCanHide()).map((col) => (
                    <label
                      key={col.id}
                      className="flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-primary/5 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={col.getIsVisible()}
                        onChange={col.getToggleVisibilityHandler()}
                        className="rounded border-primary/30 text-primary focus:ring-primary"
                      />
                      {typeof col.columnDef.header === "string" ? col.columnDef.header : col.id}
                    </label>
                  ))}
                </div>
              )}
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
            {enableFiltering && showFilters && (
              <tr className="border-b border-primary/10">
                {getHeaderGroups()[0]?.headers.map((header) => (
                  <th key={header.id} className="pb-2">
                    {header.column.getCanFilter() && (
                      <div className="w-full relative">
                        {(header.column.columnDef.meta as any)?.filterComponent ? (
                          flexRender(
                            (header.column.columnDef.meta as any).filterComponent,
                            {
                              column: header.column,
                              table: table,
                              header: header.getContext(),
                            } as any
                          )
                        ) : (
                          <>
                            {header.column.getFilterValue() !== undefined && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  header.column.setFilterValue(undefined);
                                }}
                                className="absolute mt-1 mr-1 right-0 text-red-500 hover:text-red-700 text-xs"
                              >
                                ✕
                              </button>
                            )}
                            <input
                              type="text"
                              placeholder={`Filter ${header.column.id}...`}
                              value={(header.column.getFilterValue() as string) || ""}
                              onChange={(e) => {
                                e.stopPropagation();
                                header.column.setFilterValue(e.target.value);
                              }}
                              onClick={(e) => e.stopPropagation()}
                              className="w-full rounded border border-primary/10 bg-background px-2 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                            />
                          </>
                        )}
                      </div>
                    )}
                  </th>
                ))}
              </tr>
            )}
          </thead>
          <tbody className="divide-y divide-primary/10">
            {getRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={table.getVisibleLeafColumns().length} className="py-8 text-center text-text-secondary">
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
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-sm text-text-secondary">
          <div className="order-2 sm:order-1">
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
          <div className="order-1 sm:order-2 flex items-center gap-2 w-full sm:w-auto">
            <div className="flex-1 sm:flex-initial" />
            <button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="flex-1 sm:flex-initial rounded-lg border border-primary/10 bg-background px-3 py-1.5 text-sm font-medium text-foreground hover:bg-primary/5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="flex-1 sm:flex-initial rounded-lg border border-primary/10 bg-background px-3 py-1.5 text-sm font-medium text-foreground hover:bg-primary/5 disabled:opacity-50 disabled:cursor-not-allowed"
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