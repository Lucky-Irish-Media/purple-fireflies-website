"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { verifySession } from "@/app/lib/dal";
import { EventSchema, type Event } from "@/app/lib/definitions";
import { createEvent, deleteEvent, getEvents, updateEvent } from "@/app/lib/db";

export type EventsActionState = {
  errors?: Record<string, string[]>;
  message?: string;
  events?: Event[];
} | undefined;

function cleanOptional(value: string | undefined): string | null {
  if (value === undefined) return null;
  const s = value.trim();
  return s === "" ? null : s;
}

function toField(value: FormDataEntryValue | null): string {
  return value === null ? "" : String(value);
}

const UpdateEventSchema = EventSchema.extend({
  id: z.coerce.number(),
});

export async function createEventAction(
  _prevState: EventsActionState,
  formData: FormData,
): Promise<EventsActionState> {
  try {
    await verifySession();

    const validated = EventSchema.safeParse({
      title: toField(formData.get("title")),
      event_date: toField(formData.get("event_date")),
      start_time: toField(formData.get("start_time")),
      end_time: toField(formData.get("end_time")),
      location: toField(formData.get("location")),
      description: toField(formData.get("description")),
      url: toField(formData.get("url")),
    });

    if (!validated.success) {
      return { errors: validated.error.flatten().fieldErrors };
    }

    const { title, event_date, start_time, end_time, location, description, url } = validated.data;

    await createEvent({
      title,
      eventDate: event_date,
      startTime: cleanOptional(start_time),
      endTime: cleanOptional(end_time),
      location: cleanOptional(location),
      description: cleanOptional(description),
      url: cleanOptional(url),
    });

    const events = await getEvents();

    revalidatePath("/admin/events");

    return { message: `Event "${title}" created successfully.`, events };
  } catch (e) {
    console.error("createEvent action error:", e);
    return { message: "Failed to create event." };
  }
}

export async function updateEventAction(
  _prevState: EventsActionState,
  formData: FormData,
): Promise<EventsActionState> {
  try {
    await verifySession();

    const validated = UpdateEventSchema.safeParse({
      id: formData.get("id"),
      title: toField(formData.get("title")),
      event_date: toField(formData.get("event_date")),
      start_time: toField(formData.get("start_time")),
      end_time: toField(formData.get("end_time")),
      location: toField(formData.get("location")),
      description: toField(formData.get("description")),
      url: toField(formData.get("url")),
    });

    if (!validated.success) {
      return { errors: validated.error.flatten().fieldErrors };
    }

    const { id, title, event_date, start_time, end_time, location, description, url } = validated.data;

    await updateEvent(id, {
      title,
      eventDate: event_date,
      startTime: cleanOptional(start_time),
      endTime: cleanOptional(end_time),
      location: cleanOptional(location),
      description: cleanOptional(description),
      url: cleanOptional(url),
    });

    const events = await getEvents();

    revalidatePath("/admin/events");

    return { message: `Event "${title}" updated successfully.`, events };
  } catch (e) {
    console.error("updateEvent action error:", e);
    return { message: "Failed to update event." };
  }
}

export async function deleteEventAction(
  _prevState: EventsActionState,
  formData: FormData,
): Promise<EventsActionState> {
  try {
    await verifySession();

    const id = Number(formData.get("id"));
    if (!id) {
      return { message: "Invalid event ID." };
    }

    await deleteEvent(id);

    const events = await getEvents();

    revalidatePath("/admin/events");

    return { message: "Event deleted successfully.", events };
  } catch (e) {
    console.error("deleteEvent action error:", e);
    return { message: "Failed to delete event." };
  }
}
