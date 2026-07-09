export default function Contact() {
  const methods = [
    {
      icon: "✉️",
      title: "Email Us",
      desc: "Send us an email to learn more about getting involved.",
      href: "mailto:info@purplefireflies.org",
      cta: "info@purplefireflies.org",
      external: false,
    },
    {
      icon: "📋",
      title: "Fill Out Our Form",
      desc: "Complete our form to request involvement opportunities.",
      href: "https://cloud.disroot.org/apps/forms/s/BrnnRYnrxZJyd6it9HE4M399",
      cta: "Request to Get Involved",
      external: true,
    },
  ];

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
              Join Us
            </span>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-white leading-tight mb-4">
              Get Involved
            </h1>
            <p className="text-lg leading-8" style={{ color: "rgba(255,255,255,0.75)", maxWidth: 480, margin: "0 auto" }}>
              Want to get involved with Purple Fireflies? Reach out using one of the methods below.
            </p>
          </div>
        </div>
      </section>

      {/* Contact cards */}
      <section className="px-4 py-16 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="grid gap-6 sm:grid-cols-2">
            {methods.map((m) => (
              <div
                key={m.title}
                className="flex flex-col p-6 rounded-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
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
                  {m.icon}
                </div>
                <h2 className="text-lg font-bold text-foreground mb-2">{m.title}</h2>
                <p className="text-sm text-text-secondary leading-relaxed flex-1">{m.desc}</p>
                <a
                  href={m.href}
                  target={m.external ? "_blank" : undefined}
                  rel={m.external ? "noopener noreferrer" : undefined}
                  className="mt-5 inline-flex items-center gap-1 text-sm font-semibold transition-colors"
                  style={{ color: "#7C3AED" }}
                >
                  {m.cta} →
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
