import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="flex items-center justify-between px-6 py-4">
      <div className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
        Purple Fireflies
      </div>
      <div className="flex gap-6">
        <Link
          href="/"
          className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
        >
          Home
        </Link>
        <Link
          href="/donate"
          className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
        >
          Donate
        </Link>
      </div>
    </nav>
  );
}
