"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { DonationRequest, DonationSignupWithParticipant } from "@/app/lib/definitions";
import {
  createDonationRequestAction,
  updateDonationRequestAction,
  deleteDonationRequestAction,
  updateDonationReceivedAction,
} from "@/app/actions/donations";

export default function DonationRequestsManager({ requests, signups }: { requests: DonationRequest[]; signups: DonationSignupWithParticipant[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);
  const [status, setStatus] = useState<{ message: string; success: boolean } | null>(null);

  function run(fd: FormData, action: (f: FormData) => Promise<{ success: boolean; message: string }>) {
    startTransition(async () => {
      const res = await action(fd);
      setStatus(res);
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      <section className="space-y-3">
        <h2 className="text-xl font-bold text-foreground">Add donation item</h2>
        {status && <p className={`text-sm ${status.success ? "text-green-600" : "text-red-500"}`}>{status.message}</p>}
        <form
          action={(fd) => run(fd, createDonationRequestAction)}
          className="grid grid-cols-1 sm:grid-cols-4 gap-3 border border-primary/10 rounded-lg p-4"
        >
          <input name="item_name" placeholder="Item name" required className="rounded border border-primary/10 bg-background px-2 py-1 text-sm" />
          <input name="requested_qty" type="number" min={1} placeholder="Quantity" required className="rounded border border-primary/10 bg-background px-2 py-1 text-sm" />
          <input name="unit" placeholder="Unit (items)" className="rounded border border-primary/10 bg-background px-2 py-1 text-sm" />
          <input name="notes" placeholder="Notes" className="rounded border border-primary/10 bg-background px-2 py-1 text-sm" />
          <button type="submit" disabled={pending} className="sm:col-span-4 rounded-lg bg-primary text-white px-4 py-2 text-sm font-medium disabled:opacity-50">
            Add Item
          </button>
        </form>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-bold text-foreground">Donation items</h2>
        <div className="space-y-3">
          {requests.map((r) => (
            <div key={r.id} className="border border-primary/10 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-medium text-foreground">{r.item_name}</p>
                  <p className="text-xs text-text-secondary">
                    Needed: {r.requested_qty} {r.unit} · Picked up: {r.received_qty} · Notes: {r.notes || "—"}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedItemId(r.id)}
                    className="rounded-lg border border-primary/10 px-3 py-1.5 text-xs font-medium"
                  >
                    View signups
                  </button>
                  <button
                    onClick={() => setEditingId(editingId === r.id ? null : r.id)}
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

              {/* Manual pickup input */}
              <form action={(fd) => run(fd, updateDonationReceivedAction)} className="flex items-center gap-2">
                <input type="hidden" name="id" value={r.id} />
                <label className="text-xs text-text-secondary">Manual pickup qty:</label>
                <input
                  name="received_qty"
                  type="number"
                  min={0}
                  defaultValue={r.received_qty}
                  className="w-20 rounded border border-primary/10 bg-background px-2 py-1 text-sm"
                />
                <button type="submit" disabled={pending} className="rounded-lg border border-primary/10 px-3 py-1.5 text-xs font-medium">
                  Save
                </button>
              </form>

              {editingId === r.id && (
                <form
                  action={(fd) => run(fd, updateDonationRequestAction)}
                  className="grid grid-cols-1 sm:grid-cols-4 gap-3 border-t border-primary/10 pt-3"
                >
                  <input type="hidden" name="id" value={r.id} />
                  <input type="hidden" name="received_qty" value={r.received_qty} />
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
          {requests.length === 0 && (
            <p className="text-sm text-text-secondary">No donation items yet.</p>
          )}
        </div>
      </section>

      {selectedItemId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setSelectedItemId(null)}>
          <div className="bg-card rounded-lg p-6 w-full max-w-2xl space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-foreground">
                Signups — {requests.find((r) => r.id === selectedItemId)?.item_name}
              </h3>
              <button onClick={() => setSelectedItemId(null)} className="text-text-secondary hover:text-foreground">✕</button>
            </div>
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-text-secondary border-b border-primary/10">
                  <th className="py-2 pr-4">Donor</th>
                  <th className="py-2 pr-4">Qty</th>
                  <th className="py-2 pr-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {signups.filter((s) => s.request_id === selectedItemId).map((s) => (
                  <tr key={s.id} className="border-b border-primary/5">
                    <td className="py-2 pr-4 text-foreground font-medium">{s.participant_name}</td>
                    <td className="py-2 pr-4 text-text-secondary">{s.quantity_pledged}</td>
                    <td className="py-2 pr-4 text-text-secondary">{s.status}</td>
                  </tr>
                ))}
                {signups.filter((s) => s.request_id === selectedItemId).length === 0 && (
                  <tr>
                    <td colSpan={3} className="py-4 text-center text-text-secondary">No signups for this item.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}