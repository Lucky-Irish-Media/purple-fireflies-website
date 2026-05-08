export default function Home() {
  return (
    <div className="flex flex-col flex-1 bg-background font-sans">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
        <div className="flex flex-col items-center gap-6 px-4 pt-24 pb-16 text-center max-w-2xl mx-auto animate-fade-in-up">
          <span className="rounded-full bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary">
            Community First
          </span>
          <h1 className="text-5xl font-bold tracking-tight text-foreground">
            Our Mission
          </h1>
          <p className="text-lg leading-8 text-text-secondary">
            To foster an inclusive community where everyone feels safe, respected, and empowered to thrive. We embrace the diversity that strengthens us and work collaboratively with grassroots leaders to inspire action, inform our neighbors, and create meaningful, lasting change.
          </p>
        </div>
      </section>

      {/* Values */}
      <section className="px-4 pb-24">
        <div className="max-w-5xl mx-auto grid gap-6 md:grid-cols-3">
          {[
            {
              title: "Community",
              desc: "Building connections that uplift everyone through shared purpose and mutual support.",
            },
            {
              title: "Empowerment",
              desc: "Providing resources and opportunities for individuals to reach their full potential.",
            },
            {
              title: "Change",
              desc: "Working with grassroots leaders to create meaningful, lasting impact in our neighborhoods.",
            },
          ].map((item, i) => (
            <div
              key={item.title}
              className="rounded-xl border border-primary/10 bg-card p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
              style={{ animationDelay: `${i * 0.15}s` }}
            >
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary font-bold text-lg">
                {["🤝", "✨", "🌱"][i]}
              </div>
              <h2 className="text-xl font-bold text-foreground mb-2">{item.title}</h2>
              <p className="text-text-secondary leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
