"use client";

import { useMemo, useState, useActionState } from "react";
import { useRouter } from "next/navigation";
import type { DriverVolunteerWithParticipant } from "@/app/lib/definitions";
import { createDriverVolunteerAction, updateDriverVolunteerAction, duplicateDriverVolunteerAction, type AdminDriverVolunteerActionState } from "@/app/actions/admin-driver-volunteer";
import { DataTable } from "./components/DataTable";
import { Modal } from "./components/Modal";
import { formatDate, formatPhone, formatDateTime, deliveryDateFilterFn, DeliveryDateFilter } from "./lib/utils";
import { createColumnHelper, type ColumnDef, filterFns } from "@tanstack/react-table";

function VolunteerFormFields({ state, volunteer }: {
  state: AdminDriverVolunteerActionState;
  volunteer: DriverVolunteerWithParticipant | null;
}) {
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label htmlFor="dv-name" className="block text-sm font-medium text-foreground mb-1">Name</label>
          <input id="dv-name" name="name" type="text" required defaultValue={volunteer?.participant_name || ""}
            className="w-full rounded-lg border border-primary/10 bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
          {state?.errors?.name && <p className="mt-1 text-sm text-red-500">{state.errors.name[0]}</p>}
        </div>
        <div>
          <label htmlFor="dv-email" className="block text-sm font-medium text-foreground mb-1">Email</label>
          <input id="dv-email" name="email" type="email" required defaultValue={volunteer?.participant_email || ""}
            className="w-full rounded-lg border border-primary/10 bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
          {state?.errors?.email && <p className="mt-1 text-sm text-red-500">{state.errors.email[0]}</p>}
        </div>
        <div>
          <label htmlFor="dv-phone" className="block text-sm font-medium text-foreground mb-1">Phone</label>
          <input id="dv-phone" name="phone" type="text" required defaultValue={volunteer?.participant_phone || ""}
            className="w-full rounded-lg border border-primary/10 bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
          {state?.errors?.phone && <p className="mt-1 text-sm text-red-500">{state.errors.phone[0]}</p>}
        </div>
      </div>

      <div>
        <label htmlFor="dv-deliveryDate" className="block text-sm font-medium text-foreground mb-1">Delivery Date</label>
        <input id="dv-deliveryDate" name="deliveryDate" type="date" required defaultValue={volunteer?.delivery_date || ""}
          className="w-full rounded-lg border border-primary/10 bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        />
        {state?.errors?.deliveryDate && <p className="mt-1 text-sm text-red-500">{state.errors.deliveryDate[0]}</p>}
      </div>

      {state?.message && !state?.errors && (
        <p className="text-sm text-green-600">{state.message}</p>
      )}
    </>
  );
}

const columnHelper = createColumnHelper<DriverVolunteerWithParticipant>();

export default function DriverVolunteersTable({
  initialData,
}: {
  initialData: DriverVolunteerWithParticipant[];
}) {
  const router = useRouter();
  const [volunteers, setVolunteers] = useState(initialData);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingVolunteer, setEditingVolunteer] = useState<DriverVolunteerWithParticipant | null>(null);

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

  const [duplicateModalOpen, setDuplicateModalOpen] = useState(false);
  const [duplicatingVolunteer, setDuplicatingVolunteer] = useState<DriverVolunteerWithParticipant | null>(null);

  const [duplicateState, duplicateAction, duplicatePending] = useActionState<
    AdminDriverVolunteerActionState,
    FormData
  >(async (prev, formData) => {
    const result = await duplicateDriverVolunteerAction(prev, formData);
    if (result?.volunteers) {
      setVolunteers(result.volunteers);
      setDuplicateModalOpen(false);
      setDuplicatingVolunteer(null);
    }
    return result;
  }, undefined);

  const columns = useMemo(() => [
    columnHelper.accessor((row) => row.participant_name, {
      id: "name",
      header: "Name",
      cell: (info) => <span className="text-foreground font-medium">{info.getValue()}</span>,
      filterFn: filterFns.includesString,
    }),
    columnHelper.accessor((row) => row.participant_email, {
      id: "email",
      header: "Email",
      cell: (info) => <span className="text-text-secondary">{info.getValue()}</span>,
      filterFn: filterFns.includesString,
    }),
    columnHelper.accessor((row) => row.participant_phone, {
      id: "phone",
      header: "Phone",
      cell: (info) => <span className="text-text-secondary">{formatPhone(info.getValue())}</span>,
      filterFn: filterFns.includesString,
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
      header: "Signed Up",
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
        <div className="flex gap-2">
          <button
            onClick={() => {
              setEditingVolunteer(info.row.original);
              setModalOpen(true);
            }}
            className="rounded-lg border border-primary/10 px-3 py-1.5 text-xs font-medium text-foreground hover:bg-primary/5 transition-colors"
          >
            Edit
          </button>
          <button
            onClick={() => {
              setDuplicatingVolunteer(info.row.original);
              setDuplicateModalOpen(true);
            }}
            className="rounded-lg border border-primary/10 px-3 py-1.5 text-xs font-medium text-foreground hover:bg-primary/5 transition-colors"
          >
            Duplicate
          </button>
        </div>
      ),
    }),
  ] as const, []);

  const typedColumns = columns as unknown as ColumnDef<DriverVolunteerWithParticipant, unknown>[];

  const formState = editingVolunteer ? updateState : createState;
  const formPending = editingVolunteer ? updatePending : createPending;
  const formAction = editingVolunteer ? updateAction : createAction;

  return (
    <section className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <h2 className="text-xl font-bold text-foreground">Driver Volunteers</h2>
        <button
          onClick={() => {
            setEditingVolunteer(null);
            setModalOpen(true);
          }}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-primary-dark"
        >
          Add Volunteer
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
              : (editingVolunteer ? "Save Changes" : "Add Volunteer")}
          </button>
        </form>
      </Modal>

      <Modal
        open={duplicateModalOpen}
        onClose={() => {
          setDuplicateModalOpen(false);
          setDuplicatingVolunteer(null);
        }}
        title="Duplicate Driver Volunteer"
      >
        <form action={duplicateAction} className="space-y-4">
          <input type="hidden" name="id" value={duplicatingVolunteer?.id || ""} />
          <div>
            <label htmlFor="dup-deliveryDate" className="block text-sm font-medium text-foreground mb-1">
              New Delivery Date
            </label>
            <input id="dup-deliveryDate" name="deliveryDate" type="date" required
              className="w-full rounded-lg border border-primary/10 bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
            {duplicateState?.errors?.deliveryDate && <p className="mt-1 text-sm text-red-500">{duplicateState.errors.deliveryDate[0]}</p>}
          </div>
          {duplicateState?.message && !duplicateState?.errors && (
            <p className="text-sm text-red-500">{duplicateState.message}</p>
          )}
          <button
            type="submit"
            disabled={duplicatePending}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-primary-dark disabled:opacity-50"
          >
            {duplicatePending ? "Duplicating..." : "Duplicate Volunteer"}
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
        enableGlobalFilter
        enableColumnPinning
        enableColumnResizing
        enableFacetedFilters
        initialVisibility={{ created_at: false }}
        initialColumnPinning={{ left: ["name"] }}
        initialSorting={[{ id: "delivery_date", desc: true }]}
        pageSize={15}
        storageKey="driver-volunteers-column-visibility"
      />
    </section>
  );
}
