"use client";

import { useMemo, useTransition, useState, useActionState } from "react";
import { useRouter } from "next/navigation";
import type { WaitlistEntryWithParticipant } from "@/app/lib/definitions";
import { DataTable } from "./components/DataTable";
import { Modal } from "./components/Modal";
import { formatDate, formatPhone, formatDateTime, getDeliveryDayBadge, getWaitlistStatusBadge, DeliveryDateFilter, deliveryDateFilterFn, requesterFilterFn, mealsFilterFn } from "./lib/utils";
import { createColumnHelper, type ColumnDef, filterFns } from "@tanstack/react-table";
import { getDeliveryDay } from "@/app/lib/delivery-day";
import { convertWaitlistToSignupAction, notifyWaitlistEntryAction, removeWaitlistEntryAction, duplicateWaitlistEntryAction, createWaitlistEntryAction, type AdminWaitlistActionState } from "@/app/actions/admin-waitlist";

const STATE_OPTIONS = [
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA",
  "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
  "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
  "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC",
  "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY"
];

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

function MealsFilter({ column }: { column: any }) {
  return (
    <select
      value={(column.getFilterValue() as string) || ""}
      onChange={(e) => {
        e.stopPropagation();
        column.setFilterValue(e.target.value || undefined);
      }}
      className="w-full rounded border border-primary/10 bg-background px-2 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
    >
      <option value="">All</option>
      <option value="regular">Regular Only</option>
      <option value="vegan">Vegan Only</option>
      <option value="both">Both</option>
    </select>
  );
}

function WaitlistFormFields({ state, entry, formPending, editing }: {
  state: AdminWaitlistActionState;
  entry: WaitlistEntryWithParticipant | null;
  formPending: boolean;
  editing: boolean;
}) {
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label htmlFor="wl-name" className="block text-sm font-medium text-foreground mb-1">Name</label>
          <input id="wl-name" name="name" type="text" required defaultValue={entry?.participant_name || ""}
            className="w-full rounded-lg border border-primary/10 bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
          {state?.errors?.name && <p className="mt-1 text-sm text-red-500">{state.errors.name[0]}</p>}
        </div>
        <div>
          <label htmlFor="wl-email" className="block text-sm font-medium text-foreground mb-1">Email</label>
          <input id="wl-email" name="email" type="email" required defaultValue={entry?.participant_email || ""}
            className="w-full rounded-lg border border-primary/10 bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
          {state?.errors?.email && <p className="mt-1 text-sm text-red-500">{state.errors.email[0]}</p>}
        </div>
        <div>
          <label htmlFor="wl-phone" className="block text-sm font-medium text-foreground mb-1">Phone</label>
          <input id="wl-phone" name="phone" type="text" required defaultValue={entry?.participant_phone || ""}
            className="w-full rounded-lg border border-primary/10 bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
          {state?.errors?.phone && <p className="mt-1 text-sm text-red-500">{state.errors.phone[0]}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="wl-address1" className="block text-sm font-medium text-foreground mb-1">Address Line 1</label>
          <input id="wl-address1" name="address1" type="text" required defaultValue={entry?.participant_address1 || ""}
            className="w-full rounded-lg border border-primary/10 bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
          {state?.errors?.address1 && <p className="mt-1 text-sm text-red-500">{state.errors.address1[0]}</p>}
        </div>
        <div>
          <label htmlFor="wl-address2" className="block text-sm font-medium text-foreground mb-1">Address Line 2</label>
          <input id="wl-address2" name="address2" type="text" defaultValue={entry?.participant_address2 || ""}
            className="w-full rounded-lg border border-primary/10 bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
          {state?.errors?.address2 && <p className="mt-1 text-sm text-red-500">{state.errors.address2[0]}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div>
          <label htmlFor="wl-city" className="block text-sm font-medium text-foreground mb-1">City</label>
          <input id="wl-city" name="city" type="text" required defaultValue={entry?.participant_city || ""}
            className="w-full rounded-lg border border-primary/10 bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
          {state?.errors?.city && <p className="mt-1 text-sm text-red-500">{state.errors.city[0]}</p>}
        </div>
        <div>
          <label htmlFor="wl-state" className="block text-sm font-medium text-foreground mb-1">State</label>
          <select id="wl-state" name="state" required defaultValue={entry?.participant_state || "OH"}
            className="w-full rounded-lg border border-primary/10 bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">Select</option>
            {STATE_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          {state?.errors?.state && <p className="mt-1 text-sm text-red-500">{state.errors.state[0]}</p>}
        </div>
        <div>
          <label htmlFor="wl-zipCode" className="block text-sm font-medium text-foreground mb-1">ZIP Code</label>
          <input id="wl-zipCode" name="zipCode" type="text" required defaultValue={entry?.participant_zip_code || ""}
            className="w-full rounded-lg border border-primary/10 bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
          {state?.errors?.zipCode && <p className="mt-1 text-sm text-red-500">{state.errors.zipCode[0]}</p>}
        </div>
        <div>
          <label htmlFor="wl-deliveryDate" className="block text-sm font-medium text-foreground mb-1">Delivery Date</label>
          <input id="wl-deliveryDate" name="deliveryDate" type="date" required defaultValue={entry?.delivery_date || ""}
            className="w-full rounded-lg border border-primary/10 bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
          {state?.errors?.deliveryDate && <p className="mt-1 text-sm text-red-500">{state.errors.deliveryDate[0]}</p>}
        </div>
      </div>

      <fieldset className="space-y-2">
        <legend className="block text-sm font-medium text-foreground mb-1">Meals Requested</legend>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="wl-regularQty" className="block text-sm text-text-secondary mb-2">Regular meals:</label>
            <input
              id="wl-regularQty"
              name="regularQuantity"
              type="number"
              min={0}
              max={10}
              required
              defaultValue={entry?.regular_quantity ?? 1}
              className="w-full rounded-lg border border-primary/10 bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label htmlFor="wl-veganQty" className="block text-sm text-text-secondary mb-2">Vegan / GF meals:</label>
            <input
              id="wl-veganQty"
              name="veganQuantity"
              type="number"
              min={0}
              max={10}
              required
              defaultValue={entry?.vegan_quantity ?? 0}
              className="w-full rounded-lg border border-primary/10 bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>
        {state?.errors?.regularQuantity && (
          <p className="text-sm text-red-500" role="alert">
            {state.errors.regularQuantity[0]}
          </p>
        )}
        {state?.errors?.veganQuantity && (
          <p className="text-sm text-red-500" role="alert">
            {state.errors.veganQuantity[0]}
          </p>
        )}
      </fieldset>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div>
          <label htmlFor="wl-contactMethod" className="block text-sm font-medium text-foreground mb-1">Contact Method</label>
          <select id="wl-contactMethod" name="contactMethod" required defaultValue="call"
            className="w-full rounded-lg border border-primary/10 bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="call">Call</option>
            <option value="text">Text</option>
            <option value="email">Email</option>
          </select>
          {state?.errors?.contactMethod && <p className="mt-1 text-sm text-red-500">{state.errors.contactMethod[0]}</p>}
        </div>
        <div>
          <label htmlFor="wl-comments" className="block text-sm font-medium text-foreground mb-1">Comments</label>
          <textarea id="wl-comments" name="comments" rows={1} defaultValue={entry?.comments || ""}
            className="w-full rounded-lg border border-primary/10 bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="wl-internalNotes" className="block text-sm font-medium text-foreground mb-1">Internal Notes</label>
          <input id="wl-internalNotes" name="internalNotes" type="text" defaultValue=""
            className="w-full rounded-lg border border-primary/10 bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      {state?.message && !state?.errors && (
        <p className="text-sm text-green-600">{state.message}</p>
      )}

      <div className="flex justify-end gap-2 pt-2">
        <button
          type="submit"
          disabled={formPending}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-primary-dark disabled:opacity-50"
        >
          {formPending ? "Adding..." : "Add to Waitlist"}
        </button>
      </div>
    </>
  );
}

export function WaitlistTable({ initialData }: { initialData: WaitlistEntryWithParticipant[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [selectedEntry, setSelectedEntry] = useState<WaitlistEntryWithParticipant | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [duplicateModalOpen, setDuplicateModalOpen] = useState(false);
  const [duplicatingEntry, setDuplicatingEntry] = useState<WaitlistEntryWithParticipant | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const [createState, createAction, createPending] = useActionState<
    AdminWaitlistActionState,
    FormData
  >(async (prev, formData) => {
    const result = await createWaitlistEntryAction(prev, formData);
    if (result?.success) {
      setCreateModalOpen(false);
      router.refresh();
    }
    return result;
  }, undefined);

  const [duplicateState, duplicateAction, duplicatePending] = useActionState<
    { success: boolean; message: string },
    FormData
  >(async (prev, formData) => {
    const result = await duplicateWaitlistEntryAction(prev, formData);
    if (result.success) {
      setDuplicateModalOpen(false);
      setDuplicatingEntry(null);
      router.refresh();
    }
    return result;
  }, { success: false, message: "" });

  const columns = useMemo<ColumnDef<WaitlistEntryWithParticipant, any>[]>(() => [
    columnHelper.display({
      id: "requester",
      header: "Requester",
      filterFn: requesterFilterFn,
      meta: { filterComponent: RequesterFilter },
      cell: (info) => {
        const r = info.row.original;
        return (
          <div className="space-y-0.5 max-w-[220px]">
            <div className="text-foreground font-medium text-sm">{r.participant_name}</div>
            <div className="text-text-secondary text-xs truncate">{r.participant_email}</div>
            <div className="text-text-secondary text-xs truncate">
              {r.participant_address1}
              {r.participant_address2 && `, ${r.participant_address2}`}
              {`, ${r.participant_city}, ${r.participant_state} ${r.participant_zip_code}`}
            </div>
            <div className="text-text-secondary text-xs">{formatPhone(r.participant_phone)}</div>
          </div>
        );
      },
    }),
    columnHelper.display({
      id: "meals",
      header: "Meals",
      filterFn: mealsFilterFn,
      meta: { filterComponent: MealsFilter },
      cell: (info) => {
        const r = info.row.original;
        const parts: string[] = [];
        if (r.regular_quantity > 0) parts.push(`${r.regular_quantity} Regular`);
        if (r.vegan_quantity > 0) parts.push(`${r.vegan_quantity} Vegan`);
        return (
          <span className="text-foreground font-medium">{parts.join(" / ") || "—"}</span>
        );
      },
    }),
    columnHelper.accessor((row) => row.delivery_date, {
      id: "delivery",
      header: "Delivery",
      filterFn: deliveryDateFilterFn,
      meta: { filterComponent: DeliveryDateFilter },
      cell: (info) => {
        const r = info.row.original;
        return (
          <div className="space-y-0.5">
            <div className="text-text-secondary text-sm">{formatDate(r.delivery_date)}</div>
            <div className="text-xs">{getDeliveryDayBadge(getDeliveryDay(r.delivery_date))}</div>
          </div>
        );
      },
    }),
    columnHelper.accessor((row) => row.status, {
      id: "status",
      header: "Status",
      filterFn: filterFns.equals,
      meta: { filterComponent: StatusFilter },
      cell: (info) => getWaitlistStatusBadge(info.getValue()),
    }),
    columnHelper.display({
      id: "comments",
      header: "Comments",
      enableColumnFilter: false,
      cell: (info) => {
        const value = info.row.original.comments;
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
      header: "Added",
      cell: (info) => (
        <span className="text-text-secondary">{formatDateTime(info.getValue())}</span>
      ),
      filterFn: filterFns.includesString,
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
              onClick={() => {
                setDuplicatingEntry(entry);
                setDuplicateModalOpen(true);
              }}
              className="rounded-lg border border-primary/10 px-3 py-1.5 text-xs font-medium text-foreground hover:bg-primary/5 transition-colors"
            >
              Duplicate
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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
        <h2 className="text-xl font-bold text-foreground">Waitlist</h2>
        <button
          onClick={() => setCreateModalOpen(true)}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-primary-dark"
        >
          Add to Waitlist
        </button>
      </div>
      {actionMessage && (
        <div className="mb-4 rounded-lg bg-blue-50 p-3 text-sm text-blue-700" role="alert">
          {actionMessage}
        </div>
      )}
      <DataTable
        columns={columns}
        data={initialData}
        enableSorting
        enableFiltering
        enablePagination
        enableExpanding
        enableColumnVisibility
        enableGlobalFilter
        enableColumnPinning
        enableColumnResizing
        enableFacetedFilters
        initialVisibility={{ created_at: false }}
        initialColumnPinning={{ left: ["requester"], right: ["actions"] }}
        initialSorting={[{ id: "delivery", desc: true }]}
        pageSize={15}
        storageKey="waitlist-column-visibility"
      />

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

      {duplicateModalOpen && duplicatingEntry && (
        <Modal
          open={true}
          onClose={() => {
            setDuplicateModalOpen(false);
            setDuplicatingEntry(null);
          }}
          title="Duplicate Waitlist Entry"
        >
          <form action={duplicateAction} className="space-y-4">
            <input type="hidden" name="id" value={duplicatingEntry.id} />
            <p className="text-sm text-text-secondary">
              Duplicate the waitlist entry for <strong>{duplicatingEntry.participant_name}</strong> ({duplicatingEntry.regular_quantity} regular, {duplicatingEntry.vegan_quantity} vegan) to a new date.
            </p>
            <div>
              <label htmlFor="dup-waitlist-deliveryDate" className="block text-sm font-medium text-foreground mb-1">
                New Delivery Date
              </label>
              <input id="dup-waitlist-deliveryDate" name="deliveryDate" type="date" required
                className="w-full rounded-lg border border-primary/10 bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            {duplicateState?.message && !duplicateState?.success && (
              <p className="text-sm text-red-500">{duplicateState.message}</p>
            )}
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setDuplicateModalOpen(false);
                  setDuplicatingEntry(null);
                }}
                className="rounded-lg border border-primary/10 px-4 py-2 text-sm text-foreground hover:bg-primary/5"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={duplicatePending}
                className="rounded-lg bg-primary px-4 py-2 text-sm text-white hover:bg-primary/90 disabled:opacity-50"
              >
                {duplicatePending ? "Duplicating..." : "Duplicate Entry"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {createModalOpen && (
        <Modal open={true} onClose={() => setCreateModalOpen(false)} title="Add to Waitlist">
          <form action={createAction} className="space-y-4">
            <WaitlistFormFields state={createState} entry={null} formPending={createPending} editing={false} />
          </form>
        </Modal>
      )}
    </section>
  );
}
