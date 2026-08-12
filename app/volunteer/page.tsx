import { verifySession } from "@/app/lib/dal";
import { getParticipantByEmail, getVolunteerDashboard } from "@/app/lib/db";
import { VolunteerTabs } from "@/app/volunteer/VolunteerTabs";

export const dynamic = "force-dynamic";

export default async function VolunteerPage() {
  const session = await verifySession();
  const [dashboard, participant] = await Promise.all([
    getVolunteerDashboard(session.email),
    getParticipantByEmail(session.email),
  ]);

  const firstSignup = dashboard.signups[0];
  const initialRegions = firstSignup
    ? firstSignup.regions.split(", ").filter(Boolean)
    : [];
  const initialOnSignal = firstSignup?.on_signal || "no";

  return (
    <VolunteerTabs
      signups={dashboard.signups}
      participant={participant}
      initialRegions={initialRegions}
      initialOnSignal={initialOnSignal}
    />
  );
}
