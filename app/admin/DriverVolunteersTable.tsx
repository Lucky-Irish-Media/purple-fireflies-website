"use client";

import { useMemo, useState, useActionState } from "react";
import type { DriverVolunteer } from "@/app/lib/definitions";
import { createDriverVolunteerAction, updateDriverVolunteerAction, type AdminDriverVolunteerActionState } from "@/app/actions/admin-driver-volunteer";
import { DataTable } from "./components/DataTable";
import { Modal } from "./components/Modal";
import { createColumnHelper, type ColumnDef, filterFns } from "@tanstack/react-table";

const REGION_OPTIONS = ["North", "South", "East", "West", "The Plains", "Chauncey", "Glouster/Jacksonville/Trimble"] as const;

function formatDate(isoDate: string): string {
  const [year, month, day] = isoDate.split("-");
  return `${month}/${day}/${year}`;
}

function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  if (digits.length === 11 && digits.startsWith("1")) {
    return `(${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
  }
  return phone;
}

function getSignalBadge(signal: string) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
        signal === "yes"
          ? "bg-green-100 text-green-800"
          : signal === "willing"
          ? "bg-yellow-100 text-yellow-800"
          : "bg-gray-100 text-gray-800"
      }`}
    >
      {signal}
    </span>
  );
}

function getDeliveryDayBadge(day: string) {
  return (
    <span className="capitalize text-text-secondary">{day}</span>
  );
}

function todayLocal(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function SignalFilter({ column }: { column: any }) {
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
      <option value="">All Signals</option>
      <option value="yes">Yes</option>
      <option value="willing">Willing</option>
      <option value="no">No</option>
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
      <option value="">All Dates</option>
      <option value="future">Future Dates Only</option>
      <option value="past">Past Dates Only</option>
      <option value="today">Today</option>
    </select>
  );
}

function deliveryDateFilterFn(row: any, columnId: string, value: string): boolean {
  const date = row.getValue(columnId);
  const today = todayLocal();
  switch (value) {
    case "future":
      return date >= today;
    case "past":
      return date < today;
    case "today":
      return date === today;
    default:
      return true;
  }
}

const columnHelper = createColumnHelper<DriverVolunteer>();

function VolunteerFormFields({ state, volunteer }: {
  state: AdminDriverVolunteerActionState;
  volunteer: DriverVolunteer | null;
}) {
  const defaultRegions = volunteer?.regions ? volunteer.regions.split(", ") : [];

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label htmlFor="dv-name" className="block text-sm font-medium text-foreground mb-1">Name</label>
          <input id="dv-name" name="name" type="text" required defaultValue={volunteer?.name || ""}
            className="w-full rounded-lg border border-primary/10 bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
          {state?.errors?.name && <p className="mt-1 text-sm text-red-500">{state.errors.name[0]}</p>}
        </div>
        <div>
          <label htmlFor="dv-email" className="block text-sm font-medium text-foreground mb-1">Email</label>
          <input id="dv-email" name="email" type="email" required defaultValue={volunteer?.email || ""}
            className="w-full rounded-lg border border-primary/10 bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
          {state?.errors?.email && <p className="mt-1 text-sm text-red-500">{state.errors.email[0]}</p>}
        </div>
        <div>
          <label htmlFor="dv-phone" className="block text-sm font-medium text-foreground mb-1">Phone</label>
          <input id="dv-phone" name="phone" type="text" required defaultValue={volunteer?.phone || ""}
            className="w-full rounded-lg border border-primary/10 bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
          {state?.errors?.phone && <p className="mt-1 text-sm text-red-500">{state.errors.phone[0]}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label htmlFor="dv-onSignal" className="block text-sm font-medium text-foreground mb-1">On Signal?</label>
          <select id="dv-onSignal" name="onSignal" required defaultValue={volunteer?.on_signal || "no"}
            className="w-full rounded-lg border border-primary/10 bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="no">No</option>
            <option value="willing">Willing to Learn</option>
            <option value="yes">Yes</option>
          </select>
          {state?.errors?.onSignal && <p className="mt-1 text-sm text-red-500">{state.errors.onSignal[0]}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Regions</label>
          <div className="flex flex-wrap gap-3">
            {REGION_OPTIONS.map((region) => (
              <label key={region} className="flex items-center gap-1.5 text-sm text-foreground cursor-pointer">
                <input
                  type="checkbox"
                  name="regions"
                  value={region}
                  defaultChecked={defaultRegions.includes(region)}
                  className="rounded border-primary/30 text-primary focus:ring-primary"
                />
                {region}
              </label>
            ))}
          </div>
          {state?.errors?.regions && <p className="mt-1 text-sm text-red-500">{state.errors.regions[0]}</p>}
        </div>
        <div>
          <label htmlFor="dv-deliveryDate" className="block text-sm font-medium text-foreground mb-1">Delivery Date</label>
          <input id="dv-deliveryDate" name="deliveryDate" type="date" required defaultValue={volunteer?.delivery_date || ""}
            className="w-full rounded-lg border border-primary/10 bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
          {state?.errors?.deliveryDate && <p className="mt-1 text-sm text-red-500">{state.errors.deliveryDate[0]}</p>}
        </div>
      </div>

      {state?.message && !state?.errors && (
        <p className="text-sm text-green-600">{state.message}</p>
      )}
    </>
  );
}

export default function DriverVolunteersTable({ initialData }: { initialData: DriverVolunteer[] }) {
  const [volunteers, setVolunteers] = useState(initialData);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingVolunteer, setEditingVolunteer] = useState<DriverVolunteer | null>(null);

  const [createState, createAction, createPending] = useActionState<
    AdminDriverVolunteerActionState,
    FormData
  >(async (prev, formData) => {
    const result = await createDriverVolunteerAction(prev, formData);
    if (result?.volunteers) {
      setVolunteers(result.volunteers);
      setModalOpen(false);
    }
    return result;
  }, undefined);

  const [updateState, updateAction, updatePending] = useActionState<
    AdminDriverVolunteerActionState,
    FormData
  >(async (prev, formData) => {
    const result = await updateDriverVolunteerAction(prev, formData);
    if (result?.volunteers) {
      setVolunteers(result.volunteers);
      setModalOpen(false);
    }
    return result;
  }, undefined);

  const columns = useMemo(() => [
    columnHelper.accessor((row) => row.name, {
      id: "name",
      header: "Name",
      cell: (info) => <span className="text-foreground">{info.getValue()}</span>,
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
    columnHelper.accessor((row) => row.on_signal, {
      id: "on_signal",
      header: "On Signal",
      cell: (info) => getSignalBadge(info.getValue()),
      filterFn: filterFns.equals,
      meta: { filterComponent: SignalFilter },
    }),
    columnHelper.accessor((row) => row.regions, {
      id: "regions",
      header: "Regions",
      cell: (info) => <span className="text-text-secondary max-w-xs truncate block">{info.getValue()}</span>,
      filterFn: filterFns.includesString,
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
    columnHelper.accessor((row) => row.created_at, {
      id: "created_at",
      header: "Submitted",
      cell: (info) => (
        <span className="text-text-secondary">{new Date(info.getValue()).toLocaleString()}</span>
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
            setEditingVolunteer(info.row.original);
            setModalOpen(true);
          }}
          className="rounded-lg border border-primary/10 px-3 py-1.5 text-xs font-medium text-foreground hover:bg-primary/5 transition-colors"
        >
          Edit
        </button>
      ),
    }),
  ] as const, []);

  const typedColumns = columns as unknown as ColumnDef<DriverVolunteer, unknown>[];

  const formState = editingVolunteer ? updateState : createState;
  const formPending = editingVolunteer ? updatePending : createPending;
  const formAction = editingVolunteer ? updateAction : createAction;

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground">Driver Volunteers</h2>
        <button
          onClick={() => {
            setEditingVolunteer(null);
            setModalOpen(true);
          }}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-primary-dark"
        >
          Add Driver
        </button>
      </div>

      <Modal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingVolunteer(null);
        }}
        title={editingVolunteer ? "Edit Driver Volunteer" : "New Driver Volunteer"}
      >
        <form action={formAction} className="space-y-4">
          {editingVolunteer && <input type="hidden" name="id" value={editingVolunteer.id} />}

          <VolunteerFormFields state={formState} volunteer={editingVolunteer} />

          <button
            type="submit"
            disabled={formPending}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-primary-dark disabled:opacity-50"
          >
            {formPending
              ? (editingVolunteer ? "Saving..." : "Adding...")
              : (editingVolunteer ? "Save Changes" : "Add Driver")}
          </button>
        </form>
      </Modal>

      <DataTable
        data={volunteers}
        columns={typedColumns}
        enableSorting
        enableFiltering
        enablePagination
        enableColumnVisibility
        initialVisibility={{ created_at: false }}
        initialSorting={[{ id: "delivery_date", desc: true }]}
        pageSize={15}
      />
    </section>
  );
}
