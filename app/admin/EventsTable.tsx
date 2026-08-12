"use client";

import { useState, useActionState, useMemo } from "react";
import type { Event } from "@/app/lib/definitions";
import {
  createEventAction,
  updateEventAction,
  deleteEventAction,
  type EventsActionState,
} from "@/app/actions/admin-events";
import { DataTable } from "./components/DataTable";
import { Modal } from "./components/Modal";
import { formatDate } from "./lib/utils";
import { createColumnHelper, type ColumnDef, filterFns } from "@tanstack/react-table";

const columnHelper = createColumnHelper<Event>();

function EventFormFields({ state, event }: {
  state: EventsActionState;
  event: Event | null;
}) {
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label htmlFor="title" className="block text-sm font-medium text-foreground mb-1">
            Title
          </label>
          <input
            id="title"
            name="title"
            type="text"
            required
            defaultValue={event?.title || ""}
            className="w-full rounded-lg border border-primary/10 bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
          {state?.errors?.title && (
            <p className="mt-1 text-sm text-red-500">{state.errors.title[0]}</p>
          )}
        </div>

        <div>
          <label htmlFor="event_date" className="block text-sm font-medium text-foreground mb-1">
            Date
          </label>
          <input
            id="event_date"
            name="event_date"
            type="date"
            required
            defaultValue={event?.event_date || ""}
            className="w-full rounded-lg border border-primary/10 bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
          {state?.errors?.event_date && (
            <p className="mt-1 text-sm text-red-500">{state.errors.event_date[0]}</p>
          )}
        </div>

        <div>
          <label htmlFor="url" className="block text-sm font-medium text-foreground mb-1">
            Event URL (optional)
          </label>
          <input
            id="url"
            name="url"
            type="text"
            placeholder="https://..."
            defaultValue={event?.url || ""}
            className="w-full rounded-lg border border-primary/10 bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
          {state?.errors?.url && (
            <p className="mt-1 text-sm text-red-500">{state.errors.url[0]}</p>
          )}
        </div>

        <div>
          <label htmlFor="start_time" className="block text-sm font-medium text-foreground mb-1">
            Start Time
          </label>
          <input
            id="start_time"
            name="start_time"
            type="time"
            defaultValue={event?.start_time || ""}
            className="w-full rounded-lg border border-primary/10 bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div>
          <label htmlFor="end_time" className="block text-sm font-medium text-foreground mb-1">
            End Time
          </label>
          <input
            id="end_time"
            name="end_time"
            type="time"
            defaultValue={event?.end_time || ""}
            className="w-full rounded-lg border border-primary/10 bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="location" className="block text-sm font-medium text-foreground mb-1">
            Location
          </label>
          <input
            id="location"
            name="location"
            type="text"
            defaultValue={event?.location || ""}
            className="w-full rounded-lg border border-primary/10 bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="description" className="block text-sm font-medium text-foreground mb-1">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            rows={3}
            defaultValue={event?.description || ""}
            className="w-full rounded-lg border border-primary/10 bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      {state?.message && !state.success && (
        <p className="text-sm text-red-500">{state.message}</p>
      )}
    </>
  );
}

function formatTimeRange(event: Event): string {
  if (event.start_time && event.end_time) {
    return `${event.start_time} – ${event.end_time}`;
  }
  return event.start_time || event.end_time || "";
}

export default function EventsTable({ initialEvents }: { initialEvents: Event[] }) {
  const [events, setEvents] = useState(initialEvents);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [actionMessage, setActionMessage] = useState<{ text: string; success: boolean } | null>(null);

  const [createState, createAction, createPending] = useActionState<
    EventsActionState,
    FormData
  >(async (prev, formData) => {
    const result = await createEventAction(prev, formData);
    if (result?.events) {
      setEvents(result.events);
      setModalOpen(false);
      setActionMessage({ text: result.message || "", success: true });
    }
    return result;
  }, undefined);

  const [updateState, updateAction, updatePending] = useActionState<
    EventsActionState,
    FormData
  >(async (prev, formData) => {
    const result = await updateEventAction(prev, formData);
    if (result?.events) {
      setEvents(result.events);
      setModalOpen(false);
      setActionMessage({ text: result.message || "", success: true });
    }
    return result;
  }, undefined);

  const [, deleteAction, deletePending] = useActionState<
    EventsActionState,
    FormData
  >(async (prev, formData) => {
    const result = await deleteEventAction(prev, formData);
    if (result?.events) {
      setEvents(result.events);
      setActionMessage({ text: result.message || "", success: true });
    } else if (result?.message) {
      setActionMessage({ text: result.message, success: false });
    }
    return result;
  }, undefined);

  const columns = useMemo(() => [
    columnHelper.accessor((row) => row.title, {
      id: "title",
      header: "Title",
      cell: (info) => <span className="text-foreground font-medium">{info.getValue()}</span>,
      filterFn: filterFns.includesString,
    }),
    columnHelper.accessor((row) => row.event_date, {
      id: "event_date",
      header: "Date",
      cell: (info) => <span className="text-text-secondary">{formatDate(info.getValue())}</span>,
      filterFn: filterFns.includesString,
    }),
    columnHelper.accessor((row) => `${row.start_time || ""}${row.end_time ? "-" + row.end_time : ""}`, {
      id: "time",
      header: "Time",
      cell: (info) => {
        const event = info.row.original;
        const time = formatTimeRange(event);
        return time ? <span className="text-text-secondary">{time}</span> : <span className="text-text-secondary">—</span>;
      },
      filterFn: filterFns.includesString,
    }),
    columnHelper.accessor((row) => row.location, {
      id: "location",
      header: "Location",
      cell: (info) => <span className="text-text-secondary">{info.getValue() || "—"}</span>,
      filterFn: filterFns.includesString,
    }),
    columnHelper.accessor((row) => row.url, {
      id: "url",
      header: "Link",
      cell: (info) => {
        const url = info.getValue();
        return url ? (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            Open
          </a>
        ) : (
          <span className="text-text-secondary">—</span>
        );
      },
      filterFn: filterFns.includesString,
    }),
    columnHelper.display({
      id: "actions",
      header: "Actions",
      cell: (info) => {
        const event = info.row.original;
        return (
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setEditingEvent(event);
                setModalOpen(true);
              }}
              className="rounded-lg border border-primary/10 px-3 py-1.5 text-xs font-medium text-foreground hover:bg-primary/5 transition-colors"
            >
              Edit
            </button>

            <form
              action={deleteAction}
              className="inline"
              onSubmit={(e) => {
                if (!confirm(`Delete event "${event.title}"? This cannot be undone.`)) {
                  e.preventDefault();
                }
              }}
            >
              <input type="hidden" name="id" value={event.id} />
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
  ] as const, [deletePending, deleteAction]);

  const typedColumns = columns as unknown as ColumnDef<Event, unknown>[];

  const formState = editingEvent ? updateState : createState;
  const formPending = editingEvent ? updatePending : createPending;
  const formAction = editingEvent ? updateAction : createAction;

  function handleCreateAddForm() {
    setEditingEvent(null);
    setModalOpen(true);
  }

  function handleModalClose() {
    setModalOpen(false);
    setEditingEvent(null);
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <h2 className="text-xl font-bold text-foreground">Events</h2>
        <button
          onClick={handleCreateAddForm}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-primary-dark"
        >
          Add Event
        </button>
      </div>

      <p className="text-text-secondary">Total events: {events.length}</p>

      <Modal
        open={modalOpen}
        onClose={handleModalClose}
        title={editingEvent ? "Edit Event" : "New Event"}
      >
        <form action={formAction} className="space-y-4">
          {editingEvent && <input type="hidden" name="id" value={editingEvent.id} />}

          <EventFormFields state={formState} event={editingEvent} />

          <button
            type="submit"
            disabled={formPending}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-primary-dark disabled:opacity-50"
          >
            {formPending
              ? (editingEvent ? "Saving..." : "Creating...")
              : (editingEvent ? "Save Changes" : "Create Event")}
          </button>
        </form>
      </Modal>

      {actionMessage && (
        <p className={`text-sm ${actionMessage.success ? "text-green-600" : "text-red-500"}`}>
          {actionMessage.text}
        </p>
      )}

      <DataTable
        data={events}
        columns={typedColumns}
        enableSorting
        enableFiltering
        enablePagination
        enableGlobalFilter
        enableColumnPinning
        enableColumnResizing
        enableFacetedFilters
        initialColumnPinning={{ left: ["title"], right: ["actions"] }}
        pageSize={15}
      />
    </section>
  );
}
