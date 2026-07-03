"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navLinks = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/programs/meal-delivery", label: "Meal Delivery" },
  { href: "/admin/reports", label: "Reports" },
  { href: "/admin/users", label: "Users" },
];

export function DesktopNav() {
  const pathname = usePathname();

  return (
    <nav className="hidden sm:flex items-center gap-1 px-4 sm:px-6 lg:px-8 py-2 bg-card border-b border-primary/10">
      {navLinks.map((link, i) => {
        const isActive = pathname === link.href || (link.href !== "/admin" && pathname.startsWith(link.href));
        return (
          <span key={link.href} className="flex items-center gap-1">
            {i > 0 && <span className="text-text-secondary text-xs mx-1">|</span>}
            <Link
              href={link.href}
              className={`rounded-lg px-3 py-1.5 text-sm transition-colors ${
                isActive
                  ? "bg-primary text-white font-semibold"
                  : "text-foreground font-medium hover:bg-primary/10"
              }`}
            >
              {link.label}
            </Link>
          </span>
        );
      })}
    </nav>
  );
}
