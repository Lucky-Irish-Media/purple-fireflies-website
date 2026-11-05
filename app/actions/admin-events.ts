"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { verifySession } from "@/app/lib/dal";
import { EventSchema, type Event } from "@/app/lib/definitions";
import { createEvent, deleteEvent, getEvents, updateEvent } from "@/app/lib/db";

export type EventsActionState = {
  errors?: Record<string, string[]>;
  message?: string;
  success?: boolean;
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

function slugify(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const UpdateEventSchema = EventSchema.extend({
  id: z.coerce.number(),
});

export async function createEventAction(
  _prevState: EventsActionState,
  formData: FormData,
): Promise<EventsActionState> {
  try {
    const session = await verifySession();
    if (session.role !== "admin" && session.role !== "content_editor") {
      return { success: false, message: "Unauthorized. Only content editors can manage events." };
    }

    const title = toField(formData.get("title"));
    const slugInput = toField(formData.get("slug"));
    const slug = slugInput || slugify(title);

    const validated = EventSchema.safeParse({
      title,
      slug,
      event_date: toField(formData.get("event_date")),
      start_time: toField(formData.get("start_time")),
      end_time: toField(formData.get("end_time")),
      location: toField(formData.get("location")),
      description: toField(formData.get("description")),
      body: toField(formData.get("body")),
      status: toField(formData.get("status")) || "draft",
      url: toField(formData.get("url")),
    });

    if (!validated.success) {
      return { success: false, errors: validated.error.flatten().fieldErrors };
    }

    const { title: t, slug: s, event_date, start_time, end_time, location, description, body, status, url } = validated.data;

    await createEvent({
      title: t,
      slug: s || null,
      eventDate: event_date,
      startTime: cleanOptional(start_time),
      endTime: cleanOptional(end_time),
      location: cleanOptional(location),
      description: cleanOptional(description),
      body: cleanOptional(body),
      status: status || "draft",
      url: cleanOptional(url),
    });

    const events = await getEvents();

    revalidatePath("/admin/events");
    revalidatePath("/events");

    return { success: true, message: `Event "${t}" created successfully.`, events };
  } catch (e) {
    console.error("createEvent action error:", e);
    return { success: false, message: "Failed to create event." };
  }
}

export async function updateEventAction(
  _prevState: EventsActionState,
  formData: FormData,
): Promise<EventsActionState> {
  try {
    const session = await verifySession();
    if (session.role !== "admin" && session.role !== "content_editor") {
      return { success: false, message: "Unauthorized. Only content editors can manage events." };
    }

    const id = formData.get("id");
    const title = toField(formData.get("title"));
    const slugInput = toField(formData.get("slug"));
    const slug = slugInput || slugify(title);

    const validated = UpdateEventSchema.safeParse({
      id,
      title,
      slug,
      event_date: toField(formData.get("event_date")),
      start_time: toField(formData.get("start_time")),
      end_time: toField(formData.get("end_time")),
      location: toField(formData.get("location")),
      description: toField(formData.get("description")),
      body: toField(formData.get("body")),
      status: toField(formData.get("status")) || "draft",
      url: toField(formData.get("url")),
    });

    if (!validated.success) {
      return { success: false, errors: validated.error.flatten().fieldErrors };
    }

    const { id: eid, title: t, slug: s, event_date, start_time, end_time, location, description, body, status, url } = validated.data;

    await updateEvent(eid, {
      title: t,
      slug: s || null,
      eventDate: event_date,
      startTime: cleanOptional(start_time),
      endTime: cleanOptional(end_time),
      location: cleanOptional(location),
      description: cleanOptional(description),
      body: cleanOptional(body),
      status: status || "draft",
      url: cleanOptional(url),
    });

    const events = await getEvents();

    revalidatePath("/admin/events");
    revalidatePath("/events");
    if (s) revalidatePath(`/events/${s}`);

    return { success: true, message: `Event "${t}" updated successfully.`, events };
  } catch (e) {
    console.error("updateEvent action error:", e);
    return { success: false, message: "Failed to update event." };
  }
}

export async function deleteEventAction(
  _prevState: EventsActionState,
  formData: FormData,
): Promise<EventsActionState> {
  try {
    const session = await verifySession();
    if (session.role !== "admin" && session.role !== "content_editor") {
      return { success: false, message: "Unauthorized. Only content editors can manage events." };
    }

    const id = Number(formData.get("id"));
    if (!id) {
      return { success: false, message: "Invalid event ID." };
    }

    await deleteEvent(id);

    const events = await getEvents();

    revalidatePath("/admin/events");
    revalidatePath("/events");

    return { success: true, message: "Event deleted successfully.", events };
  } catch (e) {
    console.error("deleteEvent action error:", e);
    return { success: false, message: "Failed to delete event." };
  }
}
