"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { verifySession } from "@/app/lib/dal";
import {
  NewsletterSubscriberSchema,
  type NewsletterSubscriber,
} from "@/app/lib/definitions";
import {
  createSubscriber,
  updateSubscriber,
  deleteSubscriber,
  getNewsletterSubscribers,
  getSubscriberByEmail,
  updateSubscriberStatus,
} from "@/app/lib/db";

export type AdminSubscriberActionState = {
  errors?: Record<string, string[]>;
  message?: string;
  success?: boolean;
  subscribers?: NewsletterSubscriber[];
} | undefined;

const StatusSchema = z.enum(["pending", "confirmed", "unsubscribed"]);

const CreateSubscriberSchema = NewsletterSubscriberSchema.extend({
  status: StatusSchema,
});

const UpdateSubscriberSchema = NewsletterSubscriberSchema.extend({
  id: z.coerce.number(),
  status: StatusSchema,
});

function toField(value: FormDataEntryValue | null): string {
  return value === null ? "" : String(value);
}

export async function createSubscriberAction(
  _prevState: AdminSubscriberActionState,
  formData: FormData,
): Promise<AdminSubscriberActionState> {
  try {
    const session = await verifySession();
    if (session.role !== "admin") {
      return { success: false, message: "Not authorized." };
    }

    const validated = CreateSubscriberSchema.safeParse({
      email: toField(formData.get("email")),
      name: toField(formData.get("name")),
      tags: toField(formData.get("tags")),
      status: toField(formData.get("status")) || "pending",
    });

    if (!validated.success) {
      const fieldErrors: Record<string, string[]> = {};
      for (const issue of validated.error.issues) {
        const key = issue.path[0]?.toString() || "form";
        fieldErrors[key] = fieldErrors[key] || [];
        fieldErrors[key].push(issue.message);
      }
      return { success: false, errors: fieldErrors, message: "Please fix the errors below." };
    }

    const { email, name, status } = validated.data;
    const tags = (validated.data.tags || "")
      .split(",")
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean)
      .filter((t, i, arr) => arr.indexOf(t) === i)
      .join(", ");

    const existing = await getSubscriberByEmail(email);
    if (existing) {
      return { success: false, errors: { email: ["A subscriber with this email already exists."] }, message: "Duplicate email." };
    }

    const confirmToken = crypto.randomUUID();
    const unsubscribeToken = crypto.randomUUID();

    const created = await createSubscriber({
      email,
      name: name || null,
      tags: tags || "",
      confirmToken,
      unsubscribeToken,
    });

    if (status !== "pending") {
      await updateSubscriberStatus(created.id, status);
    }

    const subscribers = await getNewsletterSubscribers();
    revalidatePath("/admin/newsletters");
    return { success: true, message: "Subscriber created.", subscribers };
  } catch (e) {
    console.error("createSubscriberAction error:", e);
    return { success: false, message: "Failed to create subscriber." };
  }
}

export async function updateSubscriberAction(
  _prevState: AdminSubscriberActionState,
  formData: FormData,
): Promise<AdminSubscriberActionState> {
  try {
    const session = await verifySession();
    if (session.role !== "admin") {
      return { success: false, message: "Not authorized." };
    }

    const validated = UpdateSubscriberSchema.safeParse({
      id: toField(formData.get("id")),
      email: toField(formData.get("email")),
      name: toField(formData.get("name")),
      tags: toField(formData.get("tags")),
      status: toField(formData.get("status")) || "pending",
    });

    if (!validated.success) {
      const fieldErrors: Record<string, string[]> = {};
      for (const issue of validated.error.issues) {
        const key = issue.path[0]?.toString() || "form";
        fieldErrors[key] = fieldErrors[key] || [];
        fieldErrors[key].push(issue.message);
      }
      return { success: false, errors: fieldErrors, message: "Please fix the errors below." };
    }

    const { id, email, name, status } = validated.data;
    const tags = (validated.data.tags || "")
      .split(",")
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean)
      .filter((t, i, arr) => arr.indexOf(t) === i)
      .join(", ");

    const existing = await getSubscriberByEmail(email);
    if (existing && existing.id !== id) {
      return { success: false, errors: { email: ["A subscriber with this email already exists."] }, message: "Duplicate email." };
    }

    await updateSubscriber(id, { email, name: name || null, tags: tags || "", status });
    const subscribers = await getNewsletterSubscribers();
    revalidatePath("/admin/newsletters");
    return { success: true, message: "Subscriber updated.", subscribers };
  } catch (e) {
    console.error("updateSubscriberAction error:", e);
    return { success: false, message: "Failed to update subscriber." };
  }
}

export async function deleteSubscriberAction(
  _prevState: AdminSubscriberActionState,
  formData: FormData,
): Promise<AdminSubscriberActionState> {
  try {
    const session = await verifySession();
    if (session.role !== "admin") {
      return { success: false, message: "Not authorized." };
    }

    const id = Number(formData.get("id"));
    if (!id) return { success: false, message: "Missing subscriber ID." };

    await deleteSubscriber(id);
    const subscribers = await getNewsletterSubscribers();
    revalidatePath("/admin/newsletters");
    return { success: true, message: "Subscriber deleted.", subscribers };
  } catch (e) {
    console.error("deleteSubscriberAction error:", e);
    return { success: false, message: "Failed to delete subscriber." };
  }
}
