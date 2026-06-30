import {
  getWeeklyAssignments,
  getUnassignedSignups,
  getDriverLoad,
  getMealTypeBreakdown,
  getCoverageGaps,
  getVolunteerAvailability,
  getDriverTotalAssignments,
} from "@/app/lib/reports";
import ReportsTabs from "./ReportsTabs";

export default async function AdminReportsPage() {
  const [
    weeklyAssignments,
    unassignedSignups,
    driverLoad,
    mealTypeBreakdown,
    coverageGaps,
    volunteerAvailability,
    driverTotalAssignments,
  ] = await Promise.all([
    getWeeklyAssignments(),
    getUnassignedSignups(),
    getDriverLoad(),
    getMealTypeBreakdown(),
    getCoverageGaps(),
    getVolunteerAvailability(),
    getDriverTotalAssignments(),
  ]);

  const weeks = [...new Set(weeklyAssignments.map((r) => r.iso_week))].sort().reverse();

  return (
    <ReportsTabs
      weeklyAssignments={weeklyAssignments}
      unassignedSignups={unassignedSignups}
      driverLoad={driverLoad}
      mealTypeBreakdown={mealTypeBreakdown}
      coverageGaps={coverageGaps}
      volunteerAvailability={volunteerAvailability}
      driverTotalAssignments={driverTotalAssignments}
      weeks={weeks}
    />
  );
}
