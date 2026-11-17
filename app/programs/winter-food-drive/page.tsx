export const dynamic = "force-dynamic";

import Link from "next/link";

export default async function WinterFoodDrivePage() {
  return (
    <div className="flex flex-col flex-1 font-sans">
      {/* Hero */}
      <section
        style={{ background: "linear-gradient(160deg, #3b0764 0%, #5B21B6 45%, #7C3AED 100%)" }}
      >
        <div className="px-4 pt-16 pb-12 text-center">
          <div className="max-w-2xl mx-auto">
            <span
              className="inline-block rounded-full px-4 py-1.5 text-sm font-semibold text-white mb-5"
              style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.25)" }}
            >
              Programs
            </span>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-white leading-tight mb-4">
              Winter Food Drive
            </h1>
            <p className="text-lg leading-8 mb-4" style={{ color: "rgba(255,255,255,0.75)", maxWidth: 520, margin: "0 auto 1rem" }}>
              Love Light Movement and Purple Fireflies are teaming up this winter so we can all help make sure our neighbors have enough to eat.
            </p>
            <p className="text-base font-semibold tracking-widest mb-10" style={{ color: "rgba(255,255,255,0.9)" }}>
              DECEMBER 1 – JANUARY 15
            </p>
          </div>
        </div>
      </section>

      {/* Body content */}
      <section className="px-4 py-16 bg-white">
        <div className="max-w-3xl mx-auto space-y-6">
          <p className="text-lg text-text-secondary leading-relaxed">
            When Athens restaurants and establishments slow down in winter, less surplus food is available to rescue and share with our community. Together, we can help fill the gap.
          </p>
          <p className="text-text-secondary">
            Drop-off: Wednesdays, 1:00 PM to 3:00 PM at AceNet. Dropbox locations: Kindred and Seamans.
          </p>
          {/* CTA cards */}
          <h2 className="text-2xl font-bold text-foreground mb-6">Get Involved</h2>
          <div className="grid gap-6 sm:grid-cols-2">
            <div
              className="rounded-xl p-6 flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
              style={{ background: "#fff", border: "1px solid rgba(124,58,237,0.12)", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}
            >
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl text-xl" style={{ background: "rgba(124,58,237,0.08)" }}>
                🥫
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">Donate Items</h3>
              <p className="text-sm text-text-secondary leading-relaxed flex-1">
                View the weekly donation request list and pledge items to help stock the pantry for our neighbors.
              </p>
              <Link href="/programs/winter-food-drive/donate" className="mt-5 inline-flex items-center gap-1 text-sm font-semibold transition-colors" style={{ color: "#7C3AED" }}>
                View donation list &amp; pledge →
              </Link>
            </div>
            <div
              className="rounded-xl p-6 flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
              style={{ background: "#fff", border: "1px solid rgba(124,58,237,0.12)", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}
            >
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl text-xl" style={{ background: "rgba(124,58,237,0.08)" }}>
                🍳
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">Volunteer in the Kitchen</h3>
              <p className="text-sm text-text-secondary leading-relaxed flex-1">
                Sign up to cook, clean, or pack for the Winter Food Drive. Five slots per role per date.
              </p>
              <Link href="/programs/winter-food-drive/volunteer" className="mt-5 inline-flex items-center gap-1 text-sm font-semibold transition-colors" style={{ color: "#7C3AED" }}>
                Volunteer in the kitchen →
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}