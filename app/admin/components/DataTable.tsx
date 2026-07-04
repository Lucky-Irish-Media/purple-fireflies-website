"use client";

import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getExpandedRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
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
  type ColumnPinningState,
  type ColumnResizeMode,
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
  enableGlobalFilter?: boolean;
  enableColumnPinning?: boolean;
  enableColumnResizing?: boolean;
  enableFacetedFilters?: boolean;
  initialVisibility?: VisibilityState;
  initialSorting?: SortingState;
  initialColumnPinning?: ColumnPinningState;
  columnResizeMode?: ColumnResizeMode;
  pageSize?: number;
  onRowClick?: (row: TData) => void;
  className?: string;
  storageKey?: string;
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
  enableGlobalFilter = true,
  enableColumnPinning = false,
  enableColumnResizing = false,
  enableFacetedFilters = false,
  initialVisibility = {},
  initialSorting = [],
  initialColumnPinning = {},
  columnResizeMode = "onChange",
  pageSize = 10,
  onRowClick,
  className = "",
  storageKey,
}: DataTableProps<TData>) {
  const [showFilters, setShowFilters] = useState(false);
  const [sorting, setSorting] = useState<SortingState>(initialSorting);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState<any>(undefined);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize,
  });
  const [expanded, setExpanded] = useState<ExpandedState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [columnPinning, setColumnPinning] = useState<ColumnPinningState>(initialColumnPinning);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(() => {
    if (!enableColumnVisibility) return {};
    const saved = storageKey ? sessionStorage.getItem(storageKey) : null;
    return saved ? { ...initialVisibility, ...JSON.parse(saved) } : initialVisibility;
  });
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

  useEffect(() => {
    if (enableColumnVisibility && storageKey) {
      sessionStorage.setItem(storageKey, JSON.stringify(columnVisibility));
    }
  }, [enableColumnVisibility, storageKey, columnVisibility]);

  const hasPinning = enableColumnPinning && Object.values(columnPinning).some(arr => arr && arr.length > 0);

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
      globalFilter,
      pagination,
      expanded,
      rowSelection,
      columnVisibility,
      columnPinning,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    onExpandedChange: setExpanded,
    onRowSelectionChange: setRowSelection,
    onColumnVisibilityChange: setColumnVisibility,
    onColumnPinningChange: setColumnPinning,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: enableSorting ? getSortedRowModel() : undefined,
    getFilteredRowModel: enableFiltering ? getFilteredRowModel() : undefined,
    getPaginationRowModel: enablePagination ? getPaginationRowModel() : undefined,
    getExpandedRowModel: enableExpanding ? getExpandedRowModel() : undefined,
    getFacetedRowModel: enableFacetedFilters ? getFacetedRowModel() : undefined,
    getFacetedUniqueValues: enableFacetedFilters ? getFacetedUniqueValues() : undefined,
    enableColumnPinning,
    enableColumnResizing,
    columnResizeMode,
    globalFilterFn: "auto",
  });

  const { getHeaderGroups, getRowModel, getFooterGroups, getState } = table;

  function getColumnStyle(column: any) {
    const isPinned = column.getIsPinned();
    if (!isPinned) return undefined;
    if (isPinned === 'left') {
      return {
        position: 'sticky' as const,
        left: column.getStart('left'),
        zIndex: 2,
      };
    }
    return {
      position: 'sticky' as const,
      right: column.getAfter('right'),
      zIndex: 2,
    };
  }

  function FacetedFilter({ column }: { column: any }) {
    const value = column.getFilterValue() as string | undefined;
    const uniqueValues = column.getFacetedUniqueValues();
    const sortedValues = useMemo(() => {
      if (!uniqueValues) return [];
      const entries = Array.from(uniqueValues.entries()) as [string, number][];
      return entries.sort((a, b) => a[0].localeCompare(b[0]));
    }, [uniqueValues]);
    return (
      <select
        value={value || ""}
        onChange={(e) => {
          e.stopPropagation();
          column.setFilterValue(e.target.value || undefined);
        }}
        className="w-full rounded border border-primary/10 bg-background px-2 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
      >
        <option value="">All</option>
        {sortedValues.map(([val, count]) => (
          <option key={String(val)} value={String(val)}>
            {String(val)} ({count})
          </option>
        ))}
      </select>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {(enableFiltering || enableColumnVisibility || enableGlobalFilter) && (
        <div className="flex items-center gap-2 flex-wrap">
          {enableGlobalFilter && (
            <input
              type="text"
              placeholder="Search all columns..."
              value={(globalFilter as string) || ""}
              onChange={(e) => {
                setGlobalFilter(e.target.value || undefined);
                setPagination((prev) => ({ ...prev, pageIndex: 0 }));
              }}
              className="rounded-lg border border-primary/10 bg-background px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary min-w-[200px]"
            />
          )}
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
                <div className="absolute right-0 mt-1 w-56 rounded-lg border border-primary/10 bg-background shadow-lg z-50">
                  {table.getAllLeafColumns().filter((col) => col.getCanHide()).map((col) => (
                    <div key={col.id} className="px-3 py-2 border-b border-primary/5 last:border-b-0">
                      <label className="flex items-center gap-2 text-sm text-foreground hover:bg-primary/5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={col.getIsVisible()}
                          onChange={col.getToggleVisibilityHandler()}
                          className="rounded border-primary/30 text-primary focus:ring-primary"
                        />
                        {typeof col.columnDef.header === "string" ? col.columnDef.header : col.id}
                      </label>
                      {enableColumnPinning && col.getCanPin() && (
                        <div className="flex gap-1 mt-1 ml-5">
                          <button
                            onClick={(e) => { e.stopPropagation(); col.pin('left'); }}
                            className={`text-[10px] px-1.5 py-0.5 rounded transition-colors ${
                              col.getIsPinned() === 'left'
                                ? 'bg-primary/20 text-foreground font-semibold'
                                : 'text-text-secondary hover:text-foreground'
                            }`}
                          >
                            ◀ Pin
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); col.pin(false); }}
                            className={`text-[10px] px-1.5 py-0.5 rounded transition-colors ${
                              !col.getIsPinned()
                                ? 'bg-primary/20 text-foreground font-semibold'
                                : 'text-text-secondary hover:text-foreground'
                            }`}
                          >
                            ↕
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); col.pin('right'); }}
                            className={`text-[10px] px-1.5 py-0.5 rounded transition-colors ${
                              col.getIsPinned() === 'right'
                                ? 'bg-primary/20 text-foreground font-semibold'
                                : 'text-text-secondary hover:text-foreground'
                            }`}
                          >
                            Pin ▶
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Desktop table */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full text-sm text-left" role="grid" style={{ minWidth: hasPinning ? table.getTotalSize() : undefined }}>
          <thead>
            {getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="border-b border-primary/10">
                {headerGroup.headers.map((header) => {
                  const column = header.column;
                  const isPinned = column.getIsPinned();
                  return (
                    <th
                      key={header.id}
                      className="pb-3 pr-3 font-semibold text-foreground relative"
                      style={{
                        cursor: column.getCanSort() ? "pointer" : "default",
                        userSelect: "none",
                        width: enableColumnResizing ? column.getSize() : undefined,
                        ...(hasPinning ? getColumnStyle(column) : {}),
                        ...(hasPinning && isPinned ? { backgroundColor: 'var(--color-background, #fff)' } : {}),
                      }}
                      onClick={column.getToggleSortingHandler()}
                    >
                      <div className="flex items-center gap-1">
                        <span className="truncate">
                          {header.isPlaceholder ? null : flexRender(column.columnDef.header, header.getContext())}
                        </span>
                        {{
                          asc: " ▲",
                          desc: " ▼",
                        }[column.getIsSorted() as string] ?? null}
                      </div>
                      {enableColumnResizing && column.getCanResize() && (
                        <div
                          onMouseDown={header.getResizeHandler()}
                          onTouchStart={header.getResizeHandler()}
                          className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-primary/30 transition-colors"
                          style={{ touchAction: 'none' }}
                        />
                      )}
                    </th>
                  );
                })}
              </tr>
            ))}
            {enableFiltering && showFilters && (
              <tr className="border-b border-primary/10">
                {getHeaderGroups()[0]?.headers.map((header) => {
                  const column = header.column;
                  return (
                    <th key={header.id} className="pb-2 pr-3" style={{
                      ...(hasPinning ? getColumnStyle(column) : {}),
                      ...(hasPinning && column.getIsPinned() ? { backgroundColor: 'var(--color-background, #fff)' } : {}),
                    }}>
                      {column.getCanFilter() && (
                        <div className="w-full relative">
                          {(column.columnDef.meta as any)?.filterComponent ? (
                            flexRender(
                              (column.columnDef.meta as any).filterComponent,
                              {
                                column: column,
                                table: table,
                                header: header.getContext(),
                              } as any
                            )
                          ) : enableFacetedFilters ? (
                            <FacetedFilter column={column} />
                          ) : (
                            <>
                              {column.getFilterValue() !== undefined && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    column.setFilterValue(undefined);
                                  }}
                                  className="absolute mt-1 mr-1 right-0 text-red-500 hover:text-red-700 text-xs"
                                >
                                  ✕
                                </button>
                              )}
                              <input
                                type="text"
                                placeholder={`Filter ${column.id}...`}
                                value={(column.getFilterValue() as string) || ""}
                                onChange={(e) => {
                                  e.stopPropagation();
                                  column.setFilterValue(e.target.value);
                                }}
                                onClick={(e) => e.stopPropagation()}
                                className="w-full rounded border border-primary/10 bg-background px-2 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                              />
                            </>
                          )}
                        </div>
                      )}
                    </th>
                  );
                })}
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
                  {row.getVisibleCells().map((cell) => {
                    const col = cell.column;
                    const isPinned = col.getIsPinned();
                    return (
                      <td key={cell.id} className="py-3 pr-3" style={{
                        width: enableColumnResizing ? col.getSize() : undefined,
                        ...(hasPinning ? getColumnStyle(col) : {}),
                        ...(hasPinning && isPinned ? { backgroundColor: 'var(--color-background, #fff)' } : {}),
                      }}>
                        {flexRender(col.columnDef.cell, cell.getContext())}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
          {enablePagination && (
            <tfoot>
              {getFooterGroups().map((footerGroup) => (
                <tr key={footerGroup.id}>
                  {footerGroup.headers.map((header) => (
                    <th key={header.id} className="pt-3 pr-3">
                      {flexRender(header.column.columnDef.footer, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </tfoot>
          )}
        </table>
      </div>

      {/* Mobile filters */}
      {enableFiltering && showFilters && (
        <div className="sm:hidden grid grid-cols-2 gap-3">
          {getHeaderGroups()[0]?.headers.map((header) =>
            header.column.getCanFilter() ? (
              <div key={header.id} className="relative">
                <label className="text-xs font-medium text-text-secondary block mb-1">
                  {typeof header.column.columnDef.header === "string"
                    ? header.column.columnDef.header
                    : header.column.id}
                </label>
                {(header.column.columnDef.meta as any)?.filterComponent ? (
                  flexRender(
                    (header.column.columnDef.meta as any).filterComponent,
                    { column: header.column, table: table, header: header.getContext() } as any
                  )
                ) : (
                  <div className="relative">
                    {header.column.getFilterValue() !== undefined && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          header.column.setFilterValue(undefined);
                        }}
                        className="absolute top-1 right-1 text-red-500 hover:text-red-700 text-xs z-10"
                      >
                        ✕
                      </button>
                    )}
                    <input
                      type="text"
                      placeholder={`Filter ${typeof header.column.columnDef.header === "string" ? header.column.columnDef.header : header.column.id}...`}
                      value={(header.column.getFilterValue() as string) || ""}
                      onChange={(e) => {
                        e.stopPropagation();
                        header.column.setFilterValue(e.target.value);
                      }}
                      onClick={(e) => e.stopPropagation()}
                      className="w-full rounded border border-primary/10 bg-background px-2 py-1.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                )}
              </div>
            ) : null
          )}
        </div>
      )}

      {/* Mobile cards */}
      <div className="sm:hidden space-y-3">
        {getRowModel().rows.length === 0 ? (
          <div className="py-8 text-center text-text-secondary">
            No data available
          </div>
        ) : (
          getRowModel().rows.map((row) => (
            <div
              key={row.id}
              className={`rounded-lg border border-primary/10 bg-card p-4 space-y-2 ${
                onRowClick ? "cursor-pointer" : ""
              }`}
              onClick={() => onRowClick?.(row.original)}
            >
              {row.getVisibleCells().map((cell) => {
                const headerLabel =
                  typeof cell.column.columnDef.header === "string" &&
                  cell.column.columnDef.header.trim()
                    ? cell.column.columnDef.header
                    : null;
                return (
                  <div key={cell.id}>
                    {headerLabel && (
                      <span className="text-xs font-semibold uppercase tracking-wider text-text-secondary block">
                        {headerLabel}
                      </span>
                    )}
                    <div className="text-sm text-foreground">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </div>
                  </div>
                );
              })}
            </div>
          ))
        )}
      </div>

      {enablePagination && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-sm text-text-secondary">
          <div className="order-3 sm:order-1 flex items-center gap-2">
            <span>Rows:</span>
            <select
              value={pagination.pageSize >= data.length ? data.length : pagination.pageSize}
              onChange={(e) => {
                const val = Number(e.target.value);
                table.setPageSize(val);
              }}
              className="rounded border border-primary/10 bg-background px-2 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            >
              {[5, 10, 15, 20].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
              <option value={data.length}>All</option>
            </select>
          </div>
          <div className="order-2 sm:order-2">
            Showing{" "}
            <strong>
              {getRowModel().rows.length === 0
                ? 0
                : pagination.pageIndex * pagination.pageSize + 1}{" "}
              to{" "}
              {Math.min(
                (pagination.pageIndex + 1) * pagination.pageSize,
                getRowModel().rows.length
              )}{" "}
              of{" "}
              {getRowModel().rows.length} results
            </strong>
          </div>
          <div className="order-1 sm:order-3 flex items-center gap-2 w-full sm:w-auto">
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
