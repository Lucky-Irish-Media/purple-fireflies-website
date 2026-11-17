export const dynamic = "force-dynamic";

import { getOpenVolunteerDays, getSlotUsageForDay } from "@/app/lib/db";
import VolunteerMealSignupForm from "@/components/VolunteerMealSignupForm";
import VolunteerDaysCalendarModal from "@/components/VolunteerDaysCalendarModal";

export default async function WinterFoodDriveVolunteerPage() {
  const days = await getOpenVolunteerDays();
  const today = new Date().toISOString().slice(0, 10);
  const upcoming = days.filter((d) => d.date >= today);
  const withSlots = await Promise.all(
    upcoming.map(async (day) => ({ day, slots: await getSlotUsageForDay(day.id) }))
  );

  const slotUsage: Record<number, Record<string, number>> = {};
  for (const { day, slots } of withSlots) slotUsage[day.id] = slots;

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Winter Food Drive — Volunteer in the Kitchen</h1>
      <p className="text-text-secondary">
        Sign up to cook, clean, or pack for the Winter Food Drive. Five slots per role per date.
      </p>

      <VolunteerDaysCalendarModal days={upcoming} slotUsage={slotUsage} buttonLabel="Show Calendar" />

      {withSlots.length === 0 && (
        <p className="text-text-secondary">No upcoming volunteer days. Check back soon.</p>
      )}

      <VolunteerMealSignupForm days={withSlots} />
    </div>
  );
}
