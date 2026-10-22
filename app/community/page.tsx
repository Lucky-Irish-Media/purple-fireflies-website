import Link from "next/link";

export const metadata = {
  title: "Community | Purple Fireflies",
  description:
    "Meet the community groups Purple Fireflies works alongside in Athens County, Ohio - including Athens County Food Info, a directory of free food programs, and Love Light Movement, a volunteer group serving free meals across Athens and Meigs counties.",
};

// Add a partner by appending one object: name, monogram, blurb, href.
const partners = [
  {
    name: "Athens County Food Info",
    monogram: "AC",
    blurb:
      "A one-stop directory of free food programs across Athens County, Ohio: pantry hours and locations, free meals, food events, delivery and rides for people without a car, and help applying for programs. Built and kept current by Athens County residents who visit the locations themselves.",
    href: "https://athensfood.info",
  },
  {
    name: "Love Light Movement",
    monogram: "LL",
    blurb:
      "A 100% volunteer-run 501(c)(3) bridging the gap between food waste and food insecurity across Athens and Meigs counties, Ohio. They serve 400+ meals a week with free take-home meals in The Plains and delivery to Athens, The Plains, and Chauncey, all run entirely on donations with no paid staff or administrative fees.",
    href: "https://lovelightrecovery.com/",
  },
];

export default function CommunityPage() {
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
              Community
            </span>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-white leading-tight mb-4">
              Our Community
            </h1>
            <p className="text-lg leading-8" style={{ color: "rgba(255,255,255,0.75)", maxWidth: 560, margin: "0 auto" }}>
              Purple Fireflies does not work alone. These are the groups we share information,
              volunteers, and neighbors with. Each one has its own site and its own way of helping -
              follow the links to find out more and see where you can plug in.
            </p>
          </div>
        </div>
      </section>

      {/* Partners */}
      <section className="px-4 py-16 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-foreground mb-3">Groups We Work With</h2>
          <p className="text-lg text-text-secondary leading-relaxed mb-10" style={{ maxWidth: 640 }}>
            We share what we learn and point people at whoever is best placed to help. If you do
            not see a group you expected, tell us and we will add it.
          </p>

          <div className="grid gap-6 sm:grid-cols-2">
            {partners.map((p) => (
              <div
                key={p.name}
                className="flex flex-col p-6 rounded-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
                style={{
                  background: "#fff",
                  border: "1px solid rgba(124,58,237,0.12)",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                }}
              >
                <div
                  className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl text-sm font-bold text-white"
                  style={{ background: "#7C3AED" }}
                >
                  {p.monogram}
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">{p.name}</h3>
                <p className="text-sm text-text-secondary leading-relaxed flex-1">{p.blurb}</p>
                <a
                  href={p.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-5 inline-flex items-center gap-1 text-sm font-semibold transition-colors"
                  style={{ color: "#7C3AED" }}
                >
                  Visit {p.name} →
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="px-4 py-16">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-foreground mb-3">Want to Join In?</h2>
          <p className="text-lg text-text-secondary leading-relaxed mb-8" style={{ maxWidth: 560, margin: "0 auto" }}>
            Every group on this page is short on hands. Tell us what you are good at and we will
            point you at the right place, or at us if it is not on this page yet.
          </p>
          <Link
            href="/contact"
            className="inline-block rounded-full px-6 py-3 text-base font-bold text-white shadow-md transition-all duration-200 hover:shadow-lg no-underline"
            style={{ background: "#7C3AED" }}
          >
            Get Involved
          </Link>
        </div>
      </section>
    </div>
  );
}
