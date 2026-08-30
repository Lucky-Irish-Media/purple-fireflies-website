"use client";

import { useMemo, useState, useActionState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { DriverVolunteerWithParticipant } from "@/app/lib/definitions";
import { createDriverVolunteerAction, updateDriverVolunteerAction, duplicateDriverVolunteerAction, updateDriverBagAction, type AdminDriverVolunteerActionState } from "@/app/actions/admin-driver-volunteer";
import { DataTable } from "./components/DataTable";
import { Modal } from "./components/Modal";
import { formatDate, formatPhone, formatDateTime, getSignalBadge } from "./lib/utils";
import { createColumnHelper, type ColumnDef, filterFns } from "@tanstack/react-table";

const regions = [
  "North",
  "South",
  "East",
  "West",
  "The Plains",
  "Chauncey",
  "Glouster/Jacksonville/Trimble",
];

interface GroupedVolunteer {
  participant_id: number;
  participant_name: string;
  participant_email: string;
  participant_phone: string;
  days: DriverVolunteerWithParticipant[];
}

function groupVolunteers(volunteers: DriverVolunteerWithParticipant[]): GroupedVolunteer[] {
  const map = new Map<number, GroupedVolunteer>();
  for (const v of volunteers) {
    let group = map.get(v.participant_id);
    if (!group) {
      group = {
        participant_id: v.participant_id,
        participant_name: v.participant_name,
        participant_email: v.participant_email,
        participant_phone: v.participant_phone,
        days: [],
      };
      map.set(v.participant_id, group);
    }
    group.days.push(v);
  }
  for (const group of map.values()) {
    group.days.sort((a, b) => a.delivery_date.localeCompare(b.delivery_date));
  }
  return Array.from(map.values()).sort((a, b) =>
    a.participant_name.localeCompare(b.participant_name)
  );
}

function BagCell({ group }: { group: GroupedVolunteer }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const currentValue = group.days[0]?.participant_bag_number ?? "";
  const [value, setValue] = useState(currentValue);

  useEffect(() => {
    setValue(currentValue);
  }, [currentValue]);

  function handleBlur() {
    if (value === currentValue) return;
    const formData = new FormData();
    formData.set("participantId", String(group.participant_id));
    formData.set("bagNumber", value);
    startTransition(async () => {
      await updateDriverBagAction(formData);
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
      placeholder="Bag #"
      className="w-full bg-transparent border-b border-transparent hover:border-primary/30 focus:border-primary text-sm text-foreground outline-none px-1 py-0.5 disabled:opacity-50"
    />
  );
}

function SignalRadio({ name, value, label, defaultChecked }: {
  name: string;
  value: string;
  label: string;
  defaultChecked: boolean;
}) {
  return (
    <label className="flex items-center gap-2 cursor-pointer">
      <input
        type="radio"
        name={name}
        value={value}
        defaultChecked={defaultChecked}
        className="h-4 w-4 text-primary border-input focus:ring-primary"
      />
      <span className="text-foreground">{label}</span>
    </label>
  );
}

function RegionCheckbox({ region, defaultChecked }: {
  region: string;
  defaultChecked: boolean;
}) {
  return (
    <label key={region} className="flex items-center gap-2 cursor-pointer block">
      <input
        type="checkbox"
        name="regions"
        value={region}
        defaultChecked={defaultChecked}
        className="h-4 w-4 text-primary border-input focus:ring-primary rounded"
      />
      <span className="text-foreground">{region}</span>
    </label>
  );
}

function VolunteerFormFields({ state, volunteer }: {
  state: AdminDriverVolunteerActionState;
  volunteer: DriverVolunteerWithParticipant | null;
}) {
  const currentRegions = volunteer?.regions
    ? volunteer.regions.split(", ").map((r) => r.trim()).filter(Boolean)
    : [];
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

      <fieldset className="space-y-2">
        <legend className="text-sm font-medium text-foreground">
          Are you on Signal? If not, would you be willing to join?
        </legend>
        <div className="flex gap-6">
          <SignalRadio name="onSignal" value="yes" label="Yes" defaultChecked={volunteer?.on_signal === "yes"} />
          <SignalRadio name="onSignal" value="willing" label="No, but willing to join" defaultChecked={volunteer?.on_signal === "willing"} />
          <SignalRadio name="onSignal" value="no" label="No" defaultChecked={volunteer?.on_signal === "no"} />
        </div>
        {state?.errors?.onSignal && <p className="text-sm text-red-500">{state.errors.onSignal[0]}</p>}
      </fieldset>

      <fieldset className="space-y-2">
        <legend className="text-sm font-medium text-foreground">Available Regions</legend>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
          {regions.map((region) => (
            <RegionCheckbox key={region} region={region} defaultChecked={currentRegions.includes(region)} />
          ))}
        </div>
        {state?.errors?.regions && <p className="text-sm text-red-500">{state.errors.regions[0]}</p>}
      </fieldset>

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

const columnHelper = createColumnHelper<GroupedVolunteer>();
const dayColumnHelper = createColumnHelper<DriverVolunteerWithParticipant>();

export default function DriverVolunteersTable({
  initialData,
}: {
  initialData: DriverVolunteerWithParticipant[];
}) {
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

  const [dayModalOpen, setDayModalOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<GroupedVolunteer | null>(null);

  const groups = useMemo(() => groupVolunteers(volunteers), [volunteers]);

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
    columnHelper.accessor((row) => row.days[0]?.on_signal ?? "", {
      id: "signal",
      header: "Signal",
      cell: (info) => getSignalBadge(info.getValue()),
      enableGlobalFilter: false,
    }),
    columnHelper.accessor((row) => row.days.length, {
      id: "day_count",
      header: "# of Days",
      cell: (info) => <span className="text-text-secondary">{info.getValue()}</span>,
      enableGlobalFilter: false,
    }),
    columnHelper.display({
      id: "bag",
      header: "Bag #",
      enableGlobalFilter: false,
      cell: (info) => <BagCell group={info.row.original} />,
    }),
    columnHelper.display({
      id: "actions",
      enableHiding: false,
      enableGlobalFilter: false,
      header: "",
      cell: (info) => (
        <button
          onClick={() => {
            setSelectedGroup(info.row.original);
            setDayModalOpen(true);
          }}
          className="rounded-lg border border-primary/10 px-3 py-1.5 text-xs font-medium text-foreground hover:bg-primary/5 transition-colors"
        >
          View Days
        </button>
      ),
    }),
  ] as const, []);

  const typedColumns = columns as unknown as ColumnDef<GroupedVolunteer, unknown>[];

  const dayColumns = useMemo(() => [
    dayColumnHelper.accessor((row) => row.delivery_date, {
      id: "delivery_date",
      header: "Delivery Date",
      cell: (info) => <span className="text-text-secondary">{formatDate(info.getValue())}</span>,
      enableGlobalFilter: false,
    }),
    dayColumnHelper.accessor((row) => row.on_signal, {
      id: "on_signal",
      header: "Signal",
      cell: (info) => getSignalBadge(info.getValue()),
      enableGlobalFilter: false,
    }),
    dayColumnHelper.accessor((row) => row.regions, {
      id: "regions",
      header: "Regions",
      cell: (info) => <span className="text-text-secondary">{info.getValue()}</span>,
      enableGlobalFilter: false,
    }),
    dayColumnHelper.accessor((row) => row.created_at, {
      id: "signed_up",
      header: "Signed Up",
      cell: (info) => <span className="text-text-secondary">{formatDateTime(info.getValue())}</span>,
      enableGlobalFilter: false,
    }),
    dayColumnHelper.display({
      id: "actions",
      enableHiding: false,
      enableGlobalFilter: false,
      header: "",
      cell: (info) => {
        const day = info.row.original;
        return (
          <div className="flex justify-end gap-2">
            <button
              onClick={() => {
                setEditingVolunteer(day);
                setModalOpen(true);
              }}
              className="rounded-lg border border-primary/10 px-3 py-1.5 text-xs font-medium text-foreground hover:bg-primary/5 transition-colors"
            >
              Edit
            </button>
            <button
              onClick={() => {
                setDuplicatingVolunteer(day);
                setDuplicateModalOpen(true);
              }}
              className="rounded-lg border border-primary/10 px-3 py-1.5 text-xs font-medium text-foreground hover:bg-primary/5 transition-colors"
            >
              Duplicate
            </button>
          </div>
        );
      },
    }),
  ] as const, [setEditingVolunteer, setDuplicateModalOpen, setModalOpen]);

  const typedDayColumns = dayColumns as unknown as ColumnDef<DriverVolunteerWithParticipant, unknown>[];

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
        title="Add Delivery Day"
      >
        <form action={duplicateAction} className="space-y-4">
          <input type="hidden" name="id" value={duplicatingVolunteer?.id || ""} />
          <div>
            <label htmlFor="dup-deliveryDate" className="block text-sm font-medium text-foreground mb-1">
              Delivery Date
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
            {duplicatePending ? "Adding..." : "Add Day"}
          </button>
        </form>
      </Modal>

      <Modal
        open={dayModalOpen}
        onClose={() => {
          setDayModalOpen(false);
          setSelectedGroup(null);
        }}
        title={selectedGroup ? `${selectedGroup.participant_name} — Signed Up Days` : "Signed Up Days"}
      >
        {selectedGroup && (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div className="text-sm text-text-secondary">
                {formatPhone(selectedGroup.participant_phone)}
              </div>
              <button
                onClick={() => {
                  setDuplicatingVolunteer(selectedGroup.days[0]);
                  setDuplicateModalOpen(true);
                }}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-primary-dark"
              >
                Add Day
              </button>
            </div>

            <div className="rounded-lg border border-primary/10 p-2">
              <DataTable
                data={selectedGroup.days}
                columns={typedDayColumns}
                enableSorting
                enableColumnPinning
                initialColumnPinning={{ right: ["actions"] }}
                initialSorting={[{ id: "delivery_date", desc: true }]}
                pageSize={selectedGroup.days.length}
              />
            </div>
          </div>
        )}
      </Modal>

      <DataTable
        data={groups}
        columns={typedColumns}
        enableSorting
        enableFiltering
        enablePagination
        enableColumnVisibility
        enableGlobalFilter
        enableColumnPinning
        enableColumnResizing
        enableFacetedFilters
        initialVisibility={{}}
        initialColumnPinning={{ left: ["name"], right: ["actions"] }}
        initialSorting={[{ id: "name", desc: false }]}
        pageSize={15}
        storageKey="driver-volunteers-column-visibility"
      />
    </section>
  );
}
