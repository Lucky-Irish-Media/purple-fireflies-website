import Link from "next/link";

export const metadata = {
  title: "Springfield Neighbors | Purple Fireflies",
  description:
    "Supporting Haitian families in Springfield who are afraid to leave their homes — drop off shelf-stable pantry staples at our Athens collection spots and a volunteer carries donations down each week.",
};

const dropOffSpots = [
  {
    name: "Little Wings Thrift Store",
    address: "1006-C E. State Street, Athens",
    note: "Mention your donation is for Springfield Neighbors when you drop it off.",
  },
];

const items = [
  "Boxed breakfast cereal",
  "Boxed spaghetti",
  "Boxed Mac & cheese",
  "Ramen noodles",
  "Canned corn",
  "Canned green beans",
  "Canned potatoes",
  "Canned peas",
  "Canned tomatoes",
  "Canned peaches",
  "Canned spaghetti sauce (no glass, please)",
  "Canned ravioli",
  "Plastic jar of peanut butter",
  "Large canned chicken",
  "Canned tuna",
  "Bagged beans",
  "Bagged rice",
  "Bagged lentils",
  "1 qt. shelf-stable boxed milk",
  "Plastic jar of applesauce",
  "Toilet paper",
];

const cards = [
  {
    icon: "🎁",
    title: "Donate a Walmart eGift Card",
    desc: "Buy a Walmart eGift card online and email it to us — we use it to pick up fresh items and fill any gaps in donations.",
    href: "https://www.walmart.com/giftcards/ip/Everyday-Basic-Blue-Yellow-Spark-Walmart-eGift-Card/323856066",
    external: true,
    cta: "Purchase an eGift card",
  },
  {
    icon: "📮",
    title: "Get in Touch",
    desc: "Have questions, want to arrange a donation drop-off, or know a neighbor who could use a hand? Reach out anytime.",
    href: "mailto:springfield_neighbors@proton.me",
    external: true,
    cta: "Email Springfield Neighbors",
  },
];

export default function SpringfieldNeighborsPage() {
  return (
    <div className="flex flex-col flex-1 font-sans">
      {/* Hero */}
      <section
        style={{ background: "linear-gradient(160deg, #3b0764 0%, #5B21B6 45%, #7C3AED 100%)" }}
      >
        <div className="px-4 pt-16 pb-0 text-center">
          <div className="max-w-2xl mx-auto">
            <div className="flex justify-center gap-2 mb-5">
            <span
              className="inline-block rounded-full px-4 py-1.5 text-sm font-semibold text-white"
              style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.25)" }}
            >
              Programs
            </span>
            <span
              className="inline-block rounded-full px-4 py-1.5 text-sm font-semibold text-white"
              style={{ background: "#F59E0B" }}
            >
              Collaboration
            </span>
          </div>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-white leading-tight mb-4">
              Springfield Neighbors
            </h1>
            <p className="text-lg leading-8" style={{ color: "rgba(255,255,255,0.75)", maxWidth: 560, margin: "0 auto 2.5rem" }}>
              Supporting Haitian families in Springfield who are afraid to leave their homes —
              drop off shelf-stable pantry staples and a volunteer brings them down each week.
            </p>
          </div>
        </div>
      </section>

      {/* Body content */}
      <section className="px-4 py-16 bg-white">
        <div className="max-w-5xl mx-auto">

          {/* About */}
          <h2 className="text-2xl font-bold text-foreground mb-3">About Springfield Neighbors</h2>
          <div
            className="rounded-xl p-5 mb-8"
            style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.25)" }}
          >
            <p className="text-foreground font-semibold">A community collaboration</p>
            <p className="text-text-secondary text-base leading-relaxed mt-2">
              Springfield Neighbors is not a Purple Fireflies program. It&apos;s a collaboration
              among community members — Purple Fireflies is simply hosting this information on
              our website so neighbors can find it and get involved.
            </p>
          </div>
          <div className="space-y-5 text-lg text-text-secondary leading-relaxed mb-12">
            <p>
              Springfield Neighbors is a mutual aid food program supporting the Haitian community
              in Springfield. Many Haitian families are afraid to leave their homes due to the
              ongoing events in their county. This program helps ensure they have food and
              essentials without having to take that risk.
            </p>
            <p>
              The program runs entirely on community generosity. Drop off shelf-stable pantry
              staples at one of our designated collection spots, then a volunteer carries the
              donations down to Springfield each week. No middlemen, no overhead — just
              neighbors helping neighbors.
            </p>
            <p>
              Nothing is too small. A single box of cereal or a roll of toilet paper might seem
              modest on its own, but together these donations keep pantries full and families
              fed.
            </p>
          </div>

          {/* Drop-off locations */}
          <h2 className="text-2xl font-bold text-foreground mb-3">Where to Drop Off</h2>
          <p className="text-lg text-text-secondary leading-relaxed mb-6">
            We&apos;re currently collecting at the spot below. Check back — we&apos;re adding
            more drop-off locations all the time.
          </p>
          <div className="grid gap-4 sm:grid-cols-2 mb-12">
            {dropOffSpots.map((spot) => (
              <div
                key={spot.name}
                className="rounded-xl p-6 flex flex-col"
                style={{ background: "rgba(124,58,237,0.06)", border: "1px solid rgba(124,58,237,0.12)" }}
              >
                <div
                  className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl text-xl"
                  style={{ background: "rgba(124,58,237,0.08)" }}
                >
                  📍
                </div>
                <h3 className="text-lg font-bold text-foreground mb-1">{spot.name}</h3>
                <p className="text-base text-text-secondary leading-relaxed mb-2">{spot.address}</p>
                <p className="text-sm text-text-secondary leading-relaxed flex-1">{spot.note}</p>
              </div>
            ))}
          </div>

          {/* Items to donate */}
          <h2 className="text-2xl font-bold text-foreground mb-3">Items We Accept</h2>
          <p className="text-lg text-text-secondary leading-relaxed mb-6">
            Please donate shelf-stable pantry staples. Here&apos;s what we&apos;re currently collecting:
          </p>
          <div className="grid gap-3 sm:grid-cols-2 mb-12">
            {items.map((item) => (
              <div
                key={item}
                className="flex items-start gap-3 rounded-lg p-3"
                style={{ background: "rgba(124,58,237,0.06)", border: "1px solid rgba(124,58,237,0.1)" }}
              >
                <span
                  className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs text-white"
                  style={{ background: "#7C3AED" }}
                >
                  ✓
                </span>
                <span className="text-base text-foreground font-medium">{item}</span>
              </div>
            ))}
          </div>

          {/* Walmart eGift cards */}
          <h2 className="text-2xl font-bold text-foreground mb-3">Walmart eGift Cards</h2>
          <div className="space-y-5 text-lg text-text-secondary leading-relaxed mb-12">
            <p>
              A Walmart eGift card is one of the most flexible ways to help. We use donated cards
              to buy fresh produce, dairy, and other items that can&apos;t be donated as staples —
              so every card rounds out what our pantry staples can provide.
            </p>
            <div className="rounded-xl p-6 space-y-3" style={{ background: "rgba(124,58,237,0.06)", border: "1px solid rgba(124,58,237,0.12)" }}>
              <p className="text-foreground font-semibold text-base">How to donate a card:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Click the link below to open the Walmart eGift card page</li>
                <li>Choose the amount you&apos;d like to give</li>
                <li>Enter <strong className="text-foreground">springfield_neighbors@proton.me</strong> as the recipient email at checkout so the card comes straight to us</li>
              </ul>
            </div>
          </div>

          {/* CTA cards */}
          <h2 className="text-2xl font-bold text-foreground mb-6">Get Involved</h2>
          <div className="grid gap-6 sm:grid-cols-2">
            {cards.map((c) => (
              <div
                key={c.title}
                className="rounded-xl p-6 flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
                style={{
                  background: "#fff",
                  border: "1px solid rgba(124,58,237,0.12)",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                }}
              >
                <div
                  className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl text-xl"
                  style={{ background: "rgba(124,58,237,0.08)" }}
                >
                  {c.icon}
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">{c.title}</h3>
                <p className="text-sm text-text-secondary leading-relaxed flex-1">{c.desc}</p>
                <Link
                  href={c.href}
                  target={c.external ? "_blank" : undefined}
                  rel={c.external ? "noopener noreferrer" : undefined}
                  className="mt-5 inline-flex items-center gap-1 text-sm font-semibold transition-colors"
                  style={{ color: "#7C3AED" }}
                >
                  {c.cta} →
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}