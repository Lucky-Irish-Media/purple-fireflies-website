"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { formatPhone, formatDateTime } from "@/app/admin/lib/utils";
import type { DonationSignupWithParticipant } from "@/app/lib/definitions";
import { updateDonationSignupAction, cancelDonationSignupAction } from "@/app/actions/donations";

export default function DonationSignupsTable({ initialData }: { initialData: DonationSignupWithParticipant[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [editingId, setEditingId] = useState<number | null>(null);

  function run(fd: FormData, action: (f: FormData) => Promise<{ success: boolean; message: string }>) {
    startTransition(async () => {
      await action(fd);
      router.refresh();
    });
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="text-left text-text-secondary border-b border-primary/10">
            <th className="py-2 pr-4">Donor</th>
            <th className="py-2 pr-4">Item</th>
            <th className="py-2 pr-4">Email</th>
            <th className="py-2 pr-4">Phone</th>
            <th className="py-2 pr-4">Qty</th>
            <th className="py-2 pr-4">Status</th>
            <th className="py-2 pr-4">Created</th>
            <th className="py-2 pr-4">Actions</th>
          </tr>
        </thead>
        <tbody>
          {initialData.map((s) => (
            <tr key={s.id} className="border-b border-primary/5">
              <td className="py-2 pr-4 text-foreground font-medium">{s.participant_name}</td>
              <td className="py-2 pr-4 text-text-secondary">{s.item_name} ({s.unit})</td>
              <td className="py-2 pr-4 text-text-secondary">{s.participant_email}</td>
              <td className="py-2 pr-4 text-text-secondary">{formatPhone(s.participant_phone)}</td>
              <td className="py-2 pr-4 text-text-secondary">
                {editingId === s.id ? (
                  <form action={(fd) => run(fd, updateDonationSignupAction)} className="flex gap-2">
                    <input type="hidden" name="id" value={s.id} />
                    <input name="quantity_pledged" type="number" min={1} defaultValue={s.quantity_pledged} className="w-16 rounded border border-primary/10 bg-background px-1 py-0.5 text-sm" />
                    <button type="submit" disabled={pending} className="text-xs text-primary">Save</button>
                  </form>
                ) : (
                  s.quantity_pledged
                )}
              </td>
              <td className="py-2 pr-4 text-text-secondary">{s.status}</td>
              <td className="py-2 pr-4 text-text-secondary">{formatDateTime(s.created_at)}</td>
              <td className="py-2 pr-4">
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditingId(editingId === s.id ? null : s.id)}
                    className="rounded-lg border border-primary/10 px-3 py-1.5 text-xs font-medium"
                  >
                    Edit
                  </button>
                  {s.status === "active" && (
                    <form action={(fd) => run(fd, cancelDonationSignupAction)}>
                      <input type="hidden" name="id" value={s.id} />
                      <button type="submit" disabled={pending} className="rounded-lg border border-red-200 text-red-600 px-3 py-1.5 text-xs font-medium">
                        Cancel
                      </button>
                    </form>
                  )}
                </div>
              </td>
            </tr>
          ))}
          {initialData.length === 0 && (
            <tr>
              <td colSpan={8} className="py-4 text-center text-text-secondary">No signups yet.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}