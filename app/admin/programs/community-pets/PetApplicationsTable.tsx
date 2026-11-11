"use client";

import { useMemo, useState, useTransition, useEffect, useRef } from "react";
import type { PetApplication, PetApplicationStatus } from "@/app/lib/definitions";
import { PET_APPLICATION_STATUS_OPTIONS } from "@/app/lib/definitions";
import {
  updatePetApplicationAction,
  convertPetApplicationAction,
} from "@/app/actions/sponsor-pet-application";
import { DataTable } from "../../components/DataTable";
import { Modal } from "../../components/Modal";
import { formatDate, formatPhone, formatDateTime } from "../../lib/utils";
import { createColumnHelper, type ColumnDef, filterFns } from "@tanstack/react-table";

const columnHelper = createColumnHelper<PetApplication>();

function ApplicantFilter({ column }: { column: any }) {
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

function StatusFilter({ column }: { column: any }) {
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
      {PET_APPLICATION_STATUS_OPTIONS.map((opt) => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  );
}

function applicantFilterFn(row: any, _columnId: string, filterValue: string): boolean {
  if (!filterValue) return true;
  const r = row.original;
  const search = String(filterValue).toLowerCase();
  return (
    r.applicant_name?.toLowerCase().includes(search) ||
    r.applicant_email?.toLowerCase().includes(search) ||
    r.applicant_phone?.includes(search) ||
    r.pet_name?.toLowerCase().includes(search)
  );
}

export function PetApplicationsTable({ initialData }: { initialData: PetApplication[] }) {
  const [isPending, startTransition] = useTransition();
  const [applications, setApplications] = useState(initialData);
  const prevInitialData = useRef(initialData);
  useEffect(() => {
    if (prevInitialData.current !== initialData) {
      setApplications(initialData);
      prevInitialData.current = initialData;
    }
  }, [initialData]);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<PetApplication | null>(null);
  const [editStatus, setEditStatus] = useState<PetApplicationStatus>("submitted");
  const [editNotes, setEditNotes] = useState("");
  const [actionError, setActionError] = useState<string | null>(null);
  const [convertingId, setConvertingId] = useState<number | null>(null);

  function handleEdit(app: PetApplication) {
    setEditing(app);
    setEditStatus(app.status);
    setEditNotes(app.internal_notes || "");
    setActionError(null);
    setModalOpen(true);
  }

  function handleSave() {
    if (!editing) return;
    setActionError(null);
    startTransition(async () => {
      const result = await updatePetApplicationAction(editing.id, editStatus, editNotes.trim() || null);
      if (result.success && result.applications) {
        setApplications(result.applications);
        setModalOpen(false);
        setEditing(null);
      } else {
        setActionError(result.message);
      }
    });
  }

  function handleConvert(app: PetApplication) {
    setConvertingId(app.id);
    startTransition(async () => {
      const result = await convertPetApplicationAction(app.id);
      if (result.success && result.applications) {
        setApplications(result.applications);
      } else {
        setActionError(result.message);
      }
      setConvertingId(null);
    });
  }

  const columns = useMemo(() => [
    columnHelper.display({
      id: "applicant",
      header: "Applicant",
      filterFn: applicantFilterFn,
      meta: { filterComponent: ApplicantFilter },
      cell: (info) => {
        const a = info.row.original;
        return (
          <div className="space-y-0.5 max-w-[220px]">
            <div className="text-foreground font-medium text-sm">{a.applicant_name}</div>
            <div className="text-text-secondary text-xs truncate">{a.applicant_email}</div>
            <div className="text-text-secondary text-xs">{formatPhone(a.applicant_phone)}</div>
          </div>
        );
      },
    }),
    columnHelper.display({
      id: "pet",
      header: "Pet",
      enableColumnFilter: false,
      cell: (info) => {
        const a = info.row.original;
        return (
          <div className="space-y-0.5">
            <div className="text-foreground font-medium text-sm">{a.pet_name}</div>
            <div className="text-text-secondary text-xs">{a.species}{a.breed ? ` / ${a.breed}` : ""}</div>
            {a.age_text && <div className="text-text-secondary text-xs">{a.age_text}</div>}
          </div>
        );
      },
    }),
    columnHelper.accessor((row) => row.status, {
      id: "status",
      header: "Status",
      filterFn: filterFns.equals,
      meta: { filterComponent: StatusFilter },
      cell: (info) => {
        const value = info.getValue();
        const opt = PET_APPLICATION_STATUS_OPTIONS.find((o) => o.value === value);
        return <span className="text-text-secondary text-sm">{opt?.label ?? value}</span>;
      },
    }),
    columnHelper.display({
      id: "story",
      header: "Story / Needs",
      enableColumnFilter: false,
      cell: (info) => {
        const a = info.row.original;
        const text = [a.story, a.needs ? `Needs: ${a.needs}` : null].filter(Boolean).join(" | ");
        return (
          <button
            onClick={(e) => {
              e.stopPropagation();
              info.row.toggleExpanded();
            }}
            className="text-left w-full cursor-pointer"
          >
            {info.row.getIsExpanded() ? (
              <span className="text-text-secondary whitespace-pre-wrap max-w-md">{text}</span>
            ) : (
              <span className="text-text-secondary max-w-xs truncate block">{text} <span className="text-xs text-text-secondary/50">▶</span></span>
            )}
          </button>
        );
      },
    }),
    columnHelper.display({
      id: "availability",
      header: "Availability",
      enableColumnFilter: false,
      cell: (info) => {
        const a = info.row.original;
        let slots: string[] = [];
        if (a.availability) {
          try {
            slots = JSON.parse(a.availability);
          } catch {
            slots = [];
          }
        }
        if (!slots.length) return <span className="text-text-secondary">—</span>;
        return (
          <div className="text-xs text-text-secondary space-y-0.5">
            {slots.map((s) => (
              <div key={s}>{s.replace(/_/g, " ")}</div>
            ))}
          </div>
        );
      },
    }),
    columnHelper.display({
      id: "waiver",
      header: "Waiver",
      enableColumnFilter: false,
      cell: (info) => {
        const a = info.row.original;
        return (
          <div className="text-xs text-text-secondary">
            {a.waiver_signed_at ? (
              <div>
                <div>Signed {formatDateTime(a.waiver_signed_at)}</div>
                <div className="truncate max-w-[160px]">{a.waiver_signer_name}</div>
              </div>
            ) : (
              <span>—</span>
            )}
          </div>
        );
      },
    }),
    columnHelper.accessor((row) => row.created_at, {
      id: "created_at",
      header: "Submitted",
      cell: (info) => (
        <span className="text-text-secondary">{formatDateTime(info.getValue())}</span>
      ),
      filterFn: filterFns.includesString,
    }),
    columnHelper.display({
      id: "actions",
      enableHiding: false,
      header: "",
      cell: (info) => {
        const a = info.row.original;
        return (
          <div className="flex flex-col gap-2">
            <button
              onClick={() => handleEdit(a)}
              className="rounded-lg border border-primary/10 px-3 py-1.5 text-xs font-medium text-foreground hover:bg-primary/5 transition-colors"
            >
              Edit
            </button>
            {a.status !== "converted" && (
              <button
                onClick={() => handleConvert(a)}
                disabled={convertingId === a.id || isPending}
                className="rounded-lg border border-primary/10 px-3 py-1.5 text-xs font-medium text-foreground hover:bg-primary/5 transition-colors disabled:opacity-50"
              >
                {convertingId === a.id ? "Converting..." : "Convert to animal"}
              </button>
            )}
            {a.converted_animal_id && (
              <span className="text-xs text-text-secondary">Animal #{a.converted_animal_id}</span>
            )}
          </div>
        );
      },
    }),
  ], [convertingId, isPending]);

  const typedColumns = columns as unknown as ColumnDef<PetApplication, unknown>[];

  return (
    <section className="space-y-6">
      {actionError && (
        <div className="rounded-lg bg-red-50 p-4 text-red-600" role="alert">
          {actionError}
        </div>
      )}
      <Modal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditing(null);
          setActionError(null);
        }}
        title="Edit Application"
      >
        <div className="space-y-4">
          {editing && (
            <p className="text-sm text-text-secondary">
              {editing.pet_name} — {editing.applicant_name}
            </p>
          )}
          <div>
            <label htmlFor="pa-status" className="block text-sm font-medium text-foreground mb-1">Status</label>
            <select
              id="pa-status"
              value={editStatus}
              onChange={(e) => setEditStatus(e.target.value as PetApplicationStatus)}
              className="w-full rounded-lg border border-primary/10 bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {PET_APPLICATION_STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="pa-notes" className="block text-sm font-medium text-foreground mb-1">Internal Notes</label>
            <textarea
              id="pa-notes"
              value={editNotes}
              onChange={(e) => setEditNotes(e.target.value)}
              rows={4}
              placeholder="Add internal notes about this application..."
              className="w-full rounded-lg border border-primary/10 bg-background px-3 py-2 text-sm text-foreground placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          {actionError && <p className="text-sm text-red-500">{actionError}</p>}
          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => {
                setModalOpen(false);
                setEditing(null);
                setActionError(null);
              }}
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
        data={applications}
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
        initialColumnPinning={{ left: ["applicant"], right: ["actions"] }}
        initialSorting={[{ id: "created_at", desc: true }]}
        pageSize={25}
        storageKey="pet-applications-column-visibility"
      />
    </section>
  );
}