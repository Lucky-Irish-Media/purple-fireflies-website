import Link from "next/link";

// Link is used for the CTA cards below
const stats = [
  { num: "2x", label: "Weekly deliveries" },
  { num: "20 min", label: "Delivery radius" },
  { num: "100%", label: "Volunteer powered" },
];

const cards = [
  {
    icon: "🍲",
    title: "Receive a Meal",
    desc: "Sign up to receive meal deliveries in your area. We deliver on Wednesdays at 12:00 PM and Thursdays at 5:00 PM.",
    href: "/programs/meal-delivery/delivery-signup",
    cta: "Sign up for delivery",
  },
  {
    icon: "🚗",
    title: "Deliver Meals",
    desc: "Help deliver meals to those who can't get to town. Every trip makes a direct difference to neighbors in need.",
    href: "/programs/meal-delivery/volunteer-signup",
    cta: "Sign up to volunteer",
  },
];

export default function MealDeliveryPage() {
  return (
    <div className="flex flex-col flex-1 font-sans">
      {/* Hero */}
      <section
        style={{ background: "linear-gradient(160deg, #3b0764 0%, #5B21B6 45%, #7C3AED 100%)" }}
      >
        <div className="px-4 pt-16 pb-0 text-center">
          <div className="max-w-2xl mx-auto">
            <span
              className="inline-block rounded-full px-4 py-1.5 text-sm font-semibold text-white mb-5"
              style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.25)" }}
            >
              Programs
            </span>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-white leading-tight mb-4">
              Meal Delivery
            </h1>
            <p className="text-lg leading-8 mb-10" style={{ color: "rgba(255,255,255,0.75)", maxWidth: 520, margin: "0 auto 2.5rem" }}>
              Bridging the gap between free meal resources and the neighbors who can't reach them — one delivery at a time.
            </p>
          </div>
        </div>

        {/* Stats strip */}
        <div style={{ background: "rgba(0,0,0,0.25)", borderTop: "1px solid rgba(255,255,255,0.12)" }}>
          <div className="max-w-7xl mx-auto px-4 grid grid-cols-3">
            {stats.map((s, i) => (
              <div
                key={s.label}
                className="py-5 text-center"
                style={{ borderRight: i < stats.length - 1 ? "1px solid rgba(255,255,255,0.12)" : "none" }}
              >
                <div className="text-2xl font-bold" style={{ color: "#F59E0B" }}>{s.num}</div>
                <div className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.55)" }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Body content */}
      <section className="px-4 py-16 bg-white">
        <div className="max-w-5xl mx-auto">

          <div className="space-y-5 text-lg text-text-secondary leading-relaxed mb-12">
            <p>
              In our county, there&apos;s a stark divide: a wealthy university town surrounded by
              communities facing deep poverty. While the town has multiple organizations offering
              free meals, these resources primarily serve students and those with transportation
              to get there.
            </p>
            <p>
              For many residents throughout the county, lack of transportation creates an
              insurmountable barrier — leaving them without access to nutritious food just miles away.
            </p>
          </div>

          <h2 className="text-2xl font-bold text-foreground mb-3">Our Solution</h2>
          <p className="text-lg text-text-secondary leading-relaxed mb-10">
            The Meal Delivery program bridges this gap. We recruit volunteers who travel to
            free meal organizations in town, pick up meals, and deliver them directly to
            people in need throughout the county.
          </p>

          <h2 className="text-2xl font-bold text-foreground mb-3">Delivery Regions</h2>
          <p className="text-lg text-text-secondary leading-relaxed mb-12">
            We deliver up to 20 minutes from Athens Uptown. If you are more than 20 minutes
            from the meal pickup location, we may contact you to let you know we don&apos;t have
            a driver available for your area.
          </p>

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
