"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";

const navLinks = [
  { href: "/admin", label: "Dashboard", section: false },
  { type: "heading", label: "Programs" },
  { href: "/admin/programs/meal-delivery", label: "Meal Delivery", section: true },
  { type: "heading", label: "Reports" },
  { href: "/admin/reports", label: "Meal Delivery Reports", section: true },
  { type: "heading", label: "Administration" },
  { href: "/admin/users", label: "Users", section: true },
];

export function MobileSidebar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="sm:hidden rounded-lg p-1.5 text-white/70 hover:text-white hover:bg-white/10 transition-colors"
        aria-label="Open navigation menu"
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 sm:hidden"
          onClick={() => setOpen(false)}
        >
          <div className="absolute inset-0 bg-black/50" />

          <div
            className="absolute left-0 top-0 bottom-0 w-64 bg-card border-r border-primary/10 shadow-xl p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-semibold text-foreground">Navigation</span>
              <button
                onClick={() => setOpen(false)}
                className="rounded-lg p-1.5 text-text-secondary hover:text-foreground hover:bg-primary/5 transition-colors"
                aria-label="Close navigation menu"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <nav className="flex flex-col gap-1">
              {navLinks.map((link) => {
                if ("type" in link && link.type === "heading") {
                  return (
                    <span key={link.label} className="mt-4 mb-1 px-3 text-xs font-semibold uppercase tracking-wider text-text-secondary">
                      {link.label}
                    </span>
                  );
                }
                const href = "href" in link ? (link.href ?? "") : "";
                const isActive = pathname === href || (href !== "/admin" && pathname.startsWith(href));
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setOpen(false)}
                    className={`rounded-lg px-3 py-2 text-sm transition-colors ${
                      isActive
                        ? "bg-primary text-white font-semibold"
                        : "font-medium text-foreground hover:bg-primary/10"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
