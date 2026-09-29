"use client";

import { useMemo, useState, useTransition, useEffect, useRef } from "react";
import type { SundayMealCook, SundayMealCookStatus } from "@/app/lib/definitions";
import {
  SUNDAY_MEAL_COOK_STATUS_OPTIONS,
  SUNDAY_MEAL_AVAILABILITY_OPTIONS,
} from "@/app/lib/definitions";
import { updateSundayMealCookAction } from "@/app/actions/sunday-meals";
import { DataTable } from "../../components/DataTable";
import { Modal } from "../../components/Modal";
import {
  formatDateTime,
  formatPhone,
  getCookStatusBadge,
} from "../../lib/utils";
import { createColumnHelper, type ColumnDef, filterFns } from "@tanstack/react-table";

const columnHelper = createColumnHelper<SundayMealCook>();

type FilterColumn = {
  getFilterValue: () => unknown;
  setFilterValue: (value: unknown) => void;
};

type ExpandableRow = {
  toggleExpanded: () => void;
  getIsExpanded: () => boolean;
};

const AVAILABILITY_LABELS: Record<string, string> = Object.fromEntries(
  SUNDAY_MEAL_AVAILABILITY_OPTIONS.map((o) => [o.value, o.label])
);

function CookFilter({ column }: { column: FilterColumn }) {
  return (
    <input
      type="text"
      placeholder="Filter name, email..."
      value={(column.getFilterValue() as string) || ""}
      onChange={(e) => {
        e.stopPropagation();
        column.setFilterValue(e.target.value);
      }}
      onClick={(e) => e.stopPropagation()}
      className="w-full rounded border border-primary/10 bg-background px-2 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
    />
  );
}

function StatusFilter({ column }: { column: FilterColumn }) {
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
      <option value="">All</option>
      {SUNDAY_MEAL_COOK_STATUS_OPTIONS.map((opt) => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  );
}

function cookFilterFn(
  row: { original: SundayMealCook },
  _columnId: string,
  filterValue: string
): boolean {
  if (!filterValue) return true;
  const r = row.original;
  const search = String(filterValue).toLowerCase();
  return (
    r.name?.toLowerCase().includes(search) ||
    r.email?.toLowerCase().includes(search) ||
    r.phone?.includes(search)
  );
}

function parseAvailability(raw: string): string[] {
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((v) => typeof v === "string") : [];
  } catch {
    return [];
  }
}

function ExpandableText({ value, row }: { value: string | null; row: ExpandableRow }) {
  if (!value) return <span className="text-text-secondary">—</span>;
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        row.toggleExpanded();
      }}
      className="text-left w-full cursor-pointer"
    >
      {row.getIsExpanded() ? (
        <span className="text-text-secondary whitespace-pre-wrap max-w-md">{value}</span>
      ) : (
        <span className="text-text-secondary max-w-xs truncate block">
          {value} <span className="text-xs text-text-secondary/50">▶</span>
        </span>
      )}
    </button>
  );
}

export function SundayMealCooksTable({ initialData }: { initialData: SundayMealCook[] }) {
  const [isPending, startTransition] = useTransition();
  const [cooks, setCooks] = useState(initialData);
  const prevInitialData = useRef(initialData);
  useEffect(() => {
    if (prevInitialData.current !== initialData) {
      setCooks(initialData);
      prevInitialData.current = initialData;
    }
  }, [initialData]);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingCook, setEditingCook] = useState<SundayMealCook | null>(null);
  const [editStatus, setEditStatus] = useState<SundayMealCookStatus>("active");
  const [editNotes, setEditNotes] = useState("");
  const [actionError, setActionError] = useState<string | null>(null);

  function handleEdit(cook: SundayMealCook) {
    setEditingCook(cook);
    setEditStatus(cook.status);
    setEditNotes(cook.internal_notes || "");
    setActionError(null);
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditingCook(null);
    setActionError(null);
  }

  function handleSave() {
    if (!editingCook) return;
    setActionError(null);
    startTransition(async () => {
      const result = await updateSundayMealCookAction(
        editingCook.id,
        editStatus,
        editNotes.trim() || null
      );
      if (result.success && result.cooks) {
        setCooks(result.cooks);
        closeModal();
      } else {
        setActionError(result.message);
      }
    });
  }

  const columns = useMemo(
    () => [
      columnHelper.display({
        id: "cook",
        header: "Cook",
        filterFn: cookFilterFn,
        meta: { filterComponent: CookFilter },
        cell: (info) => {
          const c = info.row.original;
          return (
            <div className="space-y-0.5 max-w-[220px]">
              <div className="text-foreground font-medium text-sm">{c.name}</div>
              <div className="text-text-secondary text-xs truncate">{c.email}</div>
              <div className="text-text-secondary text-xs">{formatPhone(c.phone)}</div>
            </div>
          );
        },
      }),
      columnHelper.accessor((row) => row.availability, {
        id: "availability",
        header: "Sundays",
        enableSorting: false,
        enableColumnFilter: false,
        cell: (info) => {
          const values = parseAvailability(info.getValue());
          if (values.length === 0) {
            return <span className="text-text-secondary">—</span>;
          }
          return (
            <div className="flex flex-wrap gap-1">
              {values.map((v) => (
                <span
                  key={v}
                  className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary"
                >
                  {AVAILABILITY_LABELS[v] ?? v}
                </span>
              ))}
            </div>
          );
        },
      }),
      columnHelper.accessor((row) => row.servings, {
        id: "servings",
        header: "Servings",
        enableColumnFilter: false,
        cell: (info) => {
          const value = info.getValue();
          if (value === null || value === undefined) {
            return <span className="text-text-secondary">—</span>;
          }
          return <span className="text-foreground font-medium text-sm">{value}</span>;
        },
      }),
      columnHelper.display({
        id: "cooking_details",
        header: "Cooking Details",
        enableColumnFilter: false,
        cell: (info) => (
          <ExpandableText value={info.row.original.cooking_details} row={info.row} />
        ),
      }),
      columnHelper.display({
        id: "dietary_notes",
        header: "Dietary Notes",
        enableColumnFilter: false,
        cell: (info) => (
          <ExpandableText value={info.row.original.dietary_notes} row={info.row} />
        ),
      }),
      columnHelper.display({
        id: "notes",
        header: "Cook Notes",
        enableColumnFilter: false,
        cell: (info) => <ExpandableText value={info.row.original.notes} row={info.row} />,
      }),
      columnHelper.accessor((row) => row.status, {
        id: "status",
        header: "Status",
        filterFn: filterFns.equals,
        meta: { filterComponent: StatusFilter },
        cell: (info) => getCookStatusBadge(info.getValue()),
      }),
      columnHelper.display({
        id: "internal_notes",
        header: "Internal Notes",
        enableColumnFilter: false,
        cell: (info) => (
          <ExpandableText value={info.row.original.internal_notes} row={info.row} />
        ),
      }),
      columnHelper.accessor((row) => row.created_at, {
        id: "created_at",
        header: "Signed Up",
        cell: (info) => (
          <span className="text-text-secondary">{formatDateTime(info.getValue())}</span>
        ),
        filterFn: filterFns.includesString,
      }),
      columnHelper.display({
        id: "actions",
        enableHiding: false,
        header: "",
        cell: (info) => (
          <button
            onClick={() => handleEdit(info.row.original)}
            className="rounded-lg border border-primary/10 px-3 py-1.5 text-xs font-medium text-foreground hover:bg-primary/5 transition-colors"
          >
            Edit
          </button>
        ),
      }),
    ],
    []
  );

  const typedColumns = columns as unknown as ColumnDef<SundayMealCook, unknown>[];

  return (
    <section className="space-y-6">
      <Modal open={modalOpen} onClose={closeModal} title="Edit Cook">
        <div className="space-y-4">
          {editingCook && (
            <p className="text-sm text-text-secondary">
              {editingCook.name} — {editingCook.email}
            </p>
          )}

          <div>
            <label htmlFor="cook-status" className="block text-sm font-medium text-foreground mb-1">
              Status
            </label>
            <select
              id="cook-status"
              value={editStatus}
              onChange={(e) => setEditStatus(e.target.value as SundayMealCookStatus)}
              className="w-full rounded-lg border border-primary/10 bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {SUNDAY_MEAL_COOK_STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="cook-notes" className="block text-sm font-medium text-foreground mb-1">
              Internal Notes
            </label>
            <textarea
              id="cook-notes"
              value={editNotes}
              onChange={(e) => setEditNotes(e.target.value)}
              rows={4}
              placeholder="Add internal notes about this cook..."
              className="w-full rounded-lg border border-primary/10 bg-background px-3 py-2 text-sm text-foreground placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {actionError && <p className="text-sm text-red-500">{actionError}</p>}

          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={closeModal}
              className="rounded-lg border border-primary/10 px-4 py-2 text-sm font-medium text-foreground hover:bg-primary/5 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isPending}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-primary-dark disabled:opacity-50"
            >
              {isPending ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </Modal>

      <DataTable
        data={cooks}
        columns={typedColumns}
        enableSorting
        enableFiltering
        enablePagination
        enableExpanding
        enableColumnVisibility
        enableGlobalFilter
        enableColumnPinning
        enableColumnResizing
        enableFacetedFilters
        initialColumnPinning={{ left: ["cook"], right: ["actions"] }}
        initialSorting={[{ id: "created_at", desc: true }]}
        pageSize={25}
        storageKey="sunday-meal-cooks-column-visibility"
      />
    </section>
  );
}
