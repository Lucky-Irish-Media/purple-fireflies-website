export const dynamic = "force-dynamic";

import {
  getDonationWeeks,
  getDonationRequests,
  getAllDonationSignups,
} from "@/app/lib/db";
import WinterFoodDriveTabs from "./WinterFoodDriveTabs";

export default async function AdminWinterFoodDrivePage() {
  const weeks = await getDonationWeeks();
  const weekRequests: Record<number, Awaited<ReturnType<typeof getDonationRequests>>> = {};
  for (const w of weeks) {
    weekRequests[w.id] = await getDonationRequests(w.id);
  }
  const signups = await getAllDonationSignups();

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-foreground">Winter Food Drive</h1>
      <WinterFoodDriveTabs weeks={weeks} weekRequests={weekRequests} signups={signups} />
    </div>
  );
}