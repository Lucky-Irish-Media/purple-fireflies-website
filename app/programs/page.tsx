import Link from "next/link";

const programs = [
  {
    icon: "🍲",
    title: "Meal Delivery",
    desc: "Hot, nutritious meals delivered to neighbors in need every week. Our volunteers pick up meals from local organizations and deliver them directly to those who can't get to town.",
    href: "/programs/meal-delivery",
    cta: "Learn more",
  },
];

export default function ProgramsPage() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <h1 className="mb-6 text-4xl font-bold">Our Programs</h1>
      <p className="mb-8 text-lg text-text-secondary leading-relaxed">
        We believe that strong communities are built when every neighbor has what they
        need to thrive. Our programs are designed to bridge gaps, connect resources,
        and create lasting change — one relationship at a time.
      </p>
      <div className="grid gap-6 md:grid-cols-2">
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
    </main>
  );
}
