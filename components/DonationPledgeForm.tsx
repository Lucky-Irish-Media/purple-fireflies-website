"use client";

import { useActionState, useState } from "react";
import { submitDonationPledge } from "@/app/actions/donations";
import type { DonationPledgeFormState } from "@/app/actions/donations";
import type { DonationRequestWithTotals } from "@/app/lib/definitions";

export default function DonationPledgeForm({
  requests,
}: {
  requests: DonationRequestWithTotals[];
}) {
  const [state, action, pending] = useActionState(
    submitDonationPledge,
    undefined as DonationPledgeFormState
  );

  const [quantities, setQuantities] = useState<Record<number, number>>({});

  function setQty(id: number, value: string) {
    const n = parseInt(value || "0", 10);
    setQuantities((prev) => ({ ...prev, [id]: isNaN(n) ? 0 : n }));
  }

  if (state?.success) {
    return <p className="text-green-600 font-medium">Thank you! Your pledge has been submitted. Check your email for confirmation.</p>;
  }

  const lines = requests.filter((r) => (quantities[r.id] || 0) > 0);

  return (
    <form action={action} className="space-y-4">
      {state?.message && !state?.success && (
        <p className="text-sm text-red-500">{state.message}</p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Name</label>
          <input name="name" type="text" required className="w-full rounded-lg border border-primary/10 bg-background px-3 py-2 text-sm" />
          {state?.errors?.name && <p className="mt-1 text-sm text-red-500">{state.errors.name[0]}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Email</label>
          <input name="email" type="email" required className="w-full rounded-lg border border-primary/10 bg-background px-3 py-2 text-sm" />
          {state?.errors?.email && <p className="mt-1 text-sm text-red-500">{state.errors.email[0]}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Phone</label>
          <input name="phone" type="tel" required className="w-full rounded-lg border border-primary/10 bg-background px-3 py-2 text-sm" />
          {state?.errors?.phone && <p className="mt-1 text-sm text-red-500">{state.errors.phone[0]}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Contact Method</label>
          <select name="contactMethod" defaultValue="email" className="w-full rounded-lg border border-primary/10 bg-background px-3 py-2 text-sm">
            <option value="email">Email</option>
            <option value="call">Call</option>
            <option value="text">Text</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-1">Notes (optional)</label>
        <textarea name="notes" rows={2} className="w-full rounded-lg border border-primary/10 bg-background px-3 py-2 text-sm" />
      </div>

      <div className="space-y-2">
        <h3 className="font-semibold text-foreground">Pledge items</h3>
        {requests.map((r) => (
          <div key={r.id} className="flex items-center gap-3 border border-primary/10 rounded-lg p-3">
            <div className="flex-1">
              <p className="font-medium text-foreground">{r.item_name}</p>
              <p className="text-xs text-text-secondary">
                Requested: {r.requested_qty} {r.unit} · Pledged: {r.pledged_qty} · Remaining: {r.remaining}
              </p>
            </div>
            <input
              type="number"
              min={0}
              max={r.remaining >= 0 ? r.remaining : undefined}
              value={quantities[r.id] || 0}
              onChange={(e) => setQty(r.id, e.target.value)}
              className="w-20 rounded-lg border border-primary/10 bg-background px-2 py-1 text-sm"
            />
          </div>
        ))}
      </div>

      {lines.map((l) => (
        <span key={l.id}>
          <input type="hidden" name="request_id" value={l.id} />
          <input type="hidden" name="quantity" value={quantities[l.id]} />
        </span>
      ))}

      <button
        type="submit"
        disabled={pending || lines.length === 0}
        className="rounded-lg bg-primary text-white px-4 py-2 text-sm font-medium disabled:opacity-50"
      >
        {pending ? "Submitting..." : "Submit Pledge"}
      </button>
    </form>
  );
}