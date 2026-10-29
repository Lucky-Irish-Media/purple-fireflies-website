import NewsletterSubscribeForm from "@/components/NewsletterSubscribeForm";

export const metadata = {
  title: "Get Involved | Purple Fireflies",
  description:
    "Volunteer with Purple Fireflies: communication, collaboration outreach, tech support, pet program, fundraising, flyers and zines, and recruitment.",
};

const CONTACT_EMAIL = "info@purplefireflies.org";
const CONTACT_PHONE = "(740) 819-4003";
const CONTACT_PHONE_TEL = "tel:+17408194003";

const interests = [
  { icon: "📣", name: "Communication, newsletter, and social media" },
  { icon: "🤝", name: "Reaching out to other organizations for collaborations" },
  { icon: "💻", name: "Tech support" },
  { icon: "🐾", name: "Pet program" },
  { icon: "💛", name: "Fundraising" },
  { icon: "📄", name: "Flyers and zines" },
  { icon: "🌱", name: "Recruitment" },
];

const steps = [
  { n: "1", title: "Send it", body: "Fill out the form below or email us. Tell us which branch or branches interest you, and roughly how much time you have to give." },
  { n: "2", title: "A person reads it", body: "A real person on the team reviews every note. We are not a form mill, and nobody here is left hanging without a reply." },
  { n: "3", title: "We follow up", body: "Someone gets in touch with a concrete next step: a training date, a shift you can claim, or just a conversation about where you fit best." },
];

export default function Contact() {
  const methods = [
    { icon: "✉️", title: "Email Us", desc: "Send us an email to learn more about getting involved.", href: `mailto:${CONTACT_EMAIL}`, cta: CONTACT_EMAIL, external: false, disabled: false },
    { icon: "📋", title: "Fill Out Our Form", desc: "Our general interest form is on its way. In the meantime, reach out by email or phone and tell us which options interest you.", href: null, cta: "Coming soon", external: false, disabled: true },
  ];

  return (
    <div className="flex flex-col flex-1 font-sans">
      <section style={{ background: "linear-gradient(160deg, #3b0764 0%, #5B21B6 45%, #7C3AED 100%)" }}>
        <div className="px-4 pt-16 pb-12 text-center">
          <div className="max-w-2xl mx-auto">
            <span className="inline-block rounded-full px-4 py-1.5 text-sm font-semibold text-white mb-5" style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.25)" }}>Join Us</span>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-white leading-tight mb-4">Get Involved</h1>
            <p className="text-lg leading-8" style={{ color: "rgba(255,255,255,0.75)", maxWidth: 560, margin: "0 auto" }}>
              Thank you for wanting to get involved! We are always in need of help in all forms.
              Please let us know what fits your interests and schedule.
            </p>
          </div>
        </div>
      </section>

      <section className="px-4 py-16 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-foreground mb-3">Ways to Help</h2>
          <p className="text-lg text-text-secondary leading-relaxed mb-4" style={{ maxWidth: 640 }}>
            You do not have to choose one. Choose all that interest you. When you fill out the form
            we will reach out and chat with you as to what roles may be the best fit. If you want to
            help with the meal program please go to the{" "}
            <a href="/programs/meal-delivery" className="font-semibold underline transition-colors" style={{ color: "#7C3AED" }}>program page</a>{" "}
            to sign-up.
          </p>
          <div className="grid gap-6 sm:grid-cols-2">
            {interests.map((item) => (
              <div key={item.name} className="flex items-center gap-4 p-6 rounded-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-md" style={{ background: "#fff", border: "1px solid rgba(124,58,237,0.12)", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-xl" style={{ background: "rgba(124,58,237,0.08)" }}>{item.icon}</div>
                <h3 className="text-lg font-bold text-foreground">{item.name}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-16 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-foreground mb-3">What Happens After You Sign Up</h2>
          <p className="text-lg text-text-secondary leading-relaxed mb-10" style={{ maxWidth: 640 }}>No black holes, no silence. Here is the whole sequence.</p>
          <div className="grid gap-6 sm:grid-cols-3">
            {steps.map((s) => (
              <div key={s.n} className="p-6 rounded-xl" style={{ background: "#fff", border: "1px solid rgba(124,58,237,0.12)", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
                <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold text-white" style={{ background: "#7C3AED" }}>{s.n}</div>
                <h3 className="text-lg font-bold text-foreground mb-2">{s.title}</h3>
                <p className="text-sm text-text-secondary leading-relaxed">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-12">
        <div className="max-w-5xl mx-auto">
          <div className="rounded-xl p-6 sm:p-8 text-center" style={{ background: "rgba(124,58,237,0.06)", border: "1px solid rgba(124,58,237,0.12)" }}>
            <h2 className="text-2xl font-bold text-foreground mb-4">Contact Us Directly</h2>
            <p className="text-base text-text-secondary leading-relaxed mb-6" style={{ maxWidth: 640, margin: "0 auto" }}>Reach out by phone or email and we will get back to you.</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <a href={CONTACT_PHONE_TEL} className="text-2xl font-bold transition-colors" style={{ color: "#7C3AED" }}>{CONTACT_PHONE}</a>
              <a href={`mailto:${CONTACT_EMAIL}`} className="text-2xl font-bold transition-colors" style={{ color: "#7C3AED" }}>{CONTACT_EMAIL}</a>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-16 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-foreground mb-3">Get in Touch</h2>
          <p className="text-lg text-text-secondary leading-relaxed mb-10" style={{ maxWidth: 640 }}>Whichever way you reach us, mention the interests you are open to. It gets you matched faster.</p>
          <div className="grid gap-6 sm:grid-cols-2">
            {methods.map((m) => {
              const card = (
                <div className="flex flex-col p-6 rounded-xl transition-all duration-300" style={{ background: "#fff", border: "1px solid rgba(124,58,237,0.12)", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", opacity: m.disabled ? 0.6 : 1 }}>
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl text-xl" style={{ background: "rgba(124,58,237,0.08)" }}>{m.icon}</div>
                  <h3 className="text-lg font-bold text-foreground mb-2">{m.title}</h3>
                  <p className="text-sm text-text-secondary leading-relaxed flex-1">{m.desc}</p>
                  <span className="mt-5 inline-flex items-center gap-1 text-sm font-semibold" style={{ color: m.disabled ? "rgba(124,58,237,0.5)" : "#7C3AED" }}>{m.cta} {m.disabled ? "" : "→"}</span>
                </div>
              );
              if (m.disabled || !m.href) return <div key={m.title}>{card}</div>;
              return (
                <a key={m.title} href={m.href} target={m.external ? "_blank" : undefined} rel={m.external ? "noopener noreferrer" : undefined} className="block">{card}</a>
              );
            })}
          </div>
        </div>
      </section>

      <section className="px-4 py-12" style={{ background: "linear-gradient(160deg, #3b0764 0%, #5B21B6 45%, #7C3AED 100%)" }}>
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Subscribe to our newsletter</h2>
          <NewsletterSubscribeForm />
        </div>
      </section>
    </div>
  );
}