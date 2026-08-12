"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { verifySession } from "@/app/lib/dal";
import { NewsArticleSchema, type NewsArticle } from "@/app/lib/definitions";
import {
  createNewsArticle,
  deleteNewsArticle,
  getNewsArticles,
  updateNewsArticle,
} from "@/app/lib/db";

export type NewsActionState = {
  errors?: Record<string, string[]>;
  message?: string;
  success?: boolean;
  articles?: NewsArticle[];
} | undefined;

function cleanOptional(value: string | undefined): string | null {
  if (value === undefined) return null;
  const s = value.trim();
  return s === "" ? null : s;
}

function toField(value: FormDataEntryValue | null): string {
  return value === null ? "" : String(value);
}

const UpdateNewsArticleSchema = NewsArticleSchema.extend({
  id: z.coerce.number(),
});

export async function createNewsAction(
  _prevState: NewsActionState,
  formData: FormData,
): Promise<NewsActionState> {
  try {
    await verifySession();

    const validated = NewsArticleSchema.safeParse({
      title: toField(formData.get("title")),
      source: toField(formData.get("source")),
      url: toField(formData.get("url")),
      published_at: toField(formData.get("published_at")),
      excerpt: toField(formData.get("excerpt")),
    });

    if (!validated.success) {
      return { success: false, errors: validated.error.flatten().fieldErrors };
    }

    const { title, source, url, published_at, excerpt } = validated.data;

    await createNewsArticle({
      title,
      source,
      url,
      publishedAt: published_at,
      excerpt: cleanOptional(excerpt),
    });

    const articles = await getNewsArticles();

    revalidatePath("/admin/news");

    return { success: true, message: `Article "${title}" created successfully.`, articles };
  } catch (e) {
    console.error("createNewsArticle action error:", e);
    return { success: false, message: "Failed to create article." };
  }
}

export async function updateNewsArticleAction(
  _prevState: NewsActionState,
  formData: FormData,
): Promise<NewsActionState> {
  try {
    await verifySession();

    const validated = UpdateNewsArticleSchema.safeParse({
      id: formData.get("id"),
      title: toField(formData.get("title")),
      source: toField(formData.get("source")),
      url: toField(formData.get("url")),
      published_at: toField(formData.get("published_at")),
      excerpt: toField(formData.get("excerpt")),
    });

    if (!validated.success) {
      return { success: false, errors: validated.error.flatten().fieldErrors };
    }

    const { id, title, source, url, published_at, excerpt } = validated.data;

    await updateNewsArticle(id, {
      title,
      source,
      url,
      publishedAt: published_at,
      excerpt: cleanOptional(excerpt),
    });

    const articles = await getNewsArticles();

    revalidatePath("/admin/news");

    return { success: true, message: `Article "${title}" updated successfully.`, articles };
  } catch (e) {
    console.error("updateNewsArticle action error:", e);
    return { success: false, message: "Failed to update article." };
  }
}

export async function deleteNewsArticleAction(
  _prevState: NewsActionState,
  formData: FormData,
): Promise<NewsActionState> {
  try {
    await verifySession();

    const id = Number(formData.get("id"));
    if (!id) {
      return { success: false, message: "Invalid article ID." };
    }

    await deleteNewsArticle(id);

    const articles = await getNewsArticles();

    revalidatePath("/admin/news");

    return { success: true, message: "Article deleted successfully.", articles };
  } catch (e) {
    console.error("deleteNewsArticle action error:", e);
    return { success: false, message: "Failed to delete article." };
  }
}
