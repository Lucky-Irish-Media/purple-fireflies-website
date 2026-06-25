import Link from "next/link";

export default function AdminProgramsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Programs</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Link
          href="/admin/programs/meal-delivery"
          className="rounded-lg border border-primary/10 bg-card p-4 sm:p-6 hover:border-primary/30 transition-colors"
        >
          <h2 className="text-lg font-semibold text-foreground">
            Meal Delivery
          </h2>
          <p className="mt-1 text-sm text-text-secondary">
            View meal signups and driver volunteer data.
          </p>
        </Link>
      </div>
    </div>
  );
}
