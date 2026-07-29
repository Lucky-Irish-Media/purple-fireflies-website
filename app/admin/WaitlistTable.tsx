"use client";

import { useMemo, useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import type { WaitlistEntryWithParticipant } from "@/app/lib/definitions";
import { DataTable } from "./components/DataTable";
import { Modal } from "./components/Modal";
import { formatDate, formatPhone, formatDateTime, getMealTypeLabel, getMealTypeBadge, getWaitlistStatusBadge, DeliveryDateFilter, deliveryDateFilterFn } from "./lib/utils";
import { createColumnHelper, type ColumnDef } from "@tanstack/react-table";
import { convertWaitlistToSignupAction, notifyWaitlistEntryAction, removeWaitlistEntryAction } from "@/app/actions/admin-waitlist";

const columnHelper = createColumnHelper<WaitlistEntryWithParticipant>();

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
      <option value="waiting">Waiting</option>
      <option value="notified">Notified</option>
      <option value="converted">Converted</option>
      <option value="expired">Expired</option>
    </select>
  );
}

function NameFilter({ column }: { column: any }) {
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

export function WaitlistTable({ initialData }: { initialData: WaitlistEntryWithParticipant[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [selectedEntry, setSelectedEntry] = useState<WaitlistEntryWithParticipant | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const columns = useMemo<ColumnDef<WaitlistEntryWithParticipant, any>[]>(() => [
    columnHelper.accessor("participant_name", {
      header: "Name",
      filterFn: "includesString",
      meta: { filterComponent: NameFilter },
      cell: (info) => <span className="text-foreground font-medium">{info.getValue()}</span>,
    }),
    columnHelper.accessor("participant_email", {
      header: "Email",
      cell: (info) => <span className="text-text-secondary">{info.getValue()}</span>,
    }),
    columnHelper.accessor("participant_phone", {
      header: "Phone",
      cell: (info) => <span className="text-text-secondary">{formatPhone(info.getValue())}</span>,
    }),
    columnHelper.accessor("delivery_date", {
      header: "Delivery Date",
      filterFn: deliveryDateFilterFn,
      meta: { filterComponent: DeliveryDateFilter },
      cell: (info) => <span className="text-text-secondary">{formatDate(info.getValue())}</span>,
    }),
    columnHelper.accessor("regular_quantity", {
      header: "Meals",
      enableColumnFilter: false,
      cell: (info) => {
        const row = info.row.original;
        return getMealTypeBadge(getMealTypeLabel(row.regular_quantity, row.vegan_quantity));
      },
    }),
    columnHelper.accessor("status", {
      header: "Status",
      meta: { filterComponent: StatusFilter },
      cell: (info) => getWaitlistStatusBadge(info.getValue()),
    }),
    columnHelper.accessor("created_at", {
      header: "Added",
      enableColumnFilter: false,
      cell: (info) => <span className="text-text-secondary">{formatDateTime(info.getValue())}</span>,
    }),
    columnHelper.display({
      id: "actions",
      header: "Actions",
      enableColumnFilter: false,
      cell: ({ row }) => {
        const entry = row.original;
        if (entry.status !== "waiting") return null;
        return (
          <div className="flex gap-1.5">
            <button
              onClick={() => setSelectedEntry(entry)}
              className="rounded-lg border border-primary/10 px-3 py-1.5 text-xs font-medium text-foreground hover:bg-primary/5 transition-colors"
            >
              Convert to Signup
            </button>
            <button
              onClick={() => handleNotify(entry)}
              disabled={isPending}
              className="rounded-lg border border-primary/10 px-3 py-1.5 text-xs font-medium text-foreground hover:bg-primary/5 transition-colors disabled:opacity-50"
            >
              Notify
            </button>
            <button
              onClick={() => handleRemove(entry)}
              disabled={isPending}
              className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
            >
              Remove
            </button>
          </div>
        );
      },
    }),
  ], [isPending]);

  async function handleNotify(entry: WaitlistEntryWithParticipant) {
    startTransition(async () => {
      const result = await notifyWaitlistEntryAction(entry.id);
      setActionMessage(result.message);
      if (result.success) router.refresh();
    });
  }

  async function handleRemove(entry: WaitlistEntryWithParticipant) {
    if (!confirm(`Remove ${entry.participant_name} from the waitlist for ${entry.delivery_date}?`)) return;
    startTransition(async () => {
      const result = await removeWaitlistEntryAction(entry.id);
      setActionMessage(result.message);
      if (result.success) router.refresh();
    });
  }

  async function handleConvert(formData: FormData) {
    startTransition(async () => {
      const result = await convertWaitlistToSignupAction(formData);
      if (result.success) {
        setSelectedEntry(null);
        router.refresh();
      } else {
        setActionMessage(result.message);
      }
    });
  }

  return (
    <section>
      <h2 className="text-xl font-bold text-foreground mb-4">Waitlist</h2>
      {actionMessage && (
        <div className="mb-4 rounded-lg bg-blue-50 p-3 text-sm text-blue-700" role="alert">
          {actionMessage}
        </div>
      )}
      <DataTable columns={columns} data={initialData} />

      {selectedEntry && (
        <Modal open={true} onClose={() => setSelectedEntry(null)} title="Convert to Signup">
          <div className="space-y-4">
            <p className="text-sm text-text-secondary">
              Create a meal signup for <strong>{selectedEntry.participant_name}</strong> on <strong>{formatDate(selectedEntry.delivery_date)}</strong>.
            </p>
            <form action={handleConvert} className="space-y-3">
              <input type="hidden" name="waitlistId" value={selectedEntry.id} />
              <div className="space-y-1">
                <label className="block text-sm font-medium text-foreground">Regular meals</label>
                <select
                  name="regularQuantity"
                  defaultValue={selectedEntry.regular_quantity}
                  className="w-full rounded border border-primary/10 bg-background px-3 py-2 text-sm text-foreground"
                >
                  <option value={0}>0</option>
                  <option value={1}>1</option>
                  <option value={2}>2</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="block text-sm font-medium text-foreground">Vegan / GF meals</label>
                <select
                  name="veganQuantity"
                  defaultValue={selectedEntry.vegan_quantity}
                  className="w-full rounded border border-primary/10 bg-background px-3 py-2 text-sm text-foreground"
                >
                  <option value={0}>0</option>
                  <option value={1}>1</option>
                  <option value={2}>2</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedEntry(null)}
                  className="rounded-lg border border-primary/10 px-4 py-2 text-sm text-foreground hover:bg-primary/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="rounded-lg bg-primary px-4 py-2 text-sm text-white hover:bg-primary/90 disabled:opacity-50"
                >
                  {isPending ? "Converting..." : "Convert & Sign Up"}
                </button>
              </div>
            </form>
          </div>
        </Modal>
      )}
    </section>
  );
}
