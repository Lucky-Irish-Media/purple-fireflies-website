import Link from "next/link";

const programs = [
  {
    icon: "🍲",
    title: "Meal Delivery",
    desc: "Hot, nutritious meals delivered to neighbors in need every week. Our volunteers pick up meals from local organizations and deliver them directly to those who can't get to town.",
    href: "/programs/meal-delivery",
    cta: "Learn more",
  },
  {
    icon: "👁️",
    title: "Legal Observers",
    desc: "Trained volunteers who document government conduct at protests and support First Amendment activity. Join the legal support network.",
    href: "/programs/legal-observers",
    cta: "Learn more",
  },
  {
    icon: "🛒",
    title: "Springfield Neighbors",
    desc: "Donate shelf-stable pantry staples and Walmart eGift cards to help keep neighbors' shelves stocked. Every can and box goes directly to a neighbor who needs it.",
    href: "/programs/springfield-neighbors",
    cta: "Learn more",
  },
  {
    icon: "🐾",
    title: "Sponsor a Pet Program",
    desc: "Help Athens County neighbors keep their pets. Money is paid as vouchers and through agreements with vets in the area, and food is purchased by Purple Fireflies and distributed to the pets that are sponsored.",
    href: "/programs/community-pets",
    cta: "Learn more",
  },
];

export default function ProgramsPage() {
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
              Our Work
            </span>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-white leading-tight mb-4">
              Our Programs
            </h1>
            <p className="text-lg leading-8" style={{ color: "rgba(255,255,255,0.75)", maxWidth: 560, margin: "0 auto" }}>
              We believe that strong communities are built when every neighbor has what they
              need to thrive. Our programs are designed to bridge gaps, connect resources,
              and create lasting change — one relationship at a time.
            </p>
          </div>
        </div>
      </section>

      {/* Programs */}
      <section className="px-4 py-16 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="grid gap-6 sm:grid-cols-2">
            {programs.map((p) => (
              <div
                key={p.title}
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
                  {p.icon}
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">{p.title}</h3>
                <p className="text-text-secondary leading-relaxed flex-1 text-sm">{p.desc}</p>
                <Link
                  href={p.href}
                  className="mt-5 inline-flex items-center gap-1 text-sm font-semibold transition-colors hover:opacity-80"
                  style={{ color: "#7C3AED" }}
                >
                  {p.cta} →
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
