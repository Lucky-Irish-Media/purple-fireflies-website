"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { DonationWeek, DonationRequest } from "@/app/lib/definitions";
import {
  createDonationWeekAction,
  updateDonationWeekAction,
  toggleDonationWeekStatusAction,
  deleteDonationWeekAction,
  createDonationRequestAction,
  updateDonationRequestAction,
  deleteDonationRequestAction,
} from "@/app/actions/donations";

export default function DonationRequestsManager({
  weeks,
  weekRequests,
}: {
  weeks: DonationWeek[];
  weekRequests: Record<number, DonationRequest[]>;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [selectedWeekId, setSelectedWeekId] = useState<number | null>(weeks[0]?.id ?? null);
  const [editingWeekId, setEditingWeekId] = useState<number | null>(null);
  const [editingReqId, setEditingReqId] = useState<number | null>(null);

  function run(fd: FormData, action: (f: FormData) => Promise<{ success: boolean; message: string }>) {
    startTransition(async () => {
      await action(fd);
      router.refresh();
    });
  }

  const selectedRequests = selectedWeekId ? weekRequests[selectedWeekId] || [] : [];

  return (
    <div className="space-y-6">
      {/* Create week */}
      <section className="space-y-3">
        <h2 className="text-xl font-bold text-foreground">Create donation week</h2>
        <form
          action={(fd) => run(fd, createDonationWeekAction)}
          className="grid grid-cols-1 sm:grid-cols-2 gap-3 border border-primary/10 rounded-lg p-4"
        >
          <input name="week_start_date" type="date" required className="rounded border border-primary/10 bg-background px-2 py-1 text-sm" />
          <input name="title" placeholder="Title (optional)" className="rounded border border-primary/10 bg-background px-2 py-1 text-sm" />
          <textarea name="notes" placeholder="Notes" className="sm:col-span-2 rounded border border-primary/10 bg-background px-2 py-1 text-sm" rows={2} />
          <button type="submit" disabled={pending} className="sm:col-span-2 rounded-lg bg-primary text-white px-4 py-2 text-sm font-medium disabled:opacity-50">
            Create Week
          </button>
        </form>
      </section>

      {/* Weeks list */}
      <section className="space-y-3">
        <h2 className="text-xl font-bold text-foreground">Weeks</h2>
        <div className="space-y-3">
          {weeks.map((w) => (
            <div key={w.id} className="border border-primary/10 rounded-lg p-4 space-y-2">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-medium text-foreground">{w.title || w.week_start_date}</p>
                  <p className="text-xs text-text-secondary">
                    {w.week_start_date} · {w.status}
                  </p>
                  {w.notes && <p className="text-xs text-text-secondary">{w.notes}</p>}
                </div>
                <div className="flex gap-2">
                  <form action={(fd) => run(fd, toggleDonationWeekStatusAction)}>
                    <input type="hidden" name="id" value={w.id} />
                    <input type="hidden" name="status" value={w.status === "open" ? "closed" : "open"} />
                    <button type="submit" disabled={pending} className="rounded-lg border border-primary/10 px-3 py-1.5 text-xs font-medium">
                      {w.status === "open" ? "Close" : "Reopen"}
                    </button>
                  </form>
                  <button
                    onClick={() => setEditingWeekId(editingWeekId === w.id ? null : w.id)}
                    className="rounded-lg border border-primary/10 px-3 py-1.5 text-xs font-medium"
                  >
                    Edit
                  </button>
                  <form action={(fd) => run(fd, deleteDonationWeekAction)}>
                    <input type="hidden" name="id" value={w.id} />
                    <button type="submit" disabled={pending} className="rounded-lg border border-red-200 text-red-600 px-3 py-1.5 text-xs font-medium">
                      Delete
                    </button>
                  </form>
                </div>
              </div>

              {editingWeekId === w.id && (
                <form
                  action={(fd) => run(fd, updateDonationWeekAction)}
                  className="grid grid-cols-1 sm:grid-cols-2 gap-3 border-t border-primary/10 pt-3"
                >
                  <input type="hidden" name="id" value={w.id} />
                  <input name="week_start_date" type="date" defaultValue={w.week_start_date} required className="rounded border border-primary/10 bg-background px-2 py-1 text-sm" />
                  <input name="title" defaultValue={w.title || ""} placeholder="Title" className="rounded border border-primary/10 bg-background px-2 py-1 text-sm" />
                  <select name="status" defaultValue={w.status} className="rounded border border-primary/10 bg-background px-2 py-1 text-sm">
                    <option value="open">open</option>
                    <option value="closed">closed</option>
                  </select>
                  <textarea name="notes" defaultValue={w.notes || ""} placeholder="Notes" className="sm:col-span-2 rounded border border-primary/10 bg-background px-2 py-1 text-sm" rows={2} />
                  <button type="submit" disabled={pending} className="sm:col-span-2 rounded-lg bg-primary text-white px-4 py-2 text-sm font-medium disabled:opacity-50">
                    Save
                  </button>
                </form>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Requests for selected week */}
      <section className="space-y-3">
        <h2 className="text-xl font-bold text-foreground">Requested items</h2>
        <div className="flex items-center gap-3">
          <label className="text-sm text-foreground">Week:</label>
          <select
            value={selectedWeekId ?? ""}
            onChange={(e) => setSelectedWeekId(Number(e.target.value))}
            className="rounded border border-primary/10 bg-background px-2 py-1 text-sm"
          >
            {weeks.map((w) => (
              <option key={w.id} value={w.id}>
                {w.title || w.week_start_date}
              </option>
            ))}
          </select>
        </div>

        {selectedWeekId && (
          <>
            <form
              action={(fd) => run(fd, createDonationRequestAction)}
              className="grid grid-cols-1 sm:grid-cols-4 gap-3 border border-primary/10 rounded-lg p-4"
            >
              <input type="hidden" name="week_id" value={selectedWeekId} />
              <input name="item_name" placeholder="Item name" required className="rounded border border-primary/10 bg-background px-2 py-1 text-sm" />
              <input name="requested_qty" type="number" min={1} placeholder="Qty" required className="rounded border border-primary/10 bg-background px-2 py-1 text-sm" />
              <input name="unit" placeholder="Unit (items)" className="rounded border border-primary/10 bg-background px-2 py-1 text-sm" />
              <input name="notes" placeholder="Notes" className="rounded border border-primary/10 bg-background px-2 py-1 text-sm" />
              <button type="submit" disabled={pending} className="sm:col-span-4 rounded-lg bg-primary text-white px-4 py-2 text-sm font-medium disabled:opacity-50">
                Add Request
              </button>
            </form>

            <div className="space-y-2">
              {selectedRequests.map((r) => (
                <div key={r.id} className="border border-primary/10 rounded-lg p-3 space-y-2">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-medium text-foreground">{r.item_name}</p>
                      <p className="text-xs text-text-secondary">
                        {r.requested_qty} {r.unit} {r.notes ? `· ${r.notes}` : ""}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditingReqId(editingReqId === r.id ? null : r.id)}
                        className="rounded-lg border border-primary/10 px-3 py-1.5 text-xs font-medium"
                      >
                        Edit
                      </button>
                      <form action={(fd) => run(fd, deleteDonationRequestAction)}>
                        <input type="hidden" name="id" value={r.id} />
                        <button type="submit" disabled={pending} className="rounded-lg border border-red-200 text-red-600 px-3 py-1.5 text-xs font-medium">
                          Delete
                        </button>
                      </form>
                    </div>
                  </div>
                  {editingReqId === r.id && (
                    <form
                      action={(fd) => run(fd, updateDonationRequestAction)}
                      className="grid grid-cols-1 sm:grid-cols-4 gap-3 border-t border-primary/10 pt-3"
                    >
                      <input type="hidden" name="id" value={r.id} />
                      <input name="item_name" defaultValue={r.item_name} required className="rounded border border-primary/10 bg-background px-2 py-1 text-sm" />
                      <input name="requested_qty" type="number" min={1} defaultValue={r.requested_qty} required className="rounded border border-primary/10 bg-background px-2 py-1 text-sm" />
                      <input name="unit" defaultValue={r.unit} className="rounded border border-primary/10 bg-background px-2 py-1 text-sm" />
                      <input name="notes" defaultValue={r.notes || ""} className="rounded border border-primary/10 bg-background px-2 py-1 text-sm" />
                      <button type="submit" disabled={pending} className="sm:col-span-4 rounded-lg bg-primary text-white px-4 py-2 text-sm font-medium disabled:opacity-50">
                        Save
                      </button>
                    </form>
                  )}
                </div>
              ))}
              {selectedRequests.length === 0 && (
                <p className="text-sm text-text-secondary">No requests for this week.</p>
              )}
            </div>
          </>
        )}
      </section>
    </div>
  );
}