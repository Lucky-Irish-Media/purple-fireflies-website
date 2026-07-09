import Link from "next/link";

const programs = [
  {
    icon: "🍲",
    title: "Meal Delivery",
    desc: "Hot, nutritious meals delivered to neighbors in need every week.",
    href: "/programs/meal-delivery",
    cta: "Sign up",
  },
  {
    icon: "🤝",
    title: "Community",
    desc: "Events and resources that connect neighbors and build shared purpose.",
    href: "/programs",
    cta: "Learn more",
  },
  {
    icon: "🙌",
    title: "Volunteer",
    desc: "Join our driver and volunteer network and make a direct difference.",
    href: "/programs/meal-delivery/volunteer-signup",
    cta: "Volunteer",
  },
];

export default function Home() {
  return (
    <div className="flex flex-col flex-1 font-sans">
      {/* Hero */}
      <section
        style={{ background: "linear-gradient(160deg, #3b0764 0%, #5B21B6 45%, #7C3AED 100%)" }}
      >
        <div className="px-4 pt-20 pb-0 text-center">
        <div className="max-w-2xl mx-auto animate-fade-in-up">
          <span
            className="inline-block rounded-full px-4 py-1.5 text-sm font-semibold text-white mb-5"
            style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.25)" }}
          >
            Community First
          </span>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-white leading-tight mb-4">
            Empowering neighbors,<br className="hidden sm:block" /> building lasting change
          </h1>
          <p className="text-lg leading-8 mb-8" style={{ color: "rgba(255,255,255,0.75)", maxWidth: 480, margin: "0 auto 2rem" }}>
            Fostering an inclusive community where everyone feels safe, respected, and empowered to thrive.
          </p>
          <div className="flex flex-wrap gap-3 justify-center pb-12">
            <Link
              href="/contact"
              className="rounded-full px-7 py-3 text-sm font-bold text-white shadow-lg transition-all duration-200 hover:opacity-90"
              style={{ background: "#F59E0B" }}
            >
              Get Involved
            </Link>
            <Link
              href="/programs"
              className="rounded-full px-7 py-3 text-sm font-semibold text-white transition-all duration-200 hover:bg-white/20"
              style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.3)" }}
            >
              Learn more
            </Link>
          </div>
        </div>
        </div>
      </section>

      {/* Programs */}
      <section className="px-4 py-16 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-foreground text-center mb-8">What we do</h2>
          <div className="grid gap-6 md:grid-cols-3">
            {programs.map((p, i) => (
              <div
                key={p.title}
                className="rounded-xl p-6 flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
                style={{
                  background: "#fff",
                  border: "1px solid rgba(124,58,237,0.12)",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                  animationDelay: `${i * 0.15}s`,
                }}
              >
                <div
                  className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl text-xl"
                  style={{ background: "rgba(124,58,237,0.08)" }}
                >
                  {p.icon}
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">{p.title}</h3>
                <p className="text-text-secondary leading-relaxed flex-1 text-sm">{p.desc}</p>
                <Link
                  href={p.href}
                  className="mt-5 inline-flex items-center gap-1 text-sm font-semibold transition-colors"
                  style={{ color: "#7C3AED" }}
                >
                  {p.cta} →
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Donate CTA */}
      <section className="px-4 py-12" style={{ background: "#F59E0B" }}>
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
          <div>
            <h2 className="text-2xl font-bold text-white">Support our mission</h2>
            <p className="text-base mt-1" style={{ color: "rgba(255,255,255,0.85)" }}>
              Every dollar goes directly to our community programs.
            </p>
          </div>
          <Link
            href="/donate"
            className="shrink-0 rounded-full px-7 py-3 text-base font-bold shadow-md transition-all duration-200 hover:shadow-lg"
            style={{ background: "#fff", color: "#92400E" }}
          >
            Donate today
          </Link>
        </div>
      </section>
    </div>
  );
}
