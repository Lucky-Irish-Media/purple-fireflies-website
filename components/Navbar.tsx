"use client";

import Link from "next/link";
import { useState } from "react";

export default function Navbar() {
  const [isProgramsOpen, setIsProgramsOpen] = useState(false);

  return (
    <nav className="bg-[#7800C2] shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link href="/" className="text-xl font-bold text-white">
            Purple Fireflies
          </Link>
          <div className="flex items-center gap-6">
            <Link
              href="/"
              className="text-sm text-white/80 hover:text-white"
            >
              Home
            </Link>
            <div
              className="relative"
              onMouseEnter={() => setIsProgramsOpen(true)}
              onMouseLeave={() => setIsProgramsOpen(false)}
            >
              <button className="text-sm text-white/80 hover:text-white">
                Programs
              </button>
              {isProgramsOpen && (
                <div className="absolute top-full left-0 z-50">
                  <div className="w-48 rounded-md border bg-white py-2 shadow-lg">
                    <Link
                      href="/programs/meal-delivery"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
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
        </div>
      </div>
    </nav>
  );
}
