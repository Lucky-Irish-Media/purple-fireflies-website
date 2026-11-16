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
          <Link
            href="/programs/winter-food-drive/donate"
            className="inline-block rounded-lg bg-primary text-white px-4 py-2 text-sm font-medium"
          >
            View donation list &amp; pledge
          </Link>
        </div>
      </section>
    </div>
  );
}