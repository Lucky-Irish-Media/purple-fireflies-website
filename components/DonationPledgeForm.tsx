"use client";

import { useActionState, useState } from "react";
import { submitDonationPledge } from "@/app/actions/donations";
import type { DonationPledgeFormState } from "@/app/actions/donations";
import type { DonationRequestWithTotals } from "@/app/lib/definitions";
import { LookupModal } from "@/components/LookupModal";

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
  const [showLookup, setShowLookup] = useState(false);

  function setQty(id: number, value: string) {
    const n = parseInt(value || "0", 10);
    setQuantities((prev) => ({ ...prev, [id]: isNaN(n) ? 0 : n }));
  }

  if (state?.success) {
    return <div className="rounded-lg bg-green-50 p-4 text-green-600" role="status">Thank you! Your pledge has been submitted. Check your email for confirmation.</div>;
  }

  const lines = requests.filter((r) => (quantities[r.id] || 0) > 0);

  return (
    <div className="max-w-2xl mx-auto">
      <p className="mb-8">
        <button type="button" onClick={() => setShowLookup(true)} className="text-sm font-medium text-primary hover:underline">
          Look up my existing signups →
        </button>
      </p>

      <form action={action} className="space-y-6" noValidate>
        {state?.message && !state?.success && (
          <div className="rounded-lg bg-red-50 p-4 text-red-600" role="alert">{state.message}</div>
        )}

        <div className="space-y-2">
          <label htmlFor="name" className="block text-sm font-medium text-foreground">
            Full Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="name"
            name="name"
            required
            className={`w-full rounded-lg border bg-background px-4 py-3 text-foreground placeholder:text-text-secondary ${
              state?.errors?.name ? "border-red-500 focus:border-red-500 focus:ring-red-500" : "border-input focus:border-primary focus:ring-primary"
            }`}
            aria-invalid={state?.errors?.name ? "true" : "false"}
            aria-describedby="name-error"
          />
          {state?.errors?.name && (
            <p id="name-error" className="text-sm text-red-500" role="alert">{state.errors.name[0]}</p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="email" className="block text-sm font-medium text-foreground">
            Email Address <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            id="email"
            name="email"
            required
            className={`w-full rounded-lg border bg-background px-4 py-3 text-foreground placeholder:text-text-secondary ${
              state?.errors?.email ? "border-red-500 focus:border-red-500 focus:ring-red-500" : "border-input focus:border-primary focus:ring-primary"
            }`}
            aria-invalid={state?.errors?.email ? "true" : "false"}
            aria-describedby="email-error"
          />
          {state?.errors?.email && (
            <p id="email-error" className="text-sm text-red-500" role="alert">{state.errors.email[0]}</p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="phone" className="block text-sm font-medium text-foreground">
            Phone Number <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            required
            placeholder="(555) 123-4567"
            className={`w-full rounded-lg border bg-background px-4 py-3 text-foreground placeholder:text-text-secondary ${
              state?.errors?.phone ? "border-red-500 focus:border-red-500 focus:ring-red-500" : "border-input focus:border-primary focus:ring-primary"
            }`}
            aria-invalid={state?.errors?.phone ? "true" : "false"}
            aria-describedby="phone-error"
          />
          {state?.errors?.phone && (
            <p id="phone-error" className="text-sm text-red-500" role="alert">{state.errors.phone[0]}</p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="contactMethod" className="block text-sm font-medium text-foreground">
            What is the best way to contact you? <span className="text-red-500">*</span>
          </label>
          <select
            id="contactMethod"
            name="contactMethod"
            required
            defaultValue="email"
            className={`w-full rounded-lg border bg-background px-4 py-3 text-foreground ${
              state?.errors?.contactMethod ? "border-red-500 focus:border-red-500 focus:ring-red-500" : "border-input focus:border-primary focus:ring-primary"
            }`}
          >
            <option value="email">Email</option>
            <option value="call">Call</option>
            <option value="text">Text</option>
          </select>
        </div>

        <div className="space-y-2">
          <label htmlFor="notes" className="block text-sm font-medium text-foreground">
            Notes (optional)
          </label>
          <textarea
            id="notes"
            name="notes"
            rows={2}
            className="w-full rounded-lg border border-input bg-background px-4 py-3 text-foreground placeholder:text-text-secondary focus:border-primary focus:ring-primary"
          />
        </div>

        <div className="space-y-3">
          <h3 className="font-semibold text-foreground">Pledge items</h3>
          {requests.map((r) => (
            <div key={r.id} className="flex items-center gap-3 border border-primary/10 rounded-lg p-3">
              <div className="flex-1">
                <p className="font-medium text-foreground">{r.item_name}</p>
                <p className="text-xs text-text-secondary">
                  Needed {r.requested_qty} {r.unit} · Pledged {r.pledged_qty} · Picked up {r.received_qty} · Remaining {r.remaining}
                </p>
                {r.notes && <p className="text-xs text-text-secondary">{r.notes}</p>}
              </div>
              <input
                type="number"
                min={0}
                max={r.remaining >= 0 ? r.remaining : undefined}
                value={quantities[r.id] || 0}
                onChange={(e) => setQty(r.id, e.target.value)}
                aria-describedby={`quantity-${r.id}-error`}
                className="w-20 rounded-lg border border-input bg-background px-2 py-1 text-sm"
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
          className="w-full rounded-lg bg-primary px-6 py-3 text-lg font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          {pending ? "Submitting..." : "Submit Pledge"}
        </button>
      </form>

      {showLookup && <LookupModal type="donation" onClose={() => setShowLookup(false)} />}
    </div>
  );
}