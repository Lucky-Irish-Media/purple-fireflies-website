"use client";

import { useState, useActionState, useMemo } from "react";
import type { NewsletterSubscriber } from "@/app/lib/definitions";
import type { ColumnDef } from "@tanstack/react-table";
import {
  createSubscriberAction,
  updateSubscriberAction,
  deleteSubscriberAction,
  type AdminSubscriberActionState,
} from "@/app/actions/admin-newsletter-subscribers";
import { DataTable } from "./components/DataTable";
import { Modal } from "./components/Modal";
import { formatDateTime } from "./lib/utils";
import { createColumnHelper, filterFns } from "@tanstack/react-table";

const columnHelper = createColumnHelper<NewsletterSubscriber>();

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
      <option value="pending">Pending</option>
      <option value="confirmed">Confirmed</option>
      <option value="unsubscribed">Unsubscribed</option>
    </select>
  );
}

function getStatusBadge(status: string) {
  const colors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    confirmed: "bg-green-100 text-green-800",
    unsubscribed: "bg-gray-100 text-gray-700",
  };
  const color = colors[status] || "bg-gray-100 text-gray-700";
  const label = status.charAt(0).toUpperCase() + status.slice(1);
  return (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${color}`}>
      {label}
    </span>
  );
}

function renderTags(tags: string) {
  const list = (tags || "")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
  if (list.length === 0) return <span className="text-text-secondary">—</span>;
  return (
    <div className="flex flex-wrap gap-1">
      {list.map((tag, i) => (
        <span
          key={i}
          className="inline-flex rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-foreground"
        >
          {tag}
        </span>
      ))}
    </div>
  );
}

export default function NewsletterSubscribersTable({
  initialSubscribers,
  counts,
  canManage = false,
}: {
  initialSubscribers: NewsletterSubscriber[];
  counts: { pending: number; confirmed: number; unsubscribed: number; total: number };
  canManage?: boolean;
}) {
  const [subscribers, setSubscribers] = useState(initialSubscribers);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<NewsletterSubscriber | null>(null);
  const [actionMessage, setActionMessage] = useState<{ text: string; success: boolean } | null>(null);

  const liveCounts = {
    total: subscribers.length,
    pending: subscribers.filter((s) => s.status === "pending").length,
    confirmed: subscribers.filter((s) => s.status === "confirmed").length,
    unsubscribed: subscribers.filter((s) => s.status === "unsubscribed").length,
  };
  const allTags = Array.from(
    new Set(
      subscribers.flatMap((s) =>
        (s.tags || "")
          .split(",")
          .map((t) => t.trim().toLowerCase())
          .filter(Boolean),
      ),
    ),
  ).sort();

  const [createState, createAction, createPending] = useActionState<AdminSubscriberActionState, FormData>(
    async (prev, formData) => {
      const result = await createSubscriberAction(prev, formData);
      if (result?.subscribers) {
        setSubscribers(result.subscribers);
        setModalOpen(false);
        setActionMessage({ text: result.message || "", success: result.success ?? true });
      } else if (result?.message) {
        setActionMessage({ text: result.message, success: result.success ?? false });
      }
      return result;
    },
    undefined,
  );

  const [updateState, updateAction, updatePending] = useActionState<AdminSubscriberActionState, FormData>(
    async (prev, formData) => {
      const result = await updateSubscriberAction(prev, formData);
      if (result?.subscribers) {
        setSubscribers(result.subscribers);
        setModalOpen(false);
        setEditing(null);
        setActionMessage({ text: result.message || "", success: result.success ?? true });
      } else if (result?.message) {
        setActionMessage({ text: result.message, success: result.success ?? false });
      }
      return result;
    },
    undefined,
  );

  const [, deleteAction, deletePending] = useActionState<AdminSubscriberActionState, FormData>(
    async (prev, formData) => {
      const result = await deleteSubscriberAction(prev, formData);
      if (result?.subscribers) {
        setSubscribers(result.subscribers);
        setActionMessage({ text: result.message || "", success: result.success ?? true });
      } else if (result?.message) {
        setActionMessage({ text: result.message, success: result.success ?? false });
      }
      return result;
    },
    undefined,
  );

  const formState = editing ? updateState : createState;
  const formPending = editing ? updatePending : createPending;
  const formAction = editing ? updateAction : createAction;

  function openCreate() {
    setEditing(null);
    setModalOpen(true);
  }
  function openEdit(s: NewsletterSubscriber) {
    setEditing(s);
    setModalOpen(true);
  }
  function closeModal() {
    setModalOpen(false);
    setEditing(null);
  }

  const columns = useMemo(() => {
    return [
      columnHelper.accessor((row) => row.email, {
        id: "email",
        header: "Email",
        cell: (info) => <span className="text-text-secondary">{info.getValue()}</span>,
        filterFn: filterFns.includesString,
      }),
      columnHelper.accessor((row) => row.name, {
        id: "name",
        header: "Name",
        cell: (info) => {
          const v = info.getValue();
          return <span className="text-foreground font-medium">{v ? v : "—"}</span>;
        },
        filterFn: filterFns.includesString,
      }),
      columnHelper.accessor((row) => row.status, {
        id: "status",
        header: "Status",
        filterFn: filterFns.equals,
        meta: { filterComponent: StatusFilter },
        cell: (info) => getStatusBadge(info.getValue()),
      }),
      columnHelper.accessor((row) => row.tags, {
        id: "tags",
        header: "Tags",
        cell: (info) => renderTags(info.getValue()),
        filterFn: filterFns.includesString,
      }),
      columnHelper.accessor((row) => row.created_at, {
        id: "created_at",
        header: "Signed Up",
        cell: (info) => <span className="text-text-secondary">{formatDateTime(info.getValue())}</span>,
      }),
      columnHelper.accessor((row) => row.confirmed_at, {
        id: "confirmed_at",
        header: "Confirmed",
        cell: (info) => {
          const v = info.getValue();
          return <span className="text-text-secondary">{v ? formatDateTime(v) : "—"}</span>;
        },
      }),
      ...(canManage
        ? [
            columnHelper.display({
              id: "actions",
              header: "Actions",
              enableColumnFilter: false,
              cell: (info) => {
                const s = info.row.original;
                return (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEdit(s)}
                      className="rounded-lg border border-primary/10 px-3 py-1.5 text-xs font-medium text-foreground hover:bg-primary/5 transition-colors"
                    >
                      Edit
                    </button>
                    <form
                      action={deleteAction}
                      className="inline"
                      onSubmit={(e) => {
                        if (!confirm(`Delete subscriber "${s.email}"?`)) e.preventDefault();
                      }}
                    >
                      <input type="hidden" name="id" value={s.id} />
                      <button
                        type="submit"
                        disabled={deletePending}
                        className="rounded-lg bg-red-100 px-3 py-1.5 text-xs font-medium text-red-800 transition-all hover:bg-red-200 disabled:opacity-50"
                      >
                        Delete
                      </button>
                    </form>
                  </div>
                );
              },
            }),
          ]
        : []),
    ];
  }, [canManage, deletePending, deleteAction]) as ColumnDef<NewsletterSubscriber, unknown>[];

  return (
    <section className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <h2 className="text-xl font-bold text-foreground">Newsletter Subscribers</h2>
        {canManage && (
          <button
            onClick={openCreate}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-primary-dark"
          >
            New Subscriber
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-4 text-sm text-text-secondary">
        <span>Total: <span className="font-medium text-foreground">{liveCounts.total}</span></span>
        <span>Pending: <span className="font-medium text-foreground">{liveCounts.pending}</span></span>
        <span>Confirmed: <span className="font-medium text-foreground">{liveCounts.confirmed}</span></span>
        <span>Unsubscribed: <span className="font-medium text-foreground">{liveCounts.unsubscribed}</span></span>
      </div>

      {actionMessage && (
        <p className={`text-sm ${actionMessage.success ? "text-green-600" : "text-red-500"}`}>
          {actionMessage.text}
        </p>
      )}

      <DataTable
        data={subscribers}
        columns={columns}
        enableSorting
        enableFiltering
        enablePagination
        enableGlobalFilter
        enableColumnPinning
        enableColumnResizing
        enableFacetedFilters
        initialColumnPinning={{ left: ["email"], right: canManage ? ["actions"] : [] }}
        pageSize={15}
      />

      <Modal open={modalOpen} onClose={closeModal} title={editing ? "Edit Subscriber" : "New Subscriber"}>
        <form action={formAction} className="space-y-4">
          {editing && <input type="hidden" name="id" value={editing.id} />}
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Email</label>
              <input
                name="email"
                type="email"
                required
                defaultValue={editing?.email || ""}
                className="w-full rounded-lg border border-primary/10 bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
              {formState?.errors?.email && <p className="mt-1 text-sm text-red-500">{formState.errors.email[0]}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Name</label>
              <input
                name="name"
                type="text"
                defaultValue={editing?.name || ""}
                className="w-full rounded-lg border border-primary/10 bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
              {formState?.errors?.name && <p className="mt-1 text-sm text-red-500">{formState.errors.name[0]}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Tags (comma-separated)</label>
              <input
                name="tags"
                type="text"
                list="subscriber-tag-options"
                defaultValue={editing?.tags || ""}
                placeholder="e.g. recipient, volunteer"
                className="w-full rounded-lg border border-primary/10 bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <datalist id="subscriber-tag-options">
                {allTags.map((tag) => (
                  <option key={tag} value={tag} />
                ))}
              </datalist>
              {formState?.errors?.tags && <p className="mt-1 text-sm text-red-500">{formState.errors.tags[0]}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Status</label>
              <select
                name="status"
                defaultValue={editing?.status || "pending"}
                className="w-full rounded-lg border border-primary/10 bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="unsubscribed">Unsubscribed</option>
              </select>
              {formState?.errors?.status && <p className="mt-1 text-sm text-red-500">{formState.errors.status[0]}</p>}
            </div>
          </div>

          {formState?.message && !formState.success && (
            <p className="text-sm text-red-500">{formState.message}</p>
          )}

          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={closeModal}
              className="rounded-lg border border-primary/10 px-3 py-1.5 text-xs font-medium text-foreground hover:bg-primary/5 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={formPending}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-primary-dark disabled:opacity-50"
            >
              {formPending ? "Saving..." : editing ? "Save Changes" : "Create Subscriber"}
            </button>
          </div>
        </form>
      </Modal>
    </section>
  );
}
