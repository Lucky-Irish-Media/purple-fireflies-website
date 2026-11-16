export const dynamic = "force-dynamic";

import Link from "next/link";

export default async function WinterFoodDrivePage() {
  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Winter Food Drive</h1>
      <p className="text-text-secondary">
        Partnering with Love Light Movement. Help us stock the pantry for the season.
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