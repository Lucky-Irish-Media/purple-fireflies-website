import Link from "next/link";
import { getDashboardSummary, getUnassignedSignups, getCoverageGaps } from "@/app/lib/reports";
import { SendRemindersButton } from "@/components/SendRemindersButton";

async function StatCard({
  label,
  value,
  href,
  variant = "default",
}: {
  label: string;
  value: string | number;
  href?: string;
  variant?: "default" | "warning" | "danger" | "success";
}) {
  const bg = {
    default: "bg-card border-primary/10",
    warning: "bg-amber-50 border-amber-200",
    danger: "bg-red-50 border-red-200",
    success: "bg-green-50 border-green-200",
  }[variant];

  const valColor = {
    default: "text-foreground",
    warning: "text-amber-800",
    danger: "text-red-800",
    success: "text-green-800",
  }[variant];

  const inner = (
    <div className={`rounded-lg border p-4 ${bg}`}>
      <div className={`text-2xl font-bold ${valColor}`}>{value}</div>
      <div className="text-sm text-text-secondary mt-1">{label}</div>
    </div>
  );

  if (href) {
    return <Link href={href}>{inner}</Link>;
  }
  return inner;
}

export default async function AdminDashboard() {
  const [summary, unassigned, gaps] = await Promise.all([
    getDashboardSummary(),
    getUnassignedSignups(),
    getCoverageGaps(),
  ]);

  const gapDates = gaps.filter((g) => g.unassigned_count > 0);
  const nextDateStr = summary.upcoming_date
    ? new Date(summary.upcoming_date + "T00:00:00").toLocaleDateString("en-US", {
        weekday: "long",
        month: "short",
        day: "numeric",
      })
    : null;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <Link
          href="/admin/reports"
          className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark transition-colors"
        >
          View Full Reports
        </Link>
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground">Meal Delivery Program</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard
            label="Total Meals Delivered"
            value={summary.total_meals_delivered}
            href="/admin/reports"
          />
          <StatCard
            label="Meal Signups (30 days)"
            value={summary.total_meal_signups_30d}
            href="/admin/programs/meal-delivery"
          />
          <StatCard
            label="Drivers Signed Up (30 days)"
            value={summary.total_drivers_30d}
            href="/admin/programs/meal-delivery"
          />
          <StatCard
            label="Unassigned Signups"
            value={unassigned.length}
            variant={unassigned.length > 0 ? "warning" : "success"}
            href="/admin/reports"
          />
          <StatCard
            label="Dates with Gaps"
            value={gapDates.length}
            variant={gapDates.length > 0 ? "danger" : "success"}
            href="/admin/reports"
          />
        </div>
      </section>

      {nextDateStr && (
        <div className="rounded-lg border border-primary/10 bg-card p-4">
          <h2 className="text-lg font-semibold text-foreground">Next Delivery: {nextDateStr}</h2>
          <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-text-secondary">Signups</span>
              <p className="font-semibold text-foreground">{summary.upcoming_signup_count ?? "—"}</p>
            </div>
            <div>
              <span className="text-text-secondary">Assigned</span>
              <p className="font-semibold text-foreground">{summary.upcoming_assigned_count ?? "—"}</p>
            </div>
            <div>
              <span className="text-text-secondary">Wed. Drivers</span>
              <p className="font-semibold text-foreground">{summary.next_wednesday_drivers}</p>
            </div>
            <div>
              <span className="text-text-secondary">Thu. Drivers</span>
              <p className="font-semibold text-foreground">{summary.next_thursday_drivers}</p>
            </div>
          </div>
        </div>
      )}

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground">Driver Reminder Emails</h2>
        <p className="text-sm text-text-secondary">
          Send reminder emails to drivers with deliveries scheduled for tomorrow. Requires
          <code className="mx-1 rounded bg-card px-1.5 py-0.5 text-xs font-mono">EMAIL_API_KEY</code>
          and
          <code className="mx-1 rounded bg-card px-1.5 py-0.5 text-xs font-mono">EMAIL_FROM</code>
          to be configured.
        </p>
        <SendRemindersButton />
      </section>
    </div>
  );
}
