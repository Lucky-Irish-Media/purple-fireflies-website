"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

export default function Navbar() {
  const pathname = usePathname();
  const [isProgramsOpen, setIsProgramsOpen] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  if (pathname.startsWith("/admin") || pathname === "/login") {
    return null;
  }

  const linkClass = (path: string) =>
    `text-base font-semibold transition-colors duration-200 ${
      pathname === path
        ? "text-white"
        : "text-white/70 hover:text-white"
    }`;

  return (
    <nav style={{ background: "#3b0764" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link href="/" className="text-2xl font-bold text-white tracking-tight">
            Purple Fireflies
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            <Link href="/" className={linkClass("/")}>
              Home
            </Link>
            <div
              className="relative"
              onMouseEnter={() => setIsProgramsOpen(true)}
              onMouseLeave={() => setIsProgramsOpen(false)}
            >
              <button
                className={`text-base font-semibold transition-colors duration-200 ${
                  pathname.startsWith("/programs")
                    ? "text-white"
                    : "text-white/70 hover:text-white"
                }`}
              >
                Programs
              </button>
              {(isProgramsOpen) && (
                <div className="absolute top-full left-0 z-50 pt-2">
                  <div className="w-48 rounded-lg border border-white/10 bg-primary-dark/95 backdrop-blur-sm py-2 shadow-xl transition-opacity duration-200">
                    <Link
                      href="/programs/meal-delivery"
                      className="block px-4 py-2.5 text-sm text-white/80 hover:text-white hover:bg-white/10 transition-colors"
                    >
                      Meal Delivery
                    </Link>
                  </div>
                </div>
              )}
            </div>
            <Link href="/donate" className={linkClass("/donate")}>
              Donate
            </Link>
            <Link
              href="/contact"
              className="rounded-full bg-accent px-5 py-2 text-sm font-bold text-white shadow-md transition-all duration-200 hover:bg-amber-400 hover:shadow-lg"
            >
              Get Involved
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 text-white"
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            aria-label="Toggle menu"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              {isMobileOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {isMobileOpen && (
          <div className="md:hidden pb-4 space-y-2 animate-fade-in-up">
            <Link
              href="/"
              className="block px-3 py-2 text-white/80 hover:text-white hover:bg-white/10 rounded-md transition-colors"
              onClick={() => setIsMobileOpen(false)}
            >
              Home
            </Link>
            <Link
              href="/programs/meal-delivery"
              className="block px-3 py-2 text-white/80 hover:text-white hover:bg-white/10 rounded-md transition-colors"
              onClick={() => setIsMobileOpen(false)}
            >
              Programs — Meal Delivery
            </Link>
            <Link
              href="/donate"
              className="block px-3 py-2 text-white/80 hover:text-white hover:bg-white/10 rounded-md transition-colors"
              onClick={() => setIsMobileOpen(false)}
            >
              Donate
            </Link>
            <Link
              href="/contact"
              className="block px-3 py-2 text-white font-bold rounded-md bg-accent text-center transition-colors"
              onClick={() => setIsMobileOpen(false)}
            >
              Get Involved
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
