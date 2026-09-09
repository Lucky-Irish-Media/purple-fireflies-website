"use client";

import { useMemo, useState, useTransition, useEffect, useRef } from "react";
import type { LegalObserverRequest, LoRequestStatus } from "@/app/lib/definitions";
import { LO_REQUEST_STATUS_OPTIONS } from "@/app/lib/definitions";
import { updateLegalObserverRequestAction } from "@/app/actions/legal-observer";
import { DataTable } from "../../components/DataTable";
import { Modal } from "../../components/Modal";
import { formatDate, formatPhone, formatDateTime, getRequestStatusBadge } from "../../lib/utils";
import { createColumnHelper, type ColumnDef, filterFns } from "@tanstack/react-table";

const columnHelper = createColumnHelper<LegalObserverRequest>();

function RequesterFilter({ column }: { column: any }) {
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
      {LO_REQUEST_STATUS_OPTIONS.map((opt) => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  );
}

function requesterFilterFn(row: any, _columnId: string, filterValue: string): boolean {
  if (!filterValue) return true;
  const r = row.original;
  const search = String(filterValue).toLowerCase();
  return (
    r.contact_name?.toLowerCase().includes(search) ||
    r.contact_email?.toLowerCase().includes(search) ||
    r.contact_phone?.includes(search)
  );
}

export function LegalObserverRequestsTable({ initialData }: { initialData: LegalObserverRequest[] }) {
  const [isPending, startTransition] = useTransition();
  const [requests, setRequests] = useState(initialData);
  const prevInitialData = useRef(initialData);
  useEffect(() => {
    if (prevInitialData.current !== initialData) {
      setRequests(initialData);
      prevInitialData.current = initialData;
    }
  }, [initialData]);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingRequest, setEditingRequest] = useState<LegalObserverRequest | null>(null);
  const [editStatus, setEditStatus] = useState<LoRequestStatus>("pending");
  const [editNotes, setEditNotes] = useState("");
  const [actionError, setActionError] = useState<string | null>(null);

  function handleEdit(request: LegalObserverRequest) {
    setEditingRequest(request);
    setEditStatus(request.status);
    setEditNotes(request.internal_notes || "");
    setActionError(null);
    setModalOpen(true);
  }

  function handleSave() {
    if (!editingRequest) return;
    setActionError(null);
    startTransition(async () => {
      const result = await updateLegalObserverRequestAction(editingRequest.id, editStatus, editNotes.trim() || null);
      if (result.success && result.requests) {
        setRequests(result.requests);
        setModalOpen(false);
        setEditingRequest(null);
      } else {
        setActionError(result.message);
      }
    });
  }

  const columns = useMemo(() => [
    columnHelper.display({
      id: "requester",
      header: "Requester",
      filterFn: requesterFilterFn,
      meta: { filterComponent: RequesterFilter },
      cell: (info) => {
        const r = info.row.original;
        return (
          <div className="space-y-0.5 max-w-[220px]">
            <div className="text-foreground font-medium text-sm">{r.contact_name}</div>
            <div className="text-text-secondary text-xs truncate">{r.contact_email}</div>
            <div className="text-text-secondary text-xs">{formatPhone(r.contact_phone)}</div>
          </div>
        );
      },
    }),
    columnHelper.accessor((row) => row.event_date, {
      id: "event",
      header: "Event",
      enableColumnFilter: false,
      cell: (info) => {
        const r = info.row.original;
        return (
          <div className="space-y-0.5">
            <div className="text-foreground font-medium text-sm">{formatDate(r.event_date)}</div>
            <div className="text-text-secondary text-xs">{r.event_time || ""}</div>
            <div className="text-text-secondary text-xs truncate max-w-[220px]">{r.event_location}</div>
            {r.event_type && <div className="text-text-secondary text-xs">{r.event_type}</div>}
          </div>
        );
      },
    }),
    columnHelper.accessor((row) => row.status, {
      id: "status",
      header: "Status",
      filterFn: filterFns.equals,
      meta: { filterComponent: StatusFilter },
      cell: (info) => getRequestStatusBadge(info.getValue()),
    }),
    columnHelper.display({
      id: "special_notes",
      header: "Request Notes",
      enableColumnFilter: false,
      cell: (info) => {
        const value = info.row.original.special_notes;
        if (!value) return <span className="text-text-secondary">—</span>;
        return (
          <button
            onClick={(e) => {
              e.stopPropagation();
              info.row.toggleExpanded();
            }}
            className="text-left w-full cursor-pointer"
          >
            {info.row.getIsExpanded() ? (
              <span className="text-text-secondary whitespace-pre-wrap max-w-md">{value}</span>
            ) : (
              <span className="text-text-secondary max-w-xs truncate block">{value} <span className="text-xs text-text-secondary/50">▶</span></span>
            )}
          </button>
        );
      },
    }),
    columnHelper.display({
      id: "internal_notes",
      header: "Internal Notes",
      enableColumnFilter: false,
      cell: (info) => {
        const value = info.row.original.internal_notes;
        if (!value) return <span className="text-text-secondary">—</span>;
        return (
          <button
            onClick={(e) => {
              e.stopPropagation();
              info.row.toggleExpanded();
            }}
            className="text-left w-full cursor-pointer"
          >
            {info.row.getIsExpanded() ? (
              <span className="text-text-secondary whitespace-pre-wrap max-w-md">{value}</span>
            ) : (
              <span className="text-text-secondary max-w-xs truncate block">{value} <span className="text-xs text-text-secondary/50">▶</span></span>
            )}
          </button>
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
      cell: (info) => (
        <button
          onClick={() => handleEdit(info.row.original)}
          className="rounded-lg border border-primary/10 px-3 py-1.5 text-xs font-medium text-foreground hover:bg-primary/5 transition-colors"
        >
          Edit
        </button>
      ),
    }),
  ], []);

  const typedColumns = columns as unknown as ColumnDef<LegalObserverRequest, unknown>[];

  return (
    <section className="space-y-6">
      <Modal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingRequest(null);
          setActionError(null);
        }}
        title="Edit Coverage Request"
      >
        <div className="space-y-4">
          {editingRequest && (
            <p className="text-sm text-text-secondary">
              {editingRequest.contact_name} — {formatDate(editingRequest.event_date)}
            </p>
          )}

          <div>
            <label htmlFor="lo-status" className="block text-sm font-medium text-foreground mb-1">Status</label>
            <select
              id="lo-status"
              value={editStatus}
              onChange={(e) => setEditStatus(e.target.value as LoRequestStatus)}
              className="w-full rounded-lg border border-primary/10 bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {LO_REQUEST_STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="lo-notes" className="block text-sm font-medium text-foreground mb-1">Internal Notes</label>
            <textarea
              id="lo-notes"
              value={editNotes}
              onChange={(e) => setEditNotes(e.target.value)}
              rows={4}
              placeholder="Add internal notes about this request..."
              className="w-full rounded-lg border border-primary/10 bg-background px-3 py-2 text-sm text-foreground placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {actionError && <p className="text-sm text-red-500">{actionError}</p>}

          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => {
                setModalOpen(false);
                setEditingRequest(null);
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
        data={requests}
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
        initialColumnPinning={{ left: ["requester"], right: ["actions"] }}
        initialSorting={[{ id: "event", desc: false }]}
        pageSize={25}
        storageKey="lo-requests-column-visibility"
      />
    </section>
  );
}