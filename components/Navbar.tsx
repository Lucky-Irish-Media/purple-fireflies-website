"use client";

import Link from "next/link";
import { useState } from "react";

export default function Navbar() {
  const [isProgramsOpen, setIsProgramsOpen] = useState(false);

  return (
    <nav className="relative flex items-center justify-between bg-[#7800C2] px-6 py-4">
      <div className="text-lg font-semibold text-white">
        Purple Fireflies
      </div>
      <div className="flex items-center gap-6">
        <Link
          href="/"
          className="text-sm text-white/80 hover:text-white"
        >
          Home
        </Link>
        <div
          className="relative flex items-center"
          onMouseEnter={() => setIsProgramsOpen(true)}
          onMouseLeave={() => setIsProgramsOpen(false)}
        >
          <button className="text-sm text-white/80 hover:text-white">
            Programs
          </button>
          {isProgramsOpen && (
            <div className="absolute top-full left-0 pt-2">
              <div className="w-48 rounded-md border bg-background py-2 shadow-lg">
                <Link
                  href="/programs/meal-delivery"
                  className="block px-4 py-2 text-sm text-text-secondary hover:bg-accent hover:text-foreground"
                >
                  Meal Delivery
                </Link>
              </div>
            </div>
          )}
        </div>
        <Link
          href="/donate"
          className="text-sm text-white/80 hover:text-white"
        >
          Donate
        </Link>
      </div>
    </nav>
  );
}
