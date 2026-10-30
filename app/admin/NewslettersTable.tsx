"use client";

import { useState, useActionState, useMemo, useRef, useEffect } from "react";
import type { Newsletter } from "@/app/lib/definitions";
import {
  createNewsletterAction,
  updateNewsletterAction,
  deleteNewsletterAction,
  sendNewsletterAction,
  sendTestNewsletterAction,
  uploadNewsletterImageAction,
  type NewsletterActionState,
} from "@/app/actions/newsletter";
import { DataTable } from "./components/DataTable";
import { Modal } from "./components/Modal";
import { formatDate } from "./lib/utils";
import { createColumnHelper, type ColumnDef } from "@tanstack/react-table";

const columnHelper = createColumnHelper<Newsletter>();

export default function NewslettersTable({
  initialNewsletters,
  canSend,
  canEdit,
}: {
  initialNewsletters: Newsletter[];
  canSend: boolean;
  canEdit: boolean;
}) {
  const [newsletters, setNewsletters] = useState(initialNewsletters);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Newsletter | null>(null);
  const [actionMessage, setActionMessage] = useState<{ text: string; success: boolean } | null>(null);
  const [sendPending, setSendPending] = useState(false);
  const testEmailRefs = useRef<Record<number, HTMLInputElement | null>>({});
  const [uploading, setUploading] = useState(false);
  const [bodyValue, setBodyValue] = useState("");
  useEffect(() => {
    const html = editing?.body || "";
    if (contentRef.current) {
      contentRef.current.innerHTML = html;
    }
    setBodyValue(html);
    if (hiddenBodyRef.current) hiddenBodyRef.current.value = html;
  }, [editing, modalOpen]);
  const contentRef = useRef<HTMLDivElement>(null);
  const hiddenBodyRef = useRef<HTMLInputElement>(null);

  function syncBody() {
    const html = contentRef.current?.innerHTML || "";
    setBodyValue(html);
    if (hiddenBodyRef.current) hiddenBodyRef.current.value = html;
  }

  function execCommand(command: string, value?: string) {
    document.execCommand(command, false, value);
    syncBody();
  }



  const [createState, createAction, createPending] = useActionState<NewsletterActionState, FormData>(
    async (prev, formData) => {
      const result = await createNewsletterAction(prev, formData);
      if (result?.newsletters) {
        setNewsletters(result.newsletters);
        setModalOpen(false);
        setActionMessage({ text: result.message || "", success: true });
      }
      return result;
    },
    undefined,
  );

  const [updateState, updateAction, updatePending] = useActionState<NewsletterActionState, FormData>(
    async (prev, formData) => {
      const result = await updateNewsletterAction(prev, formData);
      if (result?.newsletters) {
        setNewsletters(result.newsletters);
        setModalOpen(false);
        setActionMessage({ text: result.message || "", success: true });
      }
      return result;
    },
    undefined,
  );

  const [, deleteAction, deletePending] = useActionState<NewsletterActionState, FormData>(
    async (prev, formData) => {
      const result = await deleteNewsletterAction(prev, formData);
      if (result?.newsletters) {
        setNewsletters(result.newsletters);
        setActionMessage({ text: result.message || "", success: true });
      } else if (result?.message) {
        setActionMessage({ text: result.message, success: false });
      }
      return result;
    },
    undefined,
  );

  const formState = editing ? updateState : createState;
  const formPending = editing ? updatePending : createPending;
  const formAction = editing ? updateAction : createAction;

  async function handleSend(id: number) {
    if (!confirm("Send this newsletter to the selected segment?")) return;
    setSendPending(true);
    const tagsInput = prompt("Enter comma-separated tags to target (leave blank for all confirmed subscribers):", "") || "";
    const tags = tagsInput.split(",").map((t) => t.trim()).filter(Boolean);
    const result = await sendNewsletterAction(id, tags);
    setActionMessage({ text: result.message, success: result.success });
    setSendPending(false);
    // refresh list
    // re-fetch not available; rely on revalidate? client state stale; reload page
    window.location.reload();
  }

  async function handleTest(id: number, email: string) {
    const result = await sendTestNewsletterAction(id, email);
    setActionMessage({ text: result.message, success: result.success });
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    const result = await uploadNewsletterImageAction(fd);
    if (result.success && result.url) {
      const el = contentRef.current;
      if (el) {
        el.focus();
        document.execCommand("insertImage", false, result.url);
        syncBody();
      }
      setActionMessage({ text: "Image uploaded. Tag appended to body.", success: true });
    } else {
      setActionMessage({ text: result.message || "Upload failed.", success: false });
    }
    setUploading(false);
    e.target.value = "";
  }

  const columns = useMemo(() => [
    columnHelper.accessor((row) => row.title, {
      id: "title",
      header: "Title",
      cell: (info) => <span className="text-foreground font-medium">{info.getValue()}</span>,
    }),
    columnHelper.accessor((row) => row.slug, {
      id: "slug",
      header: "Slug",
      cell: (info) => <span className="text-text-secondary">{info.getValue()}</span>,
    }),
    columnHelper.accessor((row) => row.status, {
      id: "status",
      header: "Status",
      cell: (info) => <span className="text-text-secondary capitalize">{info.getValue()}</span>,
    }),
    columnHelper.accessor((row) => row.published_at, {
      id: "published_at",
      header: "Published",
      cell: (info) => <span className="text-text-secondary">{info.getValue() ? formatDate(info.getValue()!) : "—"}</span>,
    }),
    columnHelper.accessor((row) => row.recipient_count, {
      id: "recipient_count",
      header: "Recipients",
      cell: (info) => <span className="text-text-secondary">{info.getValue()}</span>,
    }),
    columnHelper.display({
      id: "actions",
      header: "Actions",
      cell: (info) => {
        const nl = info.row.original;
        return (
          <div className="flex items-center gap-2 flex-wrap">
            {canEdit && (
              <button
                onClick={() => {
                  setEditing(nl);
                  setModalOpen(true);
                }}
                className="rounded-lg border border-primary/10 px-3 py-1.5 text-xs font-medium text-foreground hover:bg-primary/5 transition-colors"
              >
                Edit
              </button>
            )}
            {canSend && nl.status !== "sent" && (
              <button
                onClick={() => handleSend(nl.id)}
                disabled={sendPending}
                className="rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-white hover:bg-primary-dark transition-colors disabled:opacity-50"
              >
                Send
              </button>
            )}
            {null}
            {canEdit && (
              <form
                action={deleteAction}
                className="inline"
                onSubmit={(e) => {
                  if (!confirm(`Delete newsletter "${nl.title}"?`)) e.preventDefault();
                }}
              >
                <input type="hidden" name="id" value={nl.id} />
                <button
                  type="submit"
                  disabled={deletePending}
                  className="rounded-lg bg-red-100 px-3 py-1.5 text-xs font-medium text-red-800 transition-all hover:bg-red-200 disabled:opacity-50"
                >
                  Delete
                </button>
              </form>
            )}
          </div>
        );
      },
    }),
  ] as const, [deletePending, deleteAction, canEdit, canSend, sendPending]);

  const typedColumns = columns as unknown as ColumnDef<Newsletter, unknown>[];

  function handleCreate() {
    setEditing(null);
    setModalOpen(true);
  }

  function handleModalClose() {
    setModalOpen(false);
    setEditing(null);
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <h2 className="text-xl font-bold text-foreground">Newsletters</h2>
        {canEdit && (
          <button
            onClick={handleCreate}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-primary-dark"
          >
            New Newsletter
          </button>
        )}
      </div>

      <p className="text-text-secondary">Total: {newsletters.length}</p>

      <Modal open={modalOpen} onClose={handleModalClose} title={editing ? "Edit Newsletter" : "New Newsletter"}>
        <form action={formAction} className="space-y-4" onSubmit={() => syncBody()}>
          {editing && <input type="hidden" name="id" value={editing.id} />}
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Title</label>
              <input
                name="title"
                type="text"
                required
                defaultValue={editing?.title || ""}
                className="w-full rounded-lg border border-primary/10 bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
              {formState?.errors?.title && <p className="mt-1 text-sm text-red-500">{formState.errors.title[0]}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Slug</label>
              <input
                name="slug"
                type="text"
                defaultValue={editing?.slug || ""}
                placeholder="auto-generated from title"
                className="w-full rounded-lg border border-primary/10 bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
              {formState?.errors?.slug && <p className="mt-1 text-sm text-red-500">{formState.errors.slug[0]}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Excerpt</label>
              <textarea
                name="excerpt"
                rows={2}
                defaultValue={editing?.excerpt || ""}
                className="w-full rounded-lg border border-primary/10 bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Body (rich text)</label>
              <div className="flex flex-wrap gap-1 mb-2">
                <button type="button" onClick={() => execCommand("formatBlock", "h2")} className="rounded border border-primary/10 px-2 py-1 text-xs font-medium text-foreground hover:bg-primary/5">H2</button>
                <button type="button" onClick={() => execCommand("formatBlock", "h3")} className="rounded border border-primary/10 px-2 py-1 text-xs font-medium text-foreground hover:bg-primary/5">H3</button>
                <button type="button" onClick={() => execCommand("bold")} className="rounded border border-primary/10 px-2 py-1 text-xs font-medium text-foreground hover:bg-primary/5">Bold</button>
                <button type="button" onClick={() => execCommand("italic")} className="rounded border border-primary/10 px-2 py-1 text-xs font-medium text-foreground hover:bg-primary/5">Italic</button>
                <button type="button" onClick={() => {
                  const url = prompt("Link URL:");
                  if (url) execCommand("createLink", url);
                }} className="rounded border border-primary/10 px-2 py-1 text-xs font-medium text-foreground hover:bg-primary/5">Link</button>
                <button type="button" onClick={() => execCommand("insertUnorderedList")} className="rounded border border-primary/10 px-2 py-1 text-xs font-medium text-foreground hover:bg-primary/5">Bullet List</button>
                <button type="button" onClick={() => execCommand("insertOrderedList")} className="rounded border border-primary/10 px-2 py-1 text-xs font-medium text-foreground hover:bg-primary/5">Numbered List</button>
              </div>
              <div
                ref={contentRef}
                contentEditable
                onInput={syncBody}
                className="w-full min-h-[240px] rounded-lg border border-primary/10 bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                style={{ whiteSpace: "pre-wrap" }}
              />
              <input type="hidden" name="body" ref={hiddenBodyRef} defaultValue={editing?.body || ""} />
              <div className="mt-2 flex items-center gap-2">
                <label className="text-xs text-text-secondary">
                  Upload image:
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploading}
                    className="ml-2 text-xs"
                  />
                </label>
                {uploading && <span className="text-xs text-text-secondary">Uploading...</span>}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Preview</label>
              <div
                className="rounded-lg border border-primary/10 bg-background p-4 max-h-64 overflow-auto text-sm text-foreground"
                dangerouslySetInnerHTML={{ __html: bodyValue || "<p style='color:#9ca3af'>Nothing to preview yet.</p>" }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Status</label>
              <select
                name="status"
                defaultValue={editing?.status || "draft"}
                className="w-full rounded-lg border border-primary/10 bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>
          </div>

          {formState?.message && !formState.success && (
            <p className="text-sm text-red-500">{formState.message}</p>
          )}

          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              {editing && canEdit && (
                <>
                  <input
                    type="email"
                    placeholder="test email"
                    ref={(el) => {
                      if (el) testEmailRefs.current[editing.id] = el;
                    }}
                    className="rounded border border-primary/10 px-2 py-1 text-xs w-40"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const email = testEmailRefs.current[editing.id]?.value?.trim() || "";
                      if (!email) return;
                      handleTest(editing.id, email);
                    }}
                    className="rounded-lg border border-primary/10 px-3 py-1.5 text-xs font-medium text-foreground hover:bg-primary/5 transition-colors"
                  >
                    Test
                  </button>
                </>
              )}
            </div>
            <button
              type="submit"
              disabled={formPending}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-primary-dark disabled:opacity-50"
            >
              {formPending ? "Saving..." : editing ? "Save Changes" : "Create Newsletter"}
            </button>
          </div>
        </form>
      </Modal>

      {actionMessage && (
        <p className={`text-sm ${actionMessage.success ? "text-green-600" : "text-red-500"}`}>
          {actionMessage.text}
        </p>
      )}

      <DataTable
        data={newsletters}
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