"use client";

import { useMemo, useState, useTransition, useEffect, useRef } from "react";
import type { LegalObserverRequest, LoRequestStatus } from "@/app/lib/definitions";
import { LO_REQUEST_STATUS_OPTIONS } from "@/app/lib/definitions";
import { updateLegalObserverRequestAction } from "@/app/actions/legal-observer";
import { DataTable } from "../../components/DataTable";
import { Modal } from "../../components/Modal";
import { formatDate, formatPhone, formatDateTime, getRequestStatusBadge } from "../../lib/utils";
import { createColumnHelper, type ColumnDef } from "@tanstack/react-table";

const columnHelper = createColumnHelper<LegalObserverRequest>();

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
    columnHelper.accessor("contact_name", {
      header: "Contact Name",
      cell: (info) => (
        <span className="text-foreground font-medium">{info.getValue()}</span>
      ),
    }),
    columnHelper.accessor("contact_email", {
      header: "Email",
      cell: (info) => (
        <span className="text-text-secondary">{info.getValue()}</span>
      ),
    }),
    columnHelper.accessor("contact_phone", {
      header: "Phone",
      cell: (info) => (
        <span className="text-text-secondary">{formatPhone(info.getValue())}</span>
      ),
    }),
    columnHelper.accessor("event_date", {
      header: "Event Date",
      cell: (info) => (
        <span className="text-text-secondary">{formatDate(info.getValue())}</span>
      ),
    }),
    columnHelper.accessor("event_time", {
      header: "Time",
      cell: (info) => (
        <span className="text-text-secondary">{info.getValue() || "—"}</span>
      ),
    }),
    columnHelper.accessor("event_location", {
      header: "Location",
      cell: (info) => (
        <span className="text-text-secondary">{info.getValue()}</span>
      ),
    }),
    columnHelper.accessor("event_type", {
      header: "Event Type",
      cell: (info) => (
        <span className="text-text-secondary">{info.getValue() || "—"}</span>
      ),
    }),
    columnHelper.accessor("special_notes", {
      header: "Notes",
      cell: (info) => (
        <span className="text-text-secondary">{info.getValue() || "—"}</span>
      ),
    }),
    columnHelper.accessor("status", {
      header: "Status",
      cell: (info) => getRequestStatusBadge(info.getValue()),
    }),
    columnHelper.accessor("internal_notes", {
      header: "Internal Notes",
      cell: (info) => {
        const notes = info.getValue();
        if (!notes) return <span className="text-text-secondary">—</span>;
        return (
          <span className="text-text-secondary" title={notes}>
            {notes.length > 40 ? notes.slice(0, 40) + "…" : notes}
          </span>
        );
      },
    }),
    columnHelper.accessor("created_at", {
      header: "Submitted",
      cell: (info) => (
        <span className="text-text-secondary">{formatDateTime(info.getValue())}</span>
      ),
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
        enableGlobalFilter
        enableColumnPinning
        initialColumnPinning={{ left: ["contact_name"], right: ["actions"] }}
        initialSorting={[{ id: "event_date", desc: false }]}
        pageSize={25}
        storageKey="lo-requests-column-visibility"
      />
    </section>
  );
}
