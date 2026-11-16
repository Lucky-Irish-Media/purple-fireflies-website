export const dynamic = "force-dynamic";

import { getDonationWeeks, getDonationRequests, getPledgedTotalsByWeek } from "@/app/lib/db";
import type { DonationRequestWithTotals } from "@/app/lib/definitions";
import DonationPledgeForm from "@/components/DonationPledgeForm";

export default async function DonatePage() {
  const weeks = await getDonationWeeks();
  const current = weeks.find((w) => w.status === "open") || weeks[0];

  if (!current) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <h1 className="text-2xl font-bold text-foreground">Winter Food Drive — Donate</h1>
        <p className="text-text-secondary mt-4">No donation week is currently published.</p>
      </div>
    );
  }

  const requests = await getDonationRequests(current.id);
  const totals = await getPledgedTotalsByWeek(current.id);
  const withTotals: DonationRequestWithTotals[] = requests.map((r) => {
    const pledged = totals[r.id] ?? 0;
    return { ...r, pledged_qty: pledged, remaining: r.requested_qty - pledged };
  });

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Winter Food Drive — Donate</h1>
      {current.title && <p className="text-lg text-foreground">{current.title}</p>}
      {current.notes && <p className="text-text-secondary">{current.notes}</p>}
      <div className="text-sm text-text-secondary">
        <p>Drop-off details will be provided on this page.</p>
      </div>

      <div className="space-y-3">
        <h2 className="text-xl font-bold text-foreground">Requested items</h2>
        <ul className="space-y-2">
          {withTotals.map((r) => (
            <li key={r.id} className="border border-primary/10 rounded-lg p-3">
              <span className="font-medium text-foreground">{r.item_name}</span>
              <span className="text-text-secondary text-sm ml-2">
                Requested {r.requested_qty} {r.unit} · Pledged {r.pledged_qty} · Remaining {r.remaining}
              </span>
              {r.notes && <p className="text-xs text-text-secondary">{r.notes}</p>}
            </li>
          ))}
        </ul>
      </div>

      {current.status === "open" ? (
        <DonationPledgeForm requests={withTotals} />
      ) : (
        <p className="text-amber-600">This week is closed for new pledges.</p>
      )}
    </div>
  );
}