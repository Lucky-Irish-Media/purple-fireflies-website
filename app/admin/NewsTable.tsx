"use client";

import { useState, useActionState, useMemo } from "react";
import type { NewsArticle } from "@/app/lib/definitions";
import {
  createNewsAction,
  updateNewsArticleAction,
  deleteNewsArticleAction,
  type NewsActionState,
} from "@/app/actions/admin-news";
import { DataTable } from "./components/DataTable";
import { Modal } from "./components/Modal";
import { formatDate } from "./lib/utils";
import { createColumnHelper, type ColumnDef, filterFns } from "@tanstack/react-table";

const columnHelper = createColumnHelper<NewsArticle>();

function ArticleFormFields({ state, article }: {
  state: NewsActionState;
  article: NewsArticle | null;
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
            defaultValue={article?.title || ""}
            className="w-full rounded-lg border border-primary/10 bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
          {state?.errors?.title && (
            <p className="mt-1 text-sm text-red-500">{state.errors.title[0]}</p>
          )}
        </div>

        <div>
          <label htmlFor="source" className="block text-sm font-medium text-foreground mb-1">
            Source
          </label>
          <input
            id="source"
            name="source"
            type="text"
            required
            placeholder="e.g. The Athens Messenger"
            defaultValue={article?.source || ""}
            className="w-full rounded-lg border border-primary/10 bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
          {state?.errors?.source && (
            <p className="mt-1 text-sm text-red-500">{state.errors.source[0]}</p>
          )}
        </div>

        <div>
          <label htmlFor="published_at" className="block text-sm font-medium text-foreground mb-1">
            Published Date
          </label>
          <input
            id="published_at"
            name="published_at"
            type="date"
            required
            defaultValue={article?.published_at || ""}
            className="w-full rounded-lg border border-primary/10 bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
          {state?.errors?.published_at && (
            <p className="mt-1 text-sm text-red-500">{state.errors.published_at[0]}</p>
          )}
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="url" className="block text-sm font-medium text-foreground mb-1">
            Article URL
          </label>
          <input
            id="url"
            name="url"
            type="text"
            required
            placeholder="https://..."
            defaultValue={article?.url || ""}
            className="w-full rounded-lg border border-primary/10 bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
          {state?.errors?.url && (
            <p className="mt-1 text-sm text-red-500">{state.errors.url[0]}</p>
          )}
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="excerpt" className="block text-sm font-medium text-foreground mb-1">
            Excerpt
          </label>
          <textarea
            id="excerpt"
            name="excerpt"
            rows={3}
            defaultValue={article?.excerpt || ""}
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

export default function NewsTable({ initialArticles }: { initialArticles: NewsArticle[] }) {
  const [articles, setArticles] = useState(initialArticles);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<NewsArticle | null>(null);
  const [actionMessage, setActionMessage] = useState<{ text: string; success: boolean } | null>(null);

  const [createState, createAction, createPending] = useActionState<
    NewsActionState,
    FormData
  >(async (prev, formData) => {
    const result = await createNewsAction(prev, formData);
    if (result?.articles) {
      setArticles(result.articles);
      setModalOpen(false);
      setActionMessage({ text: result.message || "", success: true });
    }
    return result;
  }, undefined);

  const [updateState, updateAction, updatePending] = useActionState<
    NewsActionState,
    FormData
  >(async (prev, formData) => {
    const result = await updateNewsArticleAction(prev, formData);
    if (result?.articles) {
      setArticles(result.articles);
      setModalOpen(false);
      setActionMessage({ text: result.message || "", success: true });
    }
    return result;
  }, undefined);

  const [, deleteAction, deletePending] = useActionState<
    NewsActionState,
    FormData
  >(async (prev, formData) => {
    const result = await deleteNewsArticleAction(prev, formData);
    if (result?.articles) {
      setArticles(result.articles);
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
    columnHelper.accessor((row) => row.source, {
      id: "source",
      header: "Source",
      cell: (info) => <span className="text-text-secondary">{info.getValue()}</span>,
      filterFn: filterFns.includesString,
    }),
    columnHelper.accessor((row) => row.published_at, {
      id: "published_at",
      header: "Published",
      cell: (info) => <span className="text-text-secondary">{formatDate(info.getValue())}</span>,
      filterFn: filterFns.includesString,
    }),
    columnHelper.accessor((row) => row.url, {
      id: "url",
      header: "Link",
      cell: (info) => {
        const url = info.getValue();
        return (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            Open
          </a>
        );
      },
      filterFn: filterFns.includesString,
    }),
    columnHelper.display({
      id: "actions",
      header: "Actions",
      cell: (info) => {
        const article = info.row.original;
        return (
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setEditingArticle(article);
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
                if (!confirm(`Delete article "${article.title}"? This cannot be undone.`)) {
                  e.preventDefault();
                }
              }}
            >
              <input type="hidden" name="id" value={article.id} />
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

  const typedColumns = columns as unknown as ColumnDef<NewsArticle, unknown>[];

  const formState = editingArticle ? updateState : createState;
  const formPending = editingArticle ? updatePending : createPending;
  const formAction = editingArticle ? updateAction : createAction;

  function handleCreateAddForm() {
    setEditingArticle(null);
    setModalOpen(true);
  }

  function handleModalClose() {
    setModalOpen(false);
    setEditingArticle(null);
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <h2 className="text-xl font-bold text-foreground">News Articles</h2>
        <button
          onClick={handleCreateAddForm}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-primary-dark"
        >
          Add Article
        </button>
      </div>

      <p className="text-text-secondary">Total articles: {articles.length}</p>

      <Modal
        open={modalOpen}
        onClose={handleModalClose}
        title={editingArticle ? "Edit Article" : "New Article"}
      >
        <form action={formAction} className="space-y-4">
          {editingArticle && <input type="hidden" name="id" value={editingArticle.id} />}

          <ArticleFormFields state={formState} article={editingArticle} />

          <button
            type="submit"
            disabled={formPending}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-primary-dark disabled:opacity-50"
          >
            {formPending
              ? (editingArticle ? "Saving..." : "Creating...")
              : (editingArticle ? "Save Changes" : "Create Article")}
          </button>
        </form>
      </Modal>

      {actionMessage && (
        <p className={`text-sm ${actionMessage.success ? "text-green-600" : "text-red-500"}`}>
          {actionMessage.text}
        </p>
      )}

      <DataTable
        data={articles}
        columns={typedColumns}
        enableSorting
        enableFiltering
        enablePagination
        enableGlobalFilter
        enableColumnPinning
        enableColumnResizing
        enableFacetedFilters
        initialColumnPinning={{ left: ["title", "actions"] }}
        pageSize={15}
      />
    </section>
  );
}
