import { verifySession } from "@/app/lib/dal";
import { getParticipantByEmail, getVolunteerDashboard } from "@/app/lib/db";
import { SignupsSection } from "@/app/volunteer/SignupsSection";
import { ProfileForm } from "@/app/volunteer/ProfileForm";
import { PasswordForm } from "@/app/volunteer/PasswordForm";

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
    <div className="space-y-12">
      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-foreground">My Upcoming Signups</h2>
        <SignupsSection signups={dashboard.signups} />
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-foreground">My Profile</h2>
        <ProfileForm
          participant={participant}
          initialRegions={initialRegions}
          initialOnSignal={initialOnSignal}
        />
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-foreground">Change Password</h2>
        <PasswordForm />
      </section>
    </div>
  );
}
