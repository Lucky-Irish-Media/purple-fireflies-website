import Link from "next/link";
import { verifySession } from "@/app/lib/dal";
import { logout } from "@/app/actions/auth";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await verifySession();

  return (
    <div className="min-h-full flex flex-col bg-background">
      <header className="bg-gradient-to-r from-primary-dark to-primary shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-14">
          <div className="flex items-center gap-6">
            <Link
              href="/admin"
              className="text-lg font-bold text-white tracking-tight"
            >
              Admin Panel
            </Link>
            <span className="hidden sm:inline text-sm text-white/60">
              {session.email}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="text-sm text-white/70 hover:text-white transition-colors"
            >
              View Site
            </Link>
            <form action={logout}>
              <button
                type="submit"
                className="rounded-lg bg-white/10 px-3 py-1.5 text-sm font-semibold text-white transition-all hover:bg-white/20"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        <aside className="hidden sm:flex w-56 flex-col bg-card border-r border-primary/10 p-4 gap-1">
          <Link
            href="/admin"
            className="rounded-lg px-3 py-2 text-sm font-semibold text-foreground hover:bg-primary/10 transition-colors"
          >
            Dashboard
          </Link>

          <span className="mt-4 mb-1 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Programs
          </span>

          <Link
            href="/admin/programs/meal-delivery"
            className="rounded-lg px-3 py-2 text-sm font-medium text-foreground hover:bg-primary/10 transition-colors"
          >
            Meal Delivery
          </Link>
        </aside>

        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
