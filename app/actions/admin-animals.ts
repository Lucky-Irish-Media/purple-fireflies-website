"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { verifySession } from "@/app/lib/dal";
import {
  AnimalExpenseSchema,
  AnimalNeedListSchema,
  AnimalSchema,
  type Animal,
  type AnimalExpense,
  type AnimalInput,
  type AnimalNeed,
  type AnimalWithPhotos,
} from "@/app/lib/definitions";
import {
  addAnimalExpense,
  createAnimal,
  deleteAnimal,
  deleteAnimalExpense,
  deleteAnimalPhoto,
  getAllAnimalExpenses,
  getAllAnimals,
  getAnimalById,
  updateAnimal,
} from "@/app/lib/db";

export type AnimalActionState = {
  errors?: Record<string, string[]>;
  message?: string;
  success?: boolean;
  animals?: AnimalWithPhotos[];
  expenses?: AnimalExpense[];
} | undefined;

function toField(value: FormDataEntryValue | null): string {
  return value === null ? "" : String(value);
}

/**
 * Admin forms take dollars because that is what a person types on a receipt.
 * `AnimalSchema` and the tables store integer cents. A blank input reads as
 * zero; garbage becomes NaN so Zod rejects it instead of silently writing 0.
 */
function toCents(value: string): number {
  const trimmed = value.trim();
  if (trimmed === "") return 0;
  const parsed = Number(trimmed);
  if (!Number.isFinite(parsed) || parsed < 0) return Number.NaN;
  return Math.round(parsed * 100);
}

function parseNeedsField(raw: string): { needs: AnimalNeed[]; error?: string } {
  if (!raw.trim()) return { needs: [] };
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return {
      needs: [],
      error: "The needs list could not be read. Remove the bad row and try again.",
    };
  }
  const result = AnimalNeedListSchema.safeParse(parsed);
  if (!result.success) {
    return {
      needs: [],
      error: "Each need needs a label and a cost of zero or more.",
    };
  }
  return { needs: result.data };
}

function parseAnimalForm(formData: FormData, needs: AnimalNeed[]) {
  return AnimalSchema.safeParse({
    slug: toField(formData.get("slug")),
    name: toField(formData.get("name")),
    species: toField(formData.get("species")),
    breed: toField(formData.get("breed")),
    age_text: toField(formData.get("age_text")),
    sex: toField(formData.get("sex")),
    tagline: toField(formData.get("tagline")),
    bio: toField(formData.get("bio")),
    story: toField(formData.get("story")),
    needs_json: needs.length ? JSON.stringify(needs) : "",
    goal_cents: toCents(toField(formData.get("goal_usd"))),
    gb_campaign_code: toField(formData.get("gb_campaign_code")),
    gb_campaign_url: toField(formData.get("gb_campaign_url")),
    status: toField(formData.get("status")) || "draft",
    is_published: formData.get("is_published") ?? "",
    owner_consent_at: toField(formData.get("owner_consent_at")),
    owner_consent_note: toField(formData.get("owner_consent_note")),
    sort_order: toField(formData.get("sort_order")) || "0",
  });
}

function toInput(
  data: z.infer<typeof AnimalSchema>,
  overrides: Partial<AnimalInput> = {},
): AnimalInput {
  return {
    slug: data.slug,
    name: data.name,
    species: data.species,
    breed: data.breed,
    age_text: data.age_text,
    sex: data.sex,
    tagline: data.tagline,
    bio: data.bio,
    story: data.story,
    needs_json: data.needs_json,
    goal_cents: data.goal_cents,
    gb_campaign_code: data.gb_campaign_code,
    gb_campaign_url: data.gb_campaign_url,
    status: data.status,
    is_published: data.is_published,
    owner_consent_at: data.owner_consent_at,
    owner_consent_note: data.owner_consent_note,
    sort_order: data.sort_order,
    ...overrides,
  };
}

function existingToInput(
  animal: Animal,
  overrides: Partial<AnimalInput> = {},
): AnimalInput {
  return {
    slug: animal.slug,
    name: animal.name,
    species: animal.species,
    breed: animal.breed,
    age_text: animal.age_text,
    sex: animal.sex,
    tagline: animal.tagline,
    bio: animal.bio,
    story: animal.story,
    needs_json: animal.needs_json,
    goal_cents: animal.goal_cents,
    gb_campaign_code: animal.gb_campaign_code,
    gb_campaign_url: animal.gb_campaign_url,
    status: animal.status,
    is_published: animal.is_published === 1,
    owner_consent_at: animal.owner_consent_at,
    owner_consent_note: animal.owner_consent_note,
    sort_order: animal.sort_order,
    ...overrides,
  };
}

/**
 * The publish gate. Disabling the checkbox in the UI is a courtesy, not the
 * rule: a draft can be saved before either prerequisite exists, but nothing can
 * go public until the owner has signed and a Givebutter campaign exists.
 */
function publishGateError(data: {
  is_published: boolean;
  owner_consent_at?: string | null;
  gb_campaign_code?: string | null;
}): string | null {
  if (!data.is_published) return null;
  if (!data.owner_consent_at?.trim()) {
    return "Cannot publish: record the owner's signed consent date first.";
  }
  if (!data.gb_campaign_code?.trim()) {
    return "Cannot publish: add the Givebutter campaign code first.";
  }
  return null;
}

async function currentState() {
  const [animals, expenses] = await Promise.all([
    getAllAnimals(),
    getAllAnimalExpenses(),
  ]);
  return { animals, expenses };
}

function revalidateAnimalPaths() {
  revalidatePath("/admin/programs/community-pets");
  revalidatePath("/admin/programs");
  revalidatePath("/programs/community-pets");
}

export async function createAnimalAction(
  _prevState: AnimalActionState,
  formData: FormData,
): Promise<AnimalActionState> {
  try {
    await verifySession();

    const needs = parseNeedsField(toField(formData.get("needs_json")));
    if (needs.error) {
      return { success: false, message: needs.error };
    }

    const validated = parseAnimalForm(formData, needs.needs);
    if (!validated.success) {
      return { success: false, errors: validated.error.flatten().fieldErrors };
    }

    const gate = publishGateError(validated.data);
    if (gate) {
      return { success: false, message: gate };
    }

    const animal = await createAnimal(toInput(validated.data));
    const state = await currentState();
    revalidateAnimalPaths();

    return {
      success: true,
      message: `"${animal.name}" created.`,
      ...state,
    };
  } catch (e) {
    console.error("createAnimalAction error:", e);
    if (e instanceof Error && e.message.includes("UNIQUE")) {
      return {
        success: false,
        message: "That slug is already in use. Pick a different one.",
      };
    }
    return { success: false, message: "Failed to create the pet." };
  }
}

export async function updateAnimalAction(
  _prevState: AnimalActionState,
  formData: FormData,
): Promise<AnimalActionState> {
  try {
    await verifySession();

    const id = Number(formData.get("id"));
    if (!id) {
      return { success: false, message: "Invalid pet ID." };
    }

    const needs = parseNeedsField(toField(formData.get("needs_json")));
    if (needs.error) {
      return { success: false, message: needs.error };
    }

    const validated = parseAnimalForm(formData, needs.needs);
    if (!validated.success) {
      return { success: false, errors: validated.error.flatten().fieldErrors };
    }

    const gate = publishGateError(validated.data);
    if (gate) {
      return { success: false, message: gate };
    }

    const animal = await updateAnimal(id, toInput(validated.data));
    const state = await currentState();
    revalidateAnimalPaths();

    return {
      success: true,
      message: `"${animal.name}" updated.`,
      ...state,
    };
  } catch (e) {
    console.error("updateAnimalAction error:", e);
    if (e instanceof Error && e.message.includes("UNIQUE")) {
      return {
        success: false,
        message: "That slug is already in use. Pick a different one.",
      };
    }
    return { success: false, message: "Failed to update the pet." };
  }
}

export async function setAnimalPublishedAction(
  _prevState: AnimalActionState,
  formData: FormData,
): Promise<AnimalActionState> {
  try {
    await verifySession();

    const id = Number(formData.get("id"));
    const publish = toField(formData.get("publish")) === "1";
    if (!id) {
      return { success: false, message: "Invalid pet ID." };
    }

    const animal = await getAnimalById(id);
    if (!animal) {
      return { success: false, message: "Pet not found." };
    }

    const gate = publishGateError({
      is_published: publish,
      owner_consent_at: animal.owner_consent_at,
      gb_campaign_code: animal.gb_campaign_code,
    });
    if (gate) {
      return { success: false, message: gate };
    }

    const updated = await updateAnimal(
      id,
      existingToInput(animal, { is_published: publish }),
    );
    const state = await currentState();
    revalidateAnimalPaths();

    return {
      success: true,
      message: publish
        ? `"${updated.name}" is now published.`
        : `"${updated.name}" is no longer public.`,
      ...state,
    };
  } catch (e) {
    console.error("setAnimalPublishedAction error:", e);
    return { success: false, message: "Failed to change the publish state." };
  }
}

export async function deleteAnimalAction(
  _prevState: AnimalActionState,
  formData: FormData,
): Promise<AnimalActionState> {
  try {
    await verifySession();

    const id = Number(formData.get("id"));
    if (!id) {
      return { success: false, message: "Invalid pet ID." };
    }

    await deleteAnimal(id);
    const state = await currentState();
    revalidateAnimalPaths();

    return { success: true, message: "Pet deleted.", ...state };
  } catch (e) {
    console.error("deleteAnimalAction error:", e);
    const message = e instanceof Error ? e.message : "";
    if (message.includes("FOREIGN KEY")) {
      return {
        success: false,
        message:
          "This pet has donor transactions recorded, so it cannot be deleted. Set its status to Closed instead.",
      };
    }
    return { success: false, message: "Failed to delete the pet." };
  }
}

/**
 * Removes the photo row. The R2 object is deleted by the media storage task,
 * which owns the bucket; this action deliberately knows only about D1.
 */
export async function deleteAnimalPhotoAction(
  _prevState: AnimalActionState,
  formData: FormData,
): Promise<AnimalActionState> {
  try {
    await verifySession();

    const id = Number(formData.get("photo_id"));
    if (!id) {
      return { success: false, message: "Invalid photo ID." };
    }

    const deleted = await deleteAnimalPhoto(id);
    if (!deleted) {
      return { success: false, message: "Photo not found." };
    }

    const state = await currentState();
    revalidateAnimalPaths();

    return { success: true, message: "Photo removed.", ...state };
  } catch (e) {
    console.error("deleteAnimalPhotoAction error:", e);
    return { success: false, message: "Failed to remove the photo." };
  }
}

export async function addAnimalExpenseAction(
  _prevState: AnimalActionState,
  formData: FormData,
): Promise<AnimalActionState> {
  try {
    await verifySession();

    const animalId = Number(formData.get("animal_id"));
    if (!animalId) {
      return { success: false, message: "Invalid pet ID." };
    }

    const validated = AnimalExpenseSchema.safeParse({
      label: toField(formData.get("label")),
      amount_cents: toCents(toField(formData.get("amount_usd"))),
      vendor: toField(formData.get("vendor")),
      spent_on: toField(formData.get("spent_on")),
    });

    if (!validated.success) {
      return { success: false, errors: validated.error.flatten().fieldErrors };
    }

    const { label, amount_cents, vendor, spent_on } = validated.data;
    await addAnimalExpense({
      animalId,
      label,
      amountCents: amount_cents,
      vendor,
      spentOn: spent_on,
    });

    const state = await currentState();
    revalidateAnimalPaths();

    return { success: true, message: "Expense recorded.", ...state };
  } catch (e) {
    console.error("addAnimalExpenseAction error:", e);
    return { success: false, message: "Failed to record the expense." };
  }
}

export async function deleteAnimalExpenseAction(
  _prevState: AnimalActionState,
  formData: FormData,
): Promise<AnimalActionState> {
  try {
    await verifySession();

    const id = Number(formData.get("expense_id"));
    if (!id) {
      return { success: false, message: "Invalid expense ID." };
    }

    await deleteAnimalExpense(id);
    const state = await currentState();
    revalidateAnimalPaths();

    return { success: true, message: "Expense deleted.", ...state };
  } catch (e) {
    console.error("deleteAnimalExpenseAction error:", e);
    return { success: false, message: "Failed to delete the expense." };
  }
}
