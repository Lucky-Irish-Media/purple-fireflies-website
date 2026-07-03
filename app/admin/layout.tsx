import Link from "next/link";
import { verifySession } from "@/app/lib/dal";
import { logout } from "@/app/actions/auth";
import { MobileSidebar } from "@/app/admin/components/MobileSidebar";
import { DesktopNav } from "@/app/admin/components/DesktopNav";

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
          <div className="flex items-center gap-2 sm:gap-6">
            <MobileSidebar />
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

          <div className="flex items-center gap-2 sm:gap-4">
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

      <DesktopNav />

      <main className="flex-1 p-4 sm:p-6">{children}</main>
    </div>
  );
}
