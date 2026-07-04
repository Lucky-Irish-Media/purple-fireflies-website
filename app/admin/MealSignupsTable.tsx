"use client";

import { useMemo, useState, useTransition, useActionState } from "react";
import { useRouter } from "next/navigation";
import type { MealSignupWithAssignmentDb } from "@/app/lib/db";
import type { DriverVolunteer } from "@/app/lib/definitions";
import { assignDriverAction } from "@/app/actions/assignments";
import { createMealSignupAction, updateMealSignupAction, type AdminMealSignupActionState } from "@/app/actions/admin-meal-signup";
import { DataTable } from "./components/DataTable";
import { Modal } from "./components/Modal";
import { formatDate, formatPhone, formatDateTime, getMealTypeBadge, getContactMethodBadge, getDeliveryDayBadge, todayLocal, deliveryDateFilterFn } from "./lib/utils";
import { createColumnHelper, type ColumnDef, filterFns } from "@tanstack/react-table";

const STATE_OPTIONS = [
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA",
  "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
  "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
  "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC",
  "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY"
];

function MealTypeFilter({ column }: { column: any }) {
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
      <option value="regular">Regular</option>
      <option value="vegan">Vegan</option>
    </select>
  );
}

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

function DeliveryDateFilter({ column }: { column: any }) {
  const value = column.getFilterValue() as string | undefined;
  const today = todayLocal();
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
      <option value="future">Future Dates Only</option>
      <option value="past">Past Dates Only</option>
      <option value="today">Today</option>
      <option value="nextWeek">Next Week</option>
    </select>
  );
}

const columnHelper = createColumnHelper<MealSignupWithAssignmentDb>();

function DriverSelectCell({ row, drivers, isPending, onAssign }: {
  row: { original: MealSignupWithAssignmentDb };
  drivers: DriverVolunteer[];
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
            {d.name}
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

function SignupFormFields({ state, signup }: {
  state: AdminMealSignupActionState;
  signup: MealSignupWithAssignmentDb | null;
}) {
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label htmlFor="ms-name" className="block text-sm font-medium text-foreground mb-1">Name</label>
          <input id="ms-name" name="name" type="text" required defaultValue={signup?.name || ""}
            className="w-full rounded-lg border border-primary/10 bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
          {state?.errors?.name && <p className="mt-1 text-sm text-red-500">{state.errors.name[0]}</p>}
        </div>
        <div>
          <label htmlFor="ms-email" className="block text-sm font-medium text-foreground mb-1">Email</label>
          <input id="ms-email" name="email" type="email" required defaultValue={signup?.email || ""}
            className="w-full rounded-lg border border-primary/10 bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
          {state?.errors?.email && <p className="mt-1 text-sm text-red-500">{state.errors.email[0]}</p>}
        </div>
        <div>
          <label htmlFor="ms-phone" className="block text-sm font-medium text-foreground mb-1">Phone</label>
          <input id="ms-phone" name="phone" type="text" required defaultValue={signup?.phone || ""}
            className="w-full rounded-lg border border-primary/10 bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
          {state?.errors?.phone && <p className="mt-1 text-sm text-red-500">{state.errors.phone[0]}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="ms-address1" className="block text-sm font-medium text-foreground mb-1">Address Line 1</label>
          <input id="ms-address1" name="address1" type="text" required defaultValue={signup?.address1 || ""}
            className="w-full rounded-lg border border-primary/10 bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
          {state?.errors?.address1 && <p className="mt-1 text-sm text-red-500">{state.errors.address1[0]}</p>}
        </div>
        <div>
          <label htmlFor="ms-address2" className="block text-sm font-medium text-foreground mb-1">Address Line 2</label>
          <input id="ms-address2" name="address2" type="text" defaultValue={signup?.address2 || ""}
            className="w-full rounded-lg border border-primary/10 bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
          {state?.errors?.address2 && <p className="mt-1 text-sm text-red-500">{state.errors.address2[0]}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div>
          <label htmlFor="ms-city" className="block text-sm font-medium text-foreground mb-1">City</label>
          <input id="ms-city" name="city" type="text" required defaultValue={signup?.city || ""}
            className="w-full rounded-lg border border-primary/10 bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
          {state?.errors?.city && <p className="mt-1 text-sm text-red-500">{state.errors.city[0]}</p>}
        </div>
        <div>
          <label htmlFor="ms-state" className="block text-sm font-medium text-foreground mb-1">State</label>
          <select id="ms-state" name="state" required defaultValue={signup?.state || "OH"}
            className="w-full rounded-lg border border-primary/10 bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">Select</option>
            {STATE_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          {state?.errors?.state && <p className="mt-1 text-sm text-red-500">{state.errors.state[0]}</p>}
        </div>
        <div>
          <label htmlFor="ms-zipCode" className="block text-sm font-medium text-foreground mb-1">ZIP Code</label>
          <input id="ms-zipCode" name="zipCode" type="text" required defaultValue={signup?.zip_code || ""}
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

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div>
          <label htmlFor="ms-mealType" className="block text-sm font-medium text-foreground mb-1">Meal Type</label>
          <select id="ms-mealType" name="mealType" required defaultValue={signup?.meal_type || "regular"}
            className="w-full rounded-lg border border-primary/10 bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="regular">Regular</option>
            <option value="vegan">Vegan / GF</option>
          </select>
          {state?.errors?.mealType && <p className="mt-1 text-sm text-red-500">{state.errors.mealType[0]}</p>}
        </div>
        <div>
          <label htmlFor="ms-quantity" className="block text-sm font-medium text-foreground mb-1">Quantity</label>
          <select id="ms-quantity" name="quantity" required defaultValue={String(signup?.quantity ?? 1)}
            className="w-full rounded-lg border border-primary/10 bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="1">1</option>
            <option value="2">2</option>
          </select>
          {state?.errors?.quantity && <p className="mt-1 text-sm text-red-500">{state.errors.quantity[0]}</p>}
        </div>
        <div>
          <label htmlFor="ms-contactMethod" className="block text-sm font-medium text-foreground mb-1">Contact Method</label>
          <select id="ms-contactMethod" name="contactMethod" required defaultValue={signup?.contact_method || "call"}
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

      {state?.message && !state?.errors && (
        <p className="text-sm text-green-600">{state.message}</p>
      )}
    </>
  );
}

export default function MealSignupsTable({
  initialData,
  drivers,
}: {
  initialData: MealSignupWithAssignmentDb[];
  drivers: DriverVolunteer[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [signups, setSignups] = useState(initialData);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSignup, setEditingSignup] = useState<MealSignupWithAssignmentDb | null>(null);

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
              driver_name: driver?.name ?? null,
              driver_phone: driver?.phone ?? null,
              assignment_id: driverId ? (s.assignment_id ?? 0) : null,
            };
          })
        );
      }
      router.refresh();
    });
  }

  const columns = useMemo(() => [
    columnHelper.accessor((row) => row.name, {
      id: "name",
      header: "Name",
      cell: (info) => <span className="text-foreground font-medium">{info.getValue()}</span>,
      filterFn: filterFns.includesString,
    }),
    columnHelper.accessor((row) => row.email, {
      id: "email",
      header: "Email",
      cell: (info) => <span className="text-text-secondary">{info.getValue()}</span>,
      filterFn: filterFns.includesString,
    }),
    columnHelper.accessor((row) => row.phone, {
      id: "phone",
      header: "Phone",
      cell: (info) => <span className="text-text-secondary">{formatPhone(info.getValue())}</span>,
      filterFn: filterFns.includesString,
    }),
    columnHelper.accessor((row) => row.address1, {
      id: "address1",
      header: "Address",
      cell: (info) => {
        const row = info.row.original;
        return (
          <span className="text-text-secondary max-w-xs truncate block">
            {row.address1}
            {row.address2 && `, ${row.address2}`}
            {`, ${row.city}, ${row.state} ${row.zip_code}`}
          </span>
        );
      },
      filterFn: filterFns.includesString,
    }),
    columnHelper.accessor((row) => row.meal_type, {
      id: "meal_type",
      header: "Meal Type",
      cell: (info) => getMealTypeBadge(info.getValue()),
      filterFn: filterFns.equals,
      meta: { filterComponent: MealTypeFilter },
    }),
    columnHelper.accessor((row) => row.quantity, {
      id: "quantity",
      header: "Qty",
      cell: (info) => <span className="text-foreground font-medium">{info.getValue()}</span>,
      filterFn: filterFns.equals,
    }),
    columnHelper.accessor((row) => row.contact_method, {
      id: "contact_method",
      header: "Contact Method",
      cell: (info) => getContactMethodBadge(info.getValue()),
      filterFn: filterFns.equals,
      meta: { filterComponent: ContactMethodFilter },
    }),
    columnHelper.accessor((row) => row.delivery_day, {
      id: "delivery_day",
      header: "Delivery Day",
      cell: (info) => getDeliveryDayBadge(info.getValue()),
      filterFn: filterFns.equals,
    }),
    columnHelper.accessor((row) => row.delivery_date, {
      id: "delivery_date",
      header: "Delivery Date",
      cell: (info) => <span className="text-text-secondary">{formatDate(info.getValue())}</span>,
      filterFn: deliveryDateFilterFn,
      meta: { filterComponent: DeliveryDateFilter },
    }),
    columnHelper.accessor((row) => row.comments, {
      id: "comments",
      header: "Comments",
      enableColumnFilter: false,
      cell: (info) => {
        const value = info.getValue();
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

  const typedColumns = columns as unknown as ColumnDef<MealSignupWithAssignmentDb, unknown>[];

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

          <SignupFormFields state={formState} signup={editingSignup} />

          <button
            type="submit"
            disabled={formPending}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-primary-dark disabled:opacity-50"
          >
            {formPending
              ? (editingSignup ? "Saving..." : "Adding...")
              : (editingSignup ? "Save Changes" : "Add Signup")}
          </button>
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
        initialVisibility={{ created_at: false }}
        initialColumnPinning={{ left: ["name"] }}
        initialSorting={[{ id: "delivery_date", desc: true }]}
        pageSize={15}
        storageKey="meal-signups-column-visibility"
      />
    </section>
  );
}
