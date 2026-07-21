import {
  getWeeklyAssignments,
  getUnassignedSignups,
  getDriverLoad,
  getMealTypeBreakdown,
  getCoverageGaps,
  getVolunteerAvailability,
  getDriverTotalAssignments,
  getMonthlyMealDeliveryTotals,
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
    monthlyMealTotals,
  ] = await Promise.all([
    getWeeklyAssignments(),
    getUnassignedSignups(),
    getDriverLoad(),
    getMealTypeBreakdown(),
    getCoverageGaps(),
    getVolunteerAvailability(),
    getDriverTotalAssignments(),
    getMonthlyMealDeliveryTotals(),
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
      monthlyMealTotals={monthlyMealTotals}
      weeks={weeks}
    />
  );
}
