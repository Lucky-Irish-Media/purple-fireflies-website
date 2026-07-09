"use client";

import { useMemo, useState, useTransition, useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { MealSignupWithAssignment } from "@/app/lib/definitions";
import type { DriverVolunteerWithParticipant } from "@/app/lib/definitions";
import { assignDriverAction } from "@/app/actions/assignments";
import { updateMealSignupFieldAction } from "@/app/actions/admin-meal-signup";
import { createMealSignupAction, updateMealSignupAction, type AdminMealSignupActionState } from "@/app/actions/admin-meal-signup";
import { DataTable } from "./components/DataTable";
import { Modal } from "./components/Modal";
import { formatDate, formatPhone, formatDateTime, getContactMethodBadge, getDeliveryDayBadge } from "./lib/utils";
import { createColumnHelper, type ColumnDef, filterFns } from "@tanstack/react-table";

const STATE_OPTIONS = [
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA",
  "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
  "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
  "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC",
  "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY"
];

function ContactMethodFilter({ column }: { column: any }) {
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
      <option value="call">Call</option>
      <option value="text">Text</option>
      <option value="email">Email</option>
    </select>
  );
}

const columnHelper = createColumnHelper<MealSignupWithAssignment>();

function DriverSelectCell({ row, drivers, isPending, onAssign }: {
  row: { original: MealSignupWithAssignment };
  drivers: DriverVolunteerWithParticipant[];
  isPending: boolean;
  onAssign: (mealSignupId: number, driverVolunteerId: string) => void;
}) {
  const signup = row.original;
  const availableDrivers = useMemo(
    () => drivers.filter((d) => d.delivery_date === signup.delivery_date),
    [drivers, signup.delivery_date]
  );

  return (
    <div>
      <select
        value={signup.driver_id ? String(signup.driver_id) : "0"}
        onChange={(e) => onAssign(signup.id, e.target.value)}
        disabled={isPending}
        className="text-sm border border-primary/20 rounded px-2 py-1 bg-background text-foreground max-w-[140px]"
      >
        <option value="0">—</option>
        {availableDrivers.map((d) => (
          <option key={d.id} value={d.id}>
            {d.participant_name}
          </option>
        ))}
      </select>
      {signup.driver_name && (
        <span className="ml-1 text-xs text-text-secondary block truncate max-w-[140px]">
          {formatPhone(signup.driver_phone || "")}
        </span>
      )}
    </div>
  );
}

function InlineEditCell({ row, field, placeholder }: {
  row: { original: MealSignupWithAssignment };
  field: "bag_number" | "internal_notes";
  placeholder: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const currentValue = row.original[field] ?? "";
  const [value, setValue] = useState(currentValue);

  useEffect(() => {
    setValue(currentValue);
  }, [currentValue]);

  function handleBlur() {
    if (value === currentValue) return;
    const formData = new FormData();
    formData.set("id", String(row.original.id));
    formData.set("field", field);
    formData.set("value", value);
    startTransition(async () => {
      await updateMealSignupFieldAction(formData);
      router.refresh();
    });
  }

  return (
    <input
      type="text"
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onBlur={handleBlur}
      disabled={isPending}
      placeholder={placeholder}
      className="w-full bg-transparent border-b border-transparent hover:border-primary/30 focus:border-primary text-sm text-foreground outline-none px-1 py-0.5 disabled:opacity-50"
    />
  );
}

function SignupFormFields({ state, signup, formPending, editing }: {
  state: AdminMealSignupActionState;
  signup: MealSignupWithAssignment | null;
  formPending: boolean;
  editing: boolean;
}) {
  const [regularQty, setRegularQty] = useState(signup?.regular_quantity ?? 1);
  const [veganQty, setVeganQty] = useState(signup?.vegan_quantity ?? 0);
  const totalMeals = regularQty + veganQty;
  const totalInvalid = totalMeals < 1 || totalMeals > 2;

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label htmlFor="ms-name" className="block text-sm font-medium text-foreground mb-1">Name</label>
          <input id="ms-name" name="name" type="text" required defaultValue={signup?.participant_name || ""}
            className="w-full rounded-lg border border-primary/10 bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
          {state?.errors?.name && <p className="mt-1 text-sm text-red-500">{state.errors.name[0]}</p>}
        </div>
        <div>
          <label htmlFor="ms-email" className="block text-sm font-medium text-foreground mb-1">Email</label>
          <input id="ms-email" name="email" type="email" required defaultValue={signup?.participant_email || ""}
            className="w-full rounded-lg border border-primary/10 bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
          {state?.errors?.email && <p className="mt-1 text-sm text-red-500">{state.errors.email[0]}</p>}
        </div>
        <div>
          <label htmlFor="ms-phone" className="block text-sm font-medium text-foreground mb-1">Phone</label>
          <input id="ms-phone" name="phone" type="text" required defaultValue={signup?.participant_phone || ""}
            className="w-full rounded-lg border border-primary/10 bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
          {state?.errors?.phone && <p className="mt-1 text-sm text-red-500">{state.errors.phone[0]}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="ms-address1" className="block text-sm font-medium text-foreground mb-1">Address Line 1</label>
          <input id="ms-address1" name="address1" type="text" required defaultValue={signup?.participant_address1 || ""}
            className="w-full rounded-lg border border-primary/10 bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
          {state?.errors?.address1 && <p className="mt-1 text-sm text-red-500">{state.errors.address1[0]}</p>}
        </div>
        <div>
          <label htmlFor="ms-address2" className="block text-sm font-medium text-foreground mb-1">Address Line 2</label>
          <input id="ms-address2" name="address2" type="text" defaultValue={signup?.participant_address2 || ""}
            className="w-full rounded-lg border border-primary/10 bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
          {state?.errors?.address2 && <p className="mt-1 text-sm text-red-500">{state.errors.address2[0]}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div>
          <label htmlFor="ms-city" className="block text-sm font-medium text-foreground mb-1">City</label>
          <input id="ms-city" name="city" type="text" required defaultValue={signup?.participant_city || ""}
            className="w-full rounded-lg border border-primary/10 bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
          {state?.errors?.city && <p className="mt-1 text-sm text-red-500">{state.errors.city[0]}</p>}
        </div>
        <div>
          <label htmlFor="ms-state" className="block text-sm font-medium text-foreground mb-1">State</label>
          <select id="ms-state" name="state" required defaultValue={signup?.participant_state || "OH"}
            className="w-full rounded-lg border border-primary/10 bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">Select</option>
            {STATE_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          {state?.errors?.state && <p className="mt-1 text-sm text-red-500">{state.errors.state[0]}</p>}
        </div>
        <div>
          <label htmlFor="ms-zipCode" className="block text-sm font-medium text-foreground mb-1">ZIP Code</label>
          <input id="ms-zipCode" name="zipCode" type="text" required defaultValue={signup?.participant_zip_code || ""}
            className="w-full rounded-lg border border-primary/10 bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
          {state?.errors?.zipCode && <p className="mt-1 text-sm text-red-500">{state.errors.zipCode[0]}</p>}
        </div>
        <div>
          <label htmlFor="ms-deliveryDate" className="block text-sm font-medium text-foreground mb-1">Delivery Date</label>
          <input id="ms-deliveryDate" name="deliveryDate" type="date" required defaultValue={signup?.delivery_date || ""}
            className="w-full rounded-lg border border-primary/10 bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
          {state?.errors?.deliveryDate && <p className="mt-1 text-sm text-red-500">{state.errors.deliveryDate[0]}</p>}
        </div>
      </div>

      <fieldset className="space-y-2">
        <legend className="block text-sm font-medium text-foreground mb-1">Meals Requested</legend>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-text-secondary mb-2">Regular meals:</p>
            <div className="flex gap-4">
              {[0, 1, 2].map((n) => {
                const disabled = n + veganQty > 2;
                return (
                  <label key={`reg-${n}`} className={`flex items-center gap-2 ${disabled ? "cursor-not-allowed" : "cursor-pointer"}`}>
                    <input
                      type="radio"
                      name="regularQuantity"
                      value={n}
                      required
                      checked={regularQty === n}
                      disabled={disabled}
                      onChange={(e) => setRegularQty(Number(e.target.value))}
                      className="h-4 w-4 text-primary border-input focus:ring-primary disabled:opacity-40"
                    />
                    <span className={`${disabled ? "text-text-secondary line-through" : "text-foreground"}`}>{n}</span>
                  </label>
                );
              })}
            </div>
          </div>
          <div>
            <p className="text-sm text-text-secondary mb-2">Vegan / GF meals:</p>
            <div className="flex gap-4">
              {[0, 1, 2].map((n) => {
                const disabled = n + regularQty > 2;
                return (
                  <label key={`vg-${n}`} className={`flex items-center gap-2 ${disabled ? "cursor-not-allowed" : "cursor-pointer"}`}>
                    <input
                      type="radio"
                      name="veganQuantity"
                      value={n}
                      required
                      checked={veganQty === n}
                      disabled={disabled}
                      onChange={(e) => setVeganQty(Number(e.target.value))}
                      className="h-4 w-4 text-primary border-input focus:ring-primary disabled:opacity-40"
                    />
                    <span className={`${disabled ? "text-text-secondary line-through" : "text-foreground"}`}>{n}</span>
                  </label>
                );
              })}
            </div>
          </div>
        </div>
        {totalInvalid && (
          <p className="text-sm text-red-500" role="alert">
            Total meals must be 1 or 2.
          </p>
        )}
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
          <label htmlFor="ms-contactMethod" className="block text-sm font-medium text-foreground mb-1">Contact Method</label>
          <select id="ms-contactMethod" name="contactMethod" required defaultValue={signup?.participant_contact_method || "call"}
            className="w-full rounded-lg border border-primary/10 bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="call">Call</option>
            <option value="text">Text</option>
            <option value="email">Email</option>
          </select>
          {state?.errors?.contactMethod && <p className="mt-1 text-sm text-red-500">{state.errors.contactMethod[0]}</p>}
        </div>
        <div>
          <label htmlFor="ms-comments" className="block text-sm font-medium text-foreground mb-1">Comments</label>
          <textarea id="ms-comments" name="comments" rows={1} defaultValue={signup?.comments || ""}
            className="w-full rounded-lg border border-primary/10 bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
          {state?.errors?.comments && <p className="mt-1 text-sm text-red-500">{state.errors.comments[0]}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-primary/10">
        <div>
          <label htmlFor="ms-bagNumber" className="block text-sm font-medium text-foreground mb-1">Bag #</label>
          <input id="ms-bagNumber" name="bagNumber" type="text" defaultValue={signup?.bag_number || ""}
            className="w-full rounded-lg border border-primary/10 bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div>
          <label htmlFor="ms-internalNotes" className="block text-sm font-medium text-foreground mb-1">Internal Notes</label>
          <input id="ms-internalNotes" name="internalNotes" type="text" defaultValue={signup?.internal_notes || ""}
            className="w-full rounded-lg border border-primary/10 bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      {state?.message && !state?.errors && (
        <p className="text-sm text-green-600">{state.message}</p>
      )}

      <button
        type="submit"
        disabled={formPending || totalInvalid}
        className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-primary-dark disabled:opacity-50"
      >
        {formPending
          ? (editing ? "Saving..." : "Adding...")
          : (editing ? "Save Changes" : "Add Signup")}
      </button>
    </>
  );
}

export default function MealSignupsTable({
  initialData,
  drivers,
}: {
  initialData: MealSignupWithAssignment[];
  drivers: DriverVolunteerWithParticipant[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [signups, setSignups] = useState(initialData);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSignup, setEditingSignup] = useState<MealSignupWithAssignment | null>(null);

  const [createState, createAction, createPending] = useActionState<
    AdminMealSignupActionState,
    FormData
  >(async (prev, formData) => {
    const result = await createMealSignupAction(prev, formData);
    if (result?.signups) {
      setSignups(result.signups);
      setModalOpen(false);
    }
    return result;
  }, undefined);

  const [updateState, updateAction, updatePending] = useActionState<
    AdminMealSignupActionState,
    FormData
  >(async (prev, formData) => {
    const result = await updateMealSignupAction(prev, formData);
    if (result?.signups) {
      setSignups(result.signups);
      setModalOpen(false);
    }
    return result;
  }, undefined);

  function handleAssignment(mealSignupId: number, driverVolunteerId: string) {
    const formData = new FormData();
    formData.set("mealSignupId", String(mealSignupId));
    formData.set("driverVolunteerId", driverVolunteerId);
    startTransition(async () => {
      const result = await assignDriverAction(formData);
      if (result.success) {
        setSignups((prev) =>
          prev.map((s) => {
            if (s.id !== mealSignupId) return s;
            const driverId = driverVolunteerId === "0" ? null : Number(driverVolunteerId);
            const driver = driverId ? drivers.find((d) => d.id === driverId) : null;
            return {
              ...s,
              driver_id: driverId,
              driver_name: driver?.participant_name ?? null,
              driver_phone: driver?.participant_phone ?? null,
              assignment_id: driverId ? (s.assignment_id ?? 0) : null,
            };
          })
        );
      }
      router.refresh();
    });
  }

  const columns = useMemo(() => [
    columnHelper.display({
      id: "requester",
      header: "Requester",
      enableColumnFilter: false,
      cell: (info) => {
        const r = info.row.original;
        return (
          <div className="space-y-0.5 max-w-[220px]">
            <div className="text-foreground font-medium text-sm">{r.participant_name}</div>
            <div className="text-text-secondary text-xs truncate">{r.participant_email}</div>
            <div className="text-text-secondary text-xs">{formatPhone(r.participant_phone)}</div>
            <div className="text-text-secondary text-xs truncate">
              {r.participant_address1}
              {r.participant_address2 && `, ${r.participant_address2}`}
              {`, ${r.participant_city}, ${r.participant_state} ${r.participant_zip_code}`}
            </div>
          </div>
        );
      },
    }),
    columnHelper.display({
      id: "meals",
      header: "Meals",
      enableColumnFilter: false,
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
    columnHelper.accessor((row) => row.participant_contact_method, {
      id: "contact_method",
      header: "Contact Method",
      cell: (info) => getContactMethodBadge(info.getValue()),
      filterFn: filterFns.equals,
      meta: { filterComponent: ContactMethodFilter },
    }),
    columnHelper.accessor((row) => row.delivery_date, {
      id: "delivery",
      header: "Delivery",
      enableColumnFilter: false,
      cell: (info) => {
        const r = info.row.original;
        return (
          <div className="space-y-0.5">
            <div className="text-text-secondary text-sm">{formatDate(r.delivery_date)}</div>
            <div className="text-xs">{getDeliveryDayBadge(r.delivery_day)}</div>
          </div>
        );
      },
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
    columnHelper.display({
      id: "assigned_driver",
      header: "Assigned Driver",
      cell: (info) => (
        <DriverSelectCell
          row={info.row}
          drivers={drivers}
          isPending={isPending}
          onAssign={handleAssignment}
        />
      ),
    }),
    columnHelper.display({
      id: "bag_number",
      header: "Bag #",
      enableColumnFilter: false,
      cell: (info) => (
        <InlineEditCell
          row={info.row}
          field="bag_number"
          placeholder="Bag #"
        />
      ),
    }),
    columnHelper.display({
      id: "internal_notes",
      header: "Notes",
      enableColumnFilter: false,
      cell: (info) => (
        <InlineEditCell
          row={info.row}
          field="internal_notes"
          placeholder="Internal notes"
        />
      ),
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
      id: "edit",
      enableHiding: false,
      header: "",
      cell: (info) => (
        <button
          onClick={() => {
            setEditingSignup(info.row.original);
            setModalOpen(true);
          }}
          className="rounded-lg border border-primary/10 px-3 py-1.5 text-xs font-medium text-foreground hover:bg-primary/5 transition-colors"
        >
          Edit
        </button>
      ),
    }),
  ] as const, [drivers, isPending, handleAssignment]);

  const typedColumns = columns as unknown as ColumnDef<MealSignupWithAssignment, unknown>[];

  const formState = editingSignup ? updateState : createState;
  const formPending = editingSignup ? updatePending : createPending;
  const formAction = editingSignup ? updateAction : createAction;

  return (
    <section className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <h2 className="text-xl font-bold text-foreground">Meal Signups</h2>
        <button
          onClick={() => {
            setEditingSignup(null);
            setModalOpen(true);
          }}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-primary-dark"
        >
          Add Signup
        </button>
      </div>

      <Modal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingSignup(null);
        }}
        title={editingSignup ? "Edit Meal Signup" : "New Meal Signup"}
      >
        <form action={formAction} className="space-y-4">
          {editingSignup && <input type="hidden" name="id" value={editingSignup.id} />}

          <SignupFormFields state={formState} signup={editingSignup} formPending={formPending} editing={!!editingSignup} />
        </form>
      </Modal>

      <DataTable
        data={signups}
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
        initialVisibility={{ created_at: false, contact_method: false, bag_number: false, internal_notes: false }}
        initialColumnPinning={{ left: ["requester"] }}
        initialSorting={[{ id: "delivery", desc: true }]}
        pageSize={15}
        storageKey="meal-signups-column-visibility"
      />
    </section>
  );
}
