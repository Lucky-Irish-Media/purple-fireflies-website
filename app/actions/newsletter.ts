"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { verifySession } from "@/app/lib/dal";
import {
  NewsletterSchema,
  NewsletterSubscriberSchema,
} from "@/app/lib/definitions";
import type { Newsletter, NewsletterSubscriber } from "@/app/lib/definitions";
import {
  createNewsletter,
  updateNewsletter,
  deleteNewsletter,
  getNewsletters,
  getNewsletterById,
  getSubscriberByEmail,
  createSubscriber,
  resetSubscriberForResubscribe,
  getSubscriberByConfirmToken,
  updateSubscriberStatus,
  getSubscriberByUnsubscribeToken,
  getConfirmedSubscribers,
  markNewsletterSent,
  publishNewsletter,
} from "@/app/lib/db";
import {
  sendNewsletterConfirmation,
  sendNewsletterIssue,
} from "@/app/lib/email";
import { getCloudflareContext } from "@opennextjs/cloudflare";

export type NewsletterActionState = {
  errors?: Record<string, string[]>;
  message?: string;
  success?: boolean;
  newsletters?: Newsletter[];
} | undefined;

export type SubscribeState = {
  message?: string;
  success?: boolean;
  error?: string;
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

const UpdateNewsletterSchema = NewsletterSchema.extend({
  id: z.coerce.number(),
});

export async function subscribeNewsletterAction(
  _prevState: SubscribeState,
  formData: FormData,
): Promise<SubscribeState> {
  try {
    const validated = NewsletterSubscriberSchema.safeParse({
      email: toField(formData.get("email")),
      name: toField(formData.get("name")),
      tags: toField(formData.get("tags")),
    });

    if (!validated.success) {
      return { success: false, error: validated.error.issues[0]?.message || "Invalid input." };
    }

    const { email, name, tags } = validated.data;
    const existing = await getSubscriberByEmail(email);

    const confirmToken = crypto.randomUUID();
    const unsubscribeToken = crypto.randomUUID();

    if (existing) {
      if (existing.status === "confirmed") {
        // Re-subscribing requires fresh double opt-in
        await resetSubscriberForResubscribe(existing.id, confirmToken);
        await sendNewsletterConfirmation(email, name || existing.name, confirmToken);
        return { success: true, message: "Please check your email to confirm your subscription." };
      }
      if (existing.status === "unsubscribed") {
        await resetSubscriberForResubscribe(existing.id, confirmToken);
        await sendNewsletterConfirmation(email, name || existing.name, confirmToken);
        return { success: true, message: "Please check your email to confirm your subscription." };
      }
      // pending: resend confirmation
      await resetSubscriberForResubscribe(existing.id, confirmToken);
      await sendNewsletterConfirmation(email, name || existing.name, confirmToken);
      return { success: true, message: "Please check your email to confirm your subscription." };
    }

    await createSubscriber({
      email,
      name: name || null,
      tags: tags || "",
      confirmToken,
      unsubscribeToken,
    });
    await sendNewsletterConfirmation(email, name || null, confirmToken);
    return { success: true, message: "Please check your email to confirm your subscription." };
  } catch (e) {
    console.error("subscribeNewsletterAction error:", e);
    return { success: false, error: "Failed to subscribe. Please try again." };
  }
}

export async function confirmSubscriptionAction(token: string): Promise<{ success: boolean; message: string }> {
  try {
    if (!token) return { success: false, message: "Missing confirmation token." };
    const subscriber = await getSubscriberByConfirmToken(token);
    if (!subscriber) return { success: false, message: "Invalid or expired confirmation link." };
    if (subscriber.status === "confirmed") {
      return { success: true, message: "Your subscription is already confirmed." };
    }
    await updateSubscriberStatus(subscriber.id, "confirmed");
    return { success: true, message: "Your subscription has been confirmed. Thank you!" };
  } catch (e) {
    console.error("confirmSubscriptionAction error:", e);
    return { success: false, message: "Failed to confirm subscription." };
  }
}

export async function unsubscribeAction(token: string): Promise<{ success: boolean; message: string }> {
  try {
    if (!token) return { success: false, message: "Missing unsubscribe token." };
    const subscriber = await getSubscriberByUnsubscribeToken(token);
    if (!subscriber) return { success: false, message: "Invalid unsubscribe link." };
    if (subscriber.status === "unsubscribed") {
      return { success: true, message: "You are already unsubscribed." };
    }
    await updateSubscriberStatus(subscriber.id, "unsubscribed");
    return { success: true, message: "You have been unsubscribed." };
  } catch (e) {
    console.error("unsubscribeAction error:", e);
    return { success: false, message: "Failed to unsubscribe." };
  }
}

export async function createNewsletterAction(
  _prevState: NewsletterActionState,
  formData: FormData,
): Promise<NewsletterActionState> {
  try {
    const session = await verifySession();
    if (session.role !== "admin" && session.role !== "content_editor") {
      return { success: false, message: "Unauthorized." };
    }

    const title = toField(formData.get("title"));
    const slugInput = toField(formData.get("slug"));
    const slug = slugInput || slugify(title);

    const validated = NewsletterSchema.safeParse({
      title,
      slug,
      body: toField(formData.get("body")),
      excerpt: toField(formData.get("excerpt")),
      status: toField(formData.get("status")) || "draft",
    });

    if (!validated.success) {
      return { success: false, errors: validated.error.flatten().fieldErrors };
    }

    const { title: t, slug: s, body, excerpt, status } = validated.data;

    await createNewsletter({
      title: t,
      slug: s,
      body: body || "",
      excerpt: cleanOptional(excerpt),
      status,
      publishedAt: status === "published" ? new Date().toISOString() : null,
      authorUserId: session.userId,
    });

    const newsletters = await getNewsletters();
    revalidatePath("/admin/newsletters");
    revalidatePath("/newsletters");
    return { success: true, message: `Newsletter "${t}" created.`, newsletters };
  } catch (e) {
    console.error("createNewsletterAction error:", e);
    return { success: false, message: "Failed to create newsletter." };
  }
}

export async function updateNewsletterAction(
  _prevState: NewsletterActionState,
  formData: FormData,
): Promise<NewsletterActionState> {
  try {
    const session = await verifySession();
    if (session.role !== "admin" && session.role !== "content_editor") {
      return { success: false, message: "Unauthorized." };
    }

    const id = formData.get("id");
    const title = toField(formData.get("title"));
    const slugInput = toField(formData.get("slug"));
    const slug = slugInput || slugify(title);

    const validated = UpdateNewsletterSchema.safeParse({
      id,
      title,
      slug,
      body: toField(formData.get("body")),
      excerpt: toField(formData.get("excerpt")),
      status: toField(formData.get("status")) || "draft",
    });

    if (!validated.success) {
      return { success: false, errors: validated.error.flatten().fieldErrors };
    }

    const { id: nid, title: t, slug: s, body, excerpt, status } = validated.data;

    await updateNewsletter(nid, {
      title: t,
      slug: s,
      body: body || "",
      excerpt: cleanOptional(excerpt),
      status,
      publishedAt: status === "published" ? new Date().toISOString() : null,
    });

    const newsletters = await getNewsletters();
    revalidatePath("/admin/newsletters");
    revalidatePath("/newsletters");
    revalidatePath(`/newsletters/${s}`);
    return { success: true, message: `Newsletter "${t}" updated.`, newsletters };
  } catch (e) {
    console.error("updateNewsletterAction error:", e);
    return { success: false, message: "Failed to update newsletter." };
  }
}

export async function deleteNewsletterAction(
  _prevState: NewsletterActionState,
  formData: FormData,
): Promise<NewsletterActionState> {
  try {
    const session = await verifySession();
    if (session.role !== "admin" && session.role !== "content_editor") {
      return { success: false, message: "Unauthorized." };
    }

    const id = Number(formData.get("id"));
    if (!id) return { success: false, message: "Invalid newsletter ID." };

    await deleteNewsletter(id);

    const newsletters = await getNewsletters();
    revalidatePath("/admin/newsletters");
    revalidatePath("/newsletters");
    return { success: true, message: "Newsletter deleted.", newsletters };
  } catch (e) {
    console.error("deleteNewsletterAction error:", e);
    return { success: false, message: "Failed to delete newsletter." };
  }
}

export async function sendNewsletterAction(
  id: number,
  tags: string[],
): Promise<{ success: boolean; message: string; count?: number }> {
  try {
    const session = await verifySession();
    if (session.role !== "admin") {
      return { success: false, message: "Only admins can send newsletters." };
    }

    const newsletter = await getNewsletterById(id);
    if (!newsletter) return { success: false, message: "Newsletter not found." };

    const recipients = await getConfirmedSubscribers(tags && tags.length ? tags : undefined);
    if (recipients.length === 0) {
      return { success: false, message: "No confirmed subscribers match the selected segment." };
    }

    for (const r of recipients) {
      try {
        await sendNewsletterIssue({
          to: r.email,
          subject: newsletter.title,
          htmlBody: newsletter.body || "",
          unsubscribeToken: r.unsubscribe_token,
        });
      } catch (err) {
        console.error("Failed sending to", r.email, err);
      }
    }

    await markNewsletterSent(id, recipients.length);
    // also publish if not published
    if (newsletter.status === "draft") {
      await publishNewsletter(id);
    }

    revalidatePath("/admin/newsletters");
    revalidatePath("/newsletters");
    return { success: true, message: `Sent to ${recipients.length} subscriber(s).`, count: recipients.length };
  } catch (e) {
    console.error("sendNewsletterAction error:", e);
    return { success: false, message: "Failed to send newsletter." };
  }
}

export async function sendTestNewsletterAction(
  id: number,
  toEmail: string,
  body?: string,
): Promise<{ success: boolean; message: string }> {
  try {
    const session = await verifySession();
    if (session.role !== "admin" && session.role !== "content_editor") {
      return { success: false, message: "Unauthorized." };
    }
    const newsletter = await getNewsletterById(id);
    if (!newsletter) return { success: false, message: "Newsletter not found." };
    const htmlBody = body && body.trim() !== "" ? body : (newsletter.body || "");
    const fakeToken = crypto.randomUUID();
    await sendNewsletterIssue({
      to: toEmail,
      subject: `[TEST] ${newsletter.title}`,
      htmlBody,
      unsubscribeToken: fakeToken,
    });
    return { success: true, message: `Test sent to ${toEmail}.` };
  } catch (e) {
    console.error("sendTestNewsletterAction error:", e);
    return { success: false, message: "Failed to send test." };
  }
}

export async function uploadNewsletterImageAction(
  formData: FormData,
): Promise<{ success: boolean; url?: string; message?: string }> {
  try {
    const session = await verifySession();
    if (session.role !== "admin" && session.role !== "content_editor") {
      return { success: false, message: "Unauthorized." };
    }
    const file = formData.get("file") as File | null;
    if (!file) return { success: false, message: "No file provided." };

    const slugRaw = (formData.get("slug") as string | null) || "";
    const slug = slugRaw.trim().toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-+|-+$/g, "");

    const { env } = await getCloudflareContext({ async: true });
    const bucket = env.NEWSLETTER_IMAGES;
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const folder = slug ? `newsletters/${slug}` : "newsletters/drafts";
    const key = `${folder}/${crypto.randomUUID()}-${safeName}`;
    const arrayBuffer = await file.arrayBuffer();
    await bucket.put(key, arrayBuffer, {
      httpMetadata: { contentType: file.type || "application/octet-stream" },
    });
    return { success: true, url: `/newsletter-images/${key}` };
  } catch (e) {
    console.error("uploadNewsletterImageAction error:", e);
    return { success: false, message: "Failed to upload image." };
  }
}
