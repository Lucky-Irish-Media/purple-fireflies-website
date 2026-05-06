import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="flex items-center justify-between px-6 py-4">
      <div className="text-lg font-semibold text-primary">
        Purple Fireflies
      </div>
      <div className="flex gap-6">
        <Link
          href="/"
          className="text-sm text-text-secondary hover:text-foreground"
        >
          Home
        </Link>
        <Link
          href="/donate"
          className="text-sm text-text-secondary hover:text-foreground"
        >
          Donate
        </Link>
      </div>
    </nav>
  );
}
