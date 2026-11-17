export const dynamic = "force-dynamic";

import { getDonationRequests, getAllDonationSignups, getVolunteerDays, getAllVolunteerSignups } from "@/app/lib/db";
import WinterFoodDriveTabs from "./WinterFoodDriveTabs";

export default async function AdminWinterFoodDrivePage() {
  const requests = await getDonationRequests();
  const signups = await getAllDonationSignups();
  const volunteerDays = await getVolunteerDays();
  const volunteerSignups = await getAllVolunteerSignups();

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-foreground">Winter Food Drive</h1>
      <WinterFoodDriveTabs
        requests={requests}
        signups={signups}
        volunteerDays={volunteerDays}
        volunteerSignups={volunteerSignups}
      />
    </div>
  );
}
