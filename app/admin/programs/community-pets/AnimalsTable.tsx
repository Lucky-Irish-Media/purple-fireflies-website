"use client";

import { useActionState, useState } from "react";
import { createColumnHelper, filterFns, type Column, type ColumnDef } from "@tanstack/react-table";
import type {
  AnimalExpense,
  AnimalWithPhotos,
} from "@/app/lib/definitions";
import {
  ANIMAL_STATUS_OPTIONS,
  NEED_CADENCE_OPTIONS,
  parseAnimalNeeds,
} from "@/app/lib/definitions";
import {
  addAnimalExpenseAction,
  createAnimalAction,
  deleteAnimalAction,
  deleteAnimalExpenseAction,
  deleteAnimalPhotoAction,
  setAnimalPublishedAction,
  updateAnimalAction,
  type AnimalActionState,
} from "@/app/actions/admin-animals";
import { DataTable } from "../../components/DataTable";
import { Modal } from "../../components/Modal";
import { formatCents, formatDate, getAnimalStatusBadge } from "../../lib/utils";
import { PhotoUpload } from "./PhotoUpload";

const columnHelper = createColumnHelper<AnimalWithPhotos>();

const inputClass =
  "w-full rounded-lg border border-primary/10 bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary";
const labelClass = "block text-sm font-medium text-foreground mb-1";

type NeedRow = { label: string; cost: string; cadence: string };

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function centsToInput(cents: number): string {
  return (cents / 100).toString();
}

function needsToJson(rows: NeedRow[]): string {
  return JSON.stringify(
    rows
      .filter((row) => row.label.trim() !== "")
      .map((row) => ({
        label: row.label.trim(),
        cost_cents: Math.round((Number(row.cost) || 0) * 100),
        cadence: row.cadence || "one_time",
      })),
  );
}

function firstError(state: AnimalActionState): string | null {
  if (!state || state.success) return null;
  if (state.message) return state.message;
  if (!state.errors) return null;
  for (const key of Object.keys(state.errors)) {
    const messages = state.errors[key];
    if (messages && messages.length > 0) return messages[0];
  }
  return null;
}

function StatusFilter({ column }: { column: Column<AnimalWithPhotos, unknown> }) {
  const value = (column.getFilterValue() as string | undefined) ?? "";
  return (
    <select
      value={value}
      onChange={(e) => {
        e.stopPropagation();
        column.setFilterValue(e.target.value || undefined);
      }}
      onClick={(e) => e.stopPropagation()}
      className="w-full rounded border border-primary/10 bg-background px-2 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
    >
      <option value="">All</option>
      {ANIMAL_STATUS_OPTIONS.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

function PublishedFilter({ column }: { column: Column<AnimalWithPhotos, unknown> }) {
  const value = (column.getFilterValue() as string | undefined) ?? "";
  return (
    <select
      value={value}
      onChange={(e) => {
        e.stopPropagation();
        column.setFilterValue(e.target.value || undefined);
      }}
      onClick={(e) => e.stopPropagation()}
      className="w-full rounded border border-primary/10 bg-background px-2 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
    >
      <option value="">All</option>
      <option value="1">Published</option>
      <option value="0">Not published</option>
    </select>
  );
}

function AnimalFormFields({
  state,
  animal,
}: {
  state: AnimalActionState;
  animal: AnimalWithPhotos | null;
}) {
  const [slug, setSlug] = useState(animal?.slug ?? "");
  const [slugEdited, setSlugEdited] = useState(Boolean(animal));
  const [needs, setNeeds] = useState<NeedRow[]>(() =>
    parseAnimalNeeds(animal?.needs_json).map((need) => ({
      label: need.label,
      cost: centsToInput(need.cost_cents),
      cadence: need.cadence,
    })),
  );

  const needsTotalCents = needs.reduce(
    (sum, row) => sum + Math.round((Number(row.cost) || 0) * 100),
    0,
  );

  function updateNeed(index: number, patch: Partial<NeedRow>) {
    setNeeds((rows) =>
      rows.map((row, i) => (i === index ? { ...row, ...patch } : row)),
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="name" className={labelClass}>
            Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            defaultValue={animal?.name ?? ""}
            onChange={(e) => {
              if (!slugEdited) setSlug(slugify(e.currentTarget.value));
            }}
            className={inputClass}
          />
          {state?.errors?.name && (
            <p className="mt-1 text-sm text-red-500">{state.errors.name[0]}</p>
          )}
        </div>

        <div>
          <label htmlFor="slug" className={labelClass}>
            Slug
          </label>
          <input
            id="slug"
            name="slug"
            type="text"
            required
            value={slug}
            onChange={(e) => {
              setSlugEdited(true);
              setSlug(slugify(e.currentTarget.value));
            }}
            className={inputClass}
          />
          <p className="mt-1 text-xs text-text-secondary">
            Public URL: /programs/sponsor-a-pet/{slug || "pet-slug"}
          </p>
          {state?.errors?.slug && (
            <p className="mt-1 text-sm text-red-500">{state.errors.slug[0]}</p>
          )}
        </div>

        <div>
          <label htmlFor="species" className={labelClass}>
            Species
          </label>
          <input
            id="species"
            name="species"
            type="text"
            required
            placeholder="Dog, cat, rabbit..."
            defaultValue={animal?.species ?? ""}
            className={inputClass}
          />
          {state?.errors?.species && (
            <p className="mt-1 text-sm text-red-500">{state.errors.species[0]}</p>
          )}
        </div>

        <div>
          <label htmlFor="breed" className={labelClass}>
            Breed
          </label>
          <input
            id="breed"
            name="breed"
            type="text"
            defaultValue={animal?.breed ?? ""}
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="age_text" className={labelClass}>
            Age
          </label>
          <input
            id="age_text"
            name="age_text"
            type="text"
            placeholder="e.g. 4 years"
            defaultValue={animal?.age_text ?? ""}
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="sex" className={labelClass}>
            Sex
          </label>
          <input
            id="sex"
            name="sex"
            type="text"
            defaultValue={animal?.sex ?? ""}
            className={inputClass}
          />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="tagline" className={labelClass}>
            Tagline
          </label>
          <input
            id="tagline"
            name="tagline"
            type="text"
            placeholder="One line shown under the pet's name"
            defaultValue={animal?.tagline ?? ""}
            className={inputClass}
          />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="bio" className={labelClass}>
            Bio
          </label>
          <textarea
            id="bio"
            name="bio"
            rows={3}
            required
            defaultValue={animal?.bio ?? ""}
            className={inputClass}
          />
          {state?.errors?.bio && (
            <p className="mt-1 text-sm text-red-500">{state.errors.bio[0]}</p>
          )}
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="story" className={labelClass}>
            Story
          </label>
          <textarea
            id="story"
            name="story"
            rows={4}
            placeholder="How this pet came to the program"
            defaultValue={animal?.story ?? ""}
            className={inputClass}
          />
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold text-foreground">Needs</h4>
          <button
            type="button"
            onClick={() =>
              setNeeds((rows) => [
                ...rows,
                { label: "", cost: "", cadence: "one_time" },
              ])
            }
            className="rounded-lg border border-primary/10 px-3 py-1.5 text-xs font-medium text-foreground hover:bg-primary/5 transition-colors"
          >
            Add need
          </button>
        </div>

        {needs.length === 0 && (
          <p className="text-sm text-text-secondary">
            No needs yet. Each row is a real cost that makes up the pet&apos;s goal.
          </p>
        )}

        {needs.map((need, index) => (
          <div
            key={index}
            className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-start rounded-lg border border-primary/10 p-3"
          >
            <div className="sm:col-span-5">
              <input
                type="text"
                value={need.label}
                onChange={(e) => updateNeed(index, { label: e.target.value })}
                placeholder="Vet exam"
                aria-label={`Need ${index + 1} label`}
                className={inputClass}
              />
            </div>
            <div className="sm:col-span-3">
              <input
                type="number"
                min="0"
                step="0.01"
                value={need.cost}
                onChange={(e) => updateNeed(index, { cost: e.target.value })}
                placeholder="Cost (USD)"
                aria-label={`Need ${index + 1} cost`}
                className={inputClass}
              />
            </div>
            <div className="sm:col-span-3">
              <select
                value={need.cadence}
                onChange={(e) => updateNeed(index, { cadence: e.target.value })}
                aria-label={`Need ${index + 1} cadence`}
                className={inputClass}
              >
                {NEED_CADENCE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-1 flex sm:justify-end">
              <button
                type="button"
                onClick={() =>
                  setNeeds((rows) => rows.filter((_, i) => i !== index))
                }
                className="rounded-lg bg-red-100 px-3 py-1.5 text-xs font-medium text-red-800 transition-all hover:bg-red-200"
              >
                Remove
              </button>
            </div>
          </div>
        ))}

        <input type="hidden" name="needs_json" value={needsToJson(needs)} />

        {needs.length > 0 && (
          <p className="text-xs text-text-secondary">
            Needs total: {formatCents(needsTotalCents)}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="goal_usd" className={labelClass}>
            Goal (USD)
          </label>
          <input
            id="goal_usd"
            name="goal_usd"
            type="number"
            min="0"
            step="0.01"
            defaultValue={animal ? centsToInput(animal.goal_cents) : ""}
            className={inputClass}
          />
          {state?.errors?.goal_cents && (
            <p className="mt-1 text-sm text-red-500">
              {state.errors.goal_cents[0]}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="sort_order" className={labelClass}>
            Sort order
          </label>
          <input
            id="sort_order"
            name="sort_order"
            type="number"
            step="1"
            defaultValue={animal?.sort_order ?? 0}
            className={inputClass}
          />
        </div>
      </div>

      <fieldset className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <legend className="text-sm font-semibold text-foreground mb-2">
          Givebutter
        </legend>
        <div>
          <label htmlFor="gb_campaign_code" className={labelClass}>
            Campaign code
          </label>
          <input
            id="gb_campaign_code"
            name="gb_campaign_code"
            type="text"
            defaultValue={animal?.gb_campaign_code ?? ""}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="gb_campaign_url" className={labelClass}>
            Campaign URL
          </label>
          <input
            id="gb_campaign_url"
            name="gb_campaign_url"
            type="text"
            placeholder="https://givebutter.com/..."
            defaultValue={animal?.gb_campaign_url ?? ""}
            className={inputClass}
          />
          {state?.errors?.gb_campaign_url && (
            <p className="mt-1 text-sm text-red-500">
              {state.errors.gb_campaign_url[0]}
            </p>
          )}
        </div>
      </fieldset>

      <fieldset className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <legend className="text-sm font-semibold text-foreground mb-2">
          Owner consent
        </legend>
        <div>
          <label htmlFor="owner_consent_at" className={labelClass}>
            Consent signed on
          </label>
          <input
            id="owner_consent_at"
            name="owner_consent_at"
            type="date"
            defaultValue={animal?.owner_consent_at ?? ""}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="owner_consent_note" className={labelClass}>
            Consent note
          </label>
          <input
            id="owner_consent_note"
            name="owner_consent_note"
            type="text"
            placeholder="Where the signed form is filed"
            defaultValue={animal?.owner_consent_note ?? ""}
            className={inputClass}
          />
        </div>
      </fieldset>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="status" className={labelClass}>
            Status
          </label>
          <select
            id="status"
            name="status"
            defaultValue={animal?.status ?? "draft"}
            className={inputClass}
          >
            {ANIMAL_STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col justify-end">
          <label className="flex items-center gap-2 text-sm text-foreground">
            <input
              type="checkbox"
              name="is_published"
              value="on"
              defaultChecked={animal?.is_published === 1}
              className="h-4 w-4 rounded border-primary/20"
            />
            Published
          </label>
          <p className="mt-1 text-xs text-text-secondary">
            Publishing needs a consent date and a Givebutter campaign code.
          </p>
        </div>
      </div>

      {firstError(state) && (
        <p className="text-sm text-red-500">{firstError(state)}</p>
      )}
    </>
  );
}

function ExpensesSection({
  animal,
  expenses,
  addAction,
  addState,
  addPending,
  deleteAction,
  deletePending,
  formKey,
}: {
  animal: AnimalWithPhotos;
  expenses: AnimalExpense[];
  addAction: (formData: FormData) => void;
  addState: AnimalActionState;
  addPending: boolean;
  deleteAction: (formData: FormData) => void;
  deletePending: boolean;
  formKey: number;
}) {
  const spentCents = expenses.reduce((sum, row) => sum + row.amount_cents, 0);

  return (
    <section className="mt-6 space-y-3 border-t border-primary/10 pt-6">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-foreground">Expenses</h4>
        <span className="text-xs text-text-secondary">
          Spent {formatCents(spentCents)}
        </span>
      </div>

      {expenses.length === 0 ? (
        <p className="text-sm text-text-secondary">No expenses recorded.</p>
      ) : (
        <div className="space-y-2">
          {expenses.map((expense) => (
            <div
              key={expense.id}
              className="flex items-center justify-between gap-3 rounded-lg border border-primary/10 px-3 py-2"
            >
              <div className="space-y-0.5">
                <div className="text-sm text-foreground">{expense.label}</div>
                <div className="text-xs text-text-secondary">
                  {formatCents(expense.amount_cents)}
                  {expense.vendor ? ` - ${expense.vendor}` : ""}
                  {expense.spent_on ? ` - ${formatDate(expense.spent_on)}` : ""}
                </div>
              </div>
              <form action={deleteAction}>
                <input type="hidden" name="expense_id" value={expense.id} />
                <button
                  type="submit"
                  disabled={deletePending}
                  className="rounded-lg bg-red-100 px-3 py-1.5 text-xs font-medium text-red-800 transition-all hover:bg-red-200 disabled:opacity-50"
                >
                  Delete
                </button>
              </form>
            </div>
          ))}
        </div>
      )}

      <form key={formKey} action={addAction} className="space-y-3">
        <input type="hidden" name="animal_id" value={animal.id} />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="sm:col-span-2">
            <label htmlFor="expense_label" className={labelClass}>
              Description
            </label>
            <input
              id="expense_label"
              name="label"
              type="text"
              required
              placeholder="Vet visit"
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="expense_amount" className={labelClass}>
              Amount (USD)
            </label>
            <input
              id="expense_amount"
              name="amount_usd"
              type="number"
              min="0.01"
              step="0.01"
              required
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="expense_vendor" className={labelClass}>
              Vendor
            </label>
            <input
              id="expense_vendor"
              name="vendor"
              type="text"
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="expense_spent_on" className={labelClass}>
              Date
            </label>
            <input
              id="expense_spent_on"
              name="spent_on"
              type="date"
              className={inputClass}
            />
          </div>
        </div>

        {firstError(addState) && (
          <p className="text-sm text-red-500">{firstError(addState)}</p>
        )}

        <button
          type="submit"
          disabled={addPending}
          className="rounded-lg border border-primary/10 px-3 py-1.5 text-xs font-medium text-foreground hover:bg-primary/5 transition-colors disabled:opacity-50"
        >
          {addPending ? "Recording..." : "Record expense"}
        </button>
      </form>
    </section>
  );
}

function PhotosSection({
  animal,
  applyState,
  deleteAction,
  deletePending,
}: {
  animal: AnimalWithPhotos;
  applyState: (state: AnimalActionState) => AnimalActionState;
  deleteAction: (formData: FormData) => void;
  deletePending: boolean;
}) {
  return (
    <section className="mt-6 space-y-3 border-t border-primary/10 pt-6">
      <h4 className="text-sm font-semibold text-foreground">Photos</h4>

      {animal.photos.length === 0 ? (
        <p className="text-sm text-text-secondary">
          No photos yet. The first photo becomes the pet&apos;s cover image.
        </p>
      ) : (
        <div className="space-y-2">
          {animal.photos.map((photo) => (
            <div
              key={photo.id}
              className="flex items-center justify-between gap-3 rounded-lg border border-primary/10 px-3 py-2"
            >
              <div className="flex items-center gap-3">
                <img
                  src={`/api/media/${photo.photo_key}`}
                  alt={photo.alt || animal.name}
                  className="h-12 w-12 rounded-lg border border-primary/10 object-cover"
                />
                <div className="space-y-0.5">
                  <div className="text-sm text-foreground">{photo.photo_key}</div>
                  <div className="text-xs text-text-secondary">
                    Alt text: {photo.alt || "missing"}
                  </div>
                </div>
              </div>
              <form action={deleteAction}>
                <input type="hidden" name="photo_id" value={photo.id} />
                <button
                  type="submit"
                  disabled={deletePending}
                  className="rounded-lg bg-red-100 px-3 py-1.5 text-xs font-medium text-red-800 transition-all hover:bg-red-200 disabled:opacity-50"
                >
                  Remove
                </button>
              </form>
            </div>
          ))}
        </div>
      )}

      <PhotoUpload animalId={animal.id} applyState={applyState} />
    </section>
  );
}

export function AnimalsTable({
  initialAnimals,
  initialExpenses,
}: {
  initialAnimals: AnimalWithPhotos[];
  initialExpenses: AnimalExpense[];
}) {
  const [animals, setAnimals] = useState(initialAnimals);
  const [expenses, setExpenses] = useState(initialExpenses);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [actionMessage, setActionMessage] = useState<{
    text: string;
    success: boolean;
  } | null>(null);
  const [expenseFormKey, setExpenseFormKey] = useState(0);

  const editingAnimal = editingId
    ? animals.find((animal) => animal.id === editingId) ?? null
    : null;
  const editingExpenses = editingAnimal
    ? expenses.filter((expense) => expense.animal_id === editingAnimal.id)
    : [];

  function applyState(
    state: AnimalActionState,
    options: { closeModal?: boolean; resetExpenseForm?: boolean } = {},
  ) {
    if (state?.animals) {
      setAnimals(state.animals);
      setExpenses(state.expenses ?? []);
    }
    if (state?.message) {
      setActionMessage({ text: state.message, success: Boolean(state.success) });
    }
    if (state?.success && options.closeModal) {
      setModalOpen(false);
      setEditingId(null);
    }
    if (state?.success && options.resetExpenseForm) {
      setExpenseFormKey((key) => key + 1);
    }
    return state;
  }

  const [createState, createAction, createPending] = useActionState<
    AnimalActionState,
    FormData
  >(async (prev, formData) => {
    return applyState(await createAnimalAction(prev, formData), {
      closeModal: true,
    });
  }, undefined);

  const [updateState, updateAction, updatePending] = useActionState<
    AnimalActionState,
    FormData
  >(async (prev, formData) => {
    return applyState(await updateAnimalAction(prev, formData), {
      closeModal: true,
    });
  }, undefined);

  const [, publishAction, publishPending] = useActionState<
    AnimalActionState,
    FormData
  >(async (prev, formData) => {
    return applyState(await setAnimalPublishedAction(prev, formData));
  }, undefined);

  const [, deleteAction, deletePending] = useActionState<
    AnimalActionState,
    FormData
  >(async (prev, formData) => {
    return applyState(await deleteAnimalAction(prev, formData));
  }, undefined);

  const [, deletePhotoAction, deletePhotoPending] = useActionState<
    AnimalActionState,
    FormData
  >(async (prev, formData) => {
    return applyState(await deleteAnimalPhotoAction(prev, formData));
  }, undefined);

  const [expenseState, addExpenseAction, addExpensePending] = useActionState<
    AnimalActionState,
    FormData
  >(async (prev, formData) => {
    return applyState(await addAnimalExpenseAction(prev, formData), {
      resetExpenseForm: true,
    });
  }, undefined);

  const [, deleteExpenseAction, deleteExpensePending] = useActionState<
    AnimalActionState,
    FormData
  >(async (prev, formData) => {
    return applyState(await deleteAnimalExpenseAction(prev, formData));
  }, undefined);

  const spentByAnimal = new Map<number, number>();
  for (const expense of expenses) {
    spentByAnimal.set(
      expense.animal_id,
      (spentByAnimal.get(expense.animal_id) ?? 0) + expense.amount_cents,
    );
  }

  const columns = [
    columnHelper.display({
      id: "name",
      header: "Pet",
      cell: (info) => {
        const animal = info.row.original;
        const photo = animal.photos[0];
        return (
          <div className="flex items-center gap-3">
            {photo ? (
              <img
                src={`/api/media/${photo.photo_key}`}
                alt={photo.alt || animal.name}
                className="h-10 w-10 rounded-lg object-cover border border-primary/10"
              />
            ) : (
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary">
                {animal.name.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="space-y-0.5">
              <div className="text-foreground font-medium">{animal.name}</div>
              <div className="text-text-secondary text-xs">{animal.slug}</div>
            </div>
          </div>
        );
      },
    }),
    columnHelper.accessor((row) => row.species, {
      id: "species",
      header: "Species",
      cell: (info) => (
        <span className="text-text-secondary capitalize">
          {info.getValue()}
        </span>
      ),
      filterFn: filterFns.includesString,
    }),
    columnHelper.accessor((row) => row.status, {
      id: "status",
      header: "Status",
      cell: (info) => getAnimalStatusBadge(info.getValue()),
      filterFn: filterFns.equals,
      meta: { filterComponent: StatusFilter },
    }),
    columnHelper.accessor((row) => row.gb_raised_cents, {
      id: "raised",
      header: "Raised / Goal",
      enableColumnFilter: false,
      cell: (info) => {
        const animal = info.row.original;
        return (
          <div className="space-y-0.5">
            <div className="text-foreground text-sm">
              {formatCents(animal.gb_raised_cents)}{" "}
              <span className="text-text-secondary">
                of {formatCents(animal.goal_cents)}
              </span>
            </div>
            <div className="text-text-secondary text-xs">
              Spent {formatCents(spentByAnimal.get(animal.id) ?? 0)}
            </div>
          </div>
        );
      },
    }),
    columnHelper.accessor((row) => row.is_published, {
      id: "is_published",
      header: "Published",
      cell: (info) => {
        const published = info.getValue() === 1;
        return (
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              published
                ? "bg-green-100 text-green-800"
                : "bg-gray-100 text-gray-800"
            }`}
          >
            {published ? "Published" : "Draft"}
          </span>
        );
      },
      filterFn: filterFns.equals,
      meta: { filterComponent: PublishedFilter },
    }),
    columnHelper.accessor((row) => row.owner_consent_at, {
      id: "owner_consent_at",
      header: "Consent",
      enableColumnFilter: false,
      cell: (info) => {
        const consent = info.getValue();
        return (
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              consent
                ? "bg-green-100 text-green-800"
                : "bg-amber-100 text-amber-800"
            }`}
            title={consent ? `Signed ${consent}` : "No signed consent on file"}
          >
            {consent ? "Signed" : "Missing"}
          </span>
        );
      },
    }),
    columnHelper.display({
      id: "actions",
      header: "Actions",
      cell: (info) => {
        const animal = info.row.original;
        const published = animal.is_published === 1;
        const canPublish = Boolean(
          animal.owner_consent_at && animal.gb_campaign_code,
        );
        return (
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => {
                setEditingId(animal.id);
                setModalOpen(true);
              }}
              className="rounded-lg border border-primary/10 px-3 py-1.5 text-xs font-medium text-foreground hover:bg-primary/5 transition-colors"
            >
              Edit
            </button>

            <form action={publishAction} className="inline">
              <input type="hidden" name="id" value={animal.id} />
              <input
                type="hidden"
                name="publish"
                value={published ? "0" : "1"}
              />
              <button
                type="submit"
                disabled={publishPending}
                title={
                  !published && !canPublish
                    ? "Record owner consent and a Givebutter campaign code first"
                    : undefined
                }
                className="rounded-lg border border-primary/10 px-3 py-1.5 text-xs font-medium text-foreground hover:bg-primary/5 transition-colors disabled:opacity-50"
              >
                {published ? "Unpublish" : "Publish"}
              </button>
            </form>

            <form
              action={deleteAction}
              className="inline"
              onSubmit={(e) => {
                if (
                  !confirm(
                    `Delete "${animal.name}"? This cannot be undone. Pets with donor transactions cannot be deleted.`,
                  )
                ) {
                  e.preventDefault();
                }
              }}
            >
              <input type="hidden" name="id" value={animal.id} />
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
  ] as const;

  const typedColumns = columns as unknown as ColumnDef<
    AnimalWithPhotos,
    unknown
  >[];

  const formState = editingAnimal ? updateState : createState;
  const formPending = editingAnimal ? updatePending : createPending;
  const formAction = editingAnimal ? updateAction : createAction;

  return (
    <section className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-foreground">Animals</h2>
          <p className="text-sm text-text-secondary mt-1">
            {animals.length} pet{animals.length === 1 ? "" : "s"} in the program
          </p>
        </div>
        <button
          onClick={() => {
            setEditingId(null);
            setModalOpen(true);
          }}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-primary-dark"
        >
          Add Pet
        </button>
      </div>

      {actionMessage && (
        <p
          className={`text-sm ${
            actionMessage.success ? "text-green-600" : "text-red-500"
          }`}
        >
          {actionMessage.text}
        </p>
      )}

      <Modal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingId(null);
        }}
        title={editingAnimal ? "Edit Pet" : "New Pet"}
      >
        <form action={formAction} className="space-y-4">
          {editingAnimal && (
            <input type="hidden" name="id" value={editingAnimal.id} />
          )}

          <AnimalFormFields
            key={editingAnimal?.id ?? "new"}
            state={formState}
            animal={editingAnimal}
          />

          <button
            type="submit"
            disabled={formPending}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-primary-dark disabled:opacity-50"
          >
            {formPending
              ? editingAnimal
                ? "Saving..."
                : "Creating..."
              : editingAnimal
                ? "Save Changes"
                : "Create Pet"}
          </button>
        </form>

        {editingAnimal && (
          <>
            <ExpensesSection
              animal={editingAnimal}
              expenses={editingExpenses}
              addAction={addExpenseAction}
              addState={expenseState}
              addPending={addExpensePending}
              deleteAction={deleteExpenseAction}
              deletePending={deleteExpensePending}
              formKey={expenseFormKey}
            />

            <PhotosSection
              animal={editingAnimal}
              applyState={applyState}
              deleteAction={deletePhotoAction}
              deletePending={deletePhotoPending}
            />
          </>
        )}
      </Modal>

      <DataTable
        data={animals}
        columns={typedColumns}
        enableSorting
        enableFiltering
        enablePagination
        enableColumnVisibility
        enableGlobalFilter
        enableColumnPinning
        enableColumnResizing
        enableFacetedFilters
        initialColumnPinning={{ left: ["name"], right: ["actions"] }}
        initialSorting={[{ id: "name", desc: false }]}
        pageSize={25}
        storageKey="community-pets-column-visibility"
      />
    </section>
  );
}
