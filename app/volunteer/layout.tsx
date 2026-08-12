import Link from "next/link";
import { verifySession } from "@/app/lib/dal";
import { getUserByEmail } from "@/app/lib/db";
import { logout } from "@/app/actions/auth";

export default async function VolunteerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await verifySession();
  const user = await getUserByEmail(session.email);

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <header className="mb-10 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Volunteer Portal</h1>
          <p className="mt-1 text-sm text-text-secondary">
            {user?.name ? `${user.name} · ` : ""}
            {session.email}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="text-sm font-medium text-primary hover:underline"
          >
            View Site
          </Link>
          <form action={logout}>
            <button
              type="submit"
              className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Sign out
            </button>
          </form>
        </div>
      </header>

      {children}
    </div>
  );
}
