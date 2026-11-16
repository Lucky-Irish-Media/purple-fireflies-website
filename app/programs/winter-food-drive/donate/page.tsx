export const dynamic = "force-dynamic";

import { getDonationRequests } from "@/app/lib/db";
import { getPledgedTotalByRequest } from "@/app/lib/db";
import type { DonationRequestWithTotals } from "@/app/lib/definitions";
import DonationPledgeForm from "@/components/DonationPledgeForm";

export default async function DonatePage() {
  const requests = await getDonationRequests();

  const withTotals: DonationRequestWithTotals[] = await Promise.all(
    requests.map(async (r) => {
      const pledged = await getPledgedTotalByRequest(r.id);
      const remaining = r.requested_qty - pledged - (r.received_qty ?? 0);
      return { ...r, pledged_qty: pledged, remaining };
    })
  );

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Winter Food Drive — Donate</h1>
      <p className="text-text-secondary">
        Help us collect the items needed for the Winter Food Drive. Drop-off details will be provided on this page.
      </p>

      <div className="space-y-3">
        <h2 className="text-xl font-bold text-foreground">Requested items</h2>
        <ul className="space-y-2">
          {withTotals.map((r) => (
            <li key={r.id} className="border border-primary/10 rounded-lg p-3">
              <span className="font-medium text-foreground">{r.item_name}</span>
              <span className="text-text-secondary text-sm ml-2">
                Needed {r.requested_qty} {r.unit} · Pledged {r.pledged_qty} · Picked up {r.received_qty} · Remaining {r.remaining}
              </span>
              {r.notes && <p className="text-xs text-text-secondary">{r.notes}</p>}
            </li>
          ))}
        </ul>
      </div>

      <DonationPledgeForm requests={withTotals} />
    </div>
  );
}