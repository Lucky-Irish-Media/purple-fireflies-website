export const dynamic = "force-dynamic";

import Link from "next/link";

export default async function WinterFoodDrivePage() {
  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Winter Food Drive</h1>
      <p className="text-text-secondary">
        Love Light Movement and Purple Fireflies are teaming up this winter so we can all help make sure our neighbors have enough to eat.
      </p>
      <p className="text-center text-text-secondary">──── ♡ ────</p>
      <p className="text-text-secondary">
        When Athens restaurants and establishments slow down in winter, less surplus food is available to rescue and share with our community. Together, we can help fill the gap.
      </p>
      <p className="text-text-secondary">
        Drop-off: Wednesdays, 1:00 PM to 3:00 PM at AceNet. Dropbox locations: Kindred and Seamans.
      </p>
      <Link
        href="/programs/winter-food-drive/donate"
        className="inline-block rounded-lg bg-primary text-white px-4 py-2 text-sm font-medium"
      >
        View donation list &amp; pledge
      </Link>
    </div>
  );
}