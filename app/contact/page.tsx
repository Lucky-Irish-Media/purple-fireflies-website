export const metadata = {
  title: "Get Involved | Purple Fireflies",
  description:
    "Volunteer with Purple Fireflies: communication, collaboration outreach, tech support, pet program, fundraising, flyers and zines, and recruitment.",
};

const CONTACT_EMAIL = "info@purplefireflies.org";

const interests = [
  {
    icon: "📣",
    name: "Communication, newsletter, and social media",
    blurb: "Getting the word out. Flyers, social posts, and newsletters, done well enough that people actually read them.",
  },
  {
    icon: "🤝",
    name: "Reaching out to other organizations for collaborations",
    blurb: "Build relationships with vets, animal organizations, and other food organizations that refer people to us or partner on projects.",
  },
  {
    icon: "💻",
    name: "Tech support",
    blurb: "Website updates and keeping the tools we rely on running.",
  },
  {
    icon: "🐾",
    name: "Pet program",
    blurb: "Taking photos, purchasing items, and possibly helping with rides to vets.",
  },
  {
    icon: "💛",
    name: "Fundraising",
    blurb: "Events or getting our word out. Running campaigns, drives, and donation drives.",
  },
  {
    icon: "📄",
    name: "Flyers and zines",
    blurb: "Posting around the community. Design, print, and distribute flyers and zines.",
  },
  {
    icon: "🌱",
    name: "Recruitment",
    blurb: "We need people to help, and as we grow we need more. Help us find and welcome new volunteers.",
  },
];

const steps = [
  {
    n: "1",
    title: "Send it",
    body: "Fill out the form below or email us. Tell us which branch or branches interest you, and roughly how much time you have to give.",
  },
  {
    n: "2",
    title: "A person reads it",
    body: "A real person on the team reviews every note. We are not a form mill, and nobody here is left hanging without a reply.",
  },
  {
    n: "3",
    title: "We follow up",
    body: "Someone gets in touch with a concrete next step: a training date, a shift you can claim, or just a conversation about where you fit best.",
  },
];

const faqs = [
  {
    q: "Do I need experience?",
    a: "No. Most of what we do can be taught in an afternoon. The few roles that do need something specific, like driving, a background check, or de-escalation training, we will tell you up front and train you for free.",
  },
  {
    q: "Can I sign up for more than one?",
    a: "Please do. Plenty of our people help in two or three places, and some of the best pairings were accidents. Tell us everything you would be open to and let us be the ones to narrow it down.",
  },
  {
    q: "How much time does this take?",
    a: "It varies by branch. Some of it is a couple of hours a month, some of it is a standing weekly shift, and some of it is project by project. Tell us what you can realistically give and we will match the work to that, not the other way around.",
  },
  {
    q: "Can I volunteer if I am under 18?",
    a: "Some of it, yes. Outreach, communication, and projects work well for teens with a parent or guardian in the loop. Mention your age when you reach out and we will find something appropriate.",
  },
  {
    q: "What if I pick the wrong branch?",
    a: "Nothing breaks. Tell us what you would rather be doing and we will move you. People land somewhere better than where they started more often than not.",
  },
];

export default function Contact() {
  const methods = [
    {
      icon: "✉️",
      title: "Email Us",
      desc: "Send us an email to learn more about getting involved.",
      href: `mailto:${CONTACT_EMAIL}`,
      cta: CONTACT_EMAIL,
      external: false,
    },
    {
      icon: "📋",
      title: "Fill Out Our Form",
      desc: "Complete our form to request involvement opportunities. List every branch you are interested in so we can match you well.",
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
            <p className="text-lg leading-8" style={{ color: "rgba(255,255,255,0.75)", maxWidth: 560, margin: "0 auto" }}>
              Thank you for wanting to get involved! We are always in need of help in all forms.
              Please let us know what fits your interests and schedule.
            </p>
          </div>
        </div>
      </section>

      {/* Ways to help */}
      <section className="px-4 py-16 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-foreground mb-3">Ways to Help</h2>
          <p className="text-lg text-text-secondary leading-relaxed mb-4" style={{ maxWidth: 640 }}>
            You do not have to choose one. Choose all that interest you. When you fill out the form
            we will reach out and chat with you as to what roles may be the best fit. If you want to
            help with the meal program please go to the program page to sign up.
          </p>
          <p className="text-sm text-text-secondary leading-relaxed mb-10" style={{ maxWidth: 640 }}>
            Every option below is real work we are actively doing. Read the ones that pull at you,
            or read all of them. When you are ready, sign up at the bottom of the page.
          </p>

          <div className="grid gap-6 sm:grid-cols-2">
            {interests.map((item) => (
              <div
                key={item.name}
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
                  {item.icon}
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">{item.name}</h3>
                <p className="text-sm text-text-secondary leading-relaxed">{item.blurb}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Not siloed */}
      <section className="px-4 py-14">
        <div className="max-w-5xl mx-auto">
          <div
            className="rounded-xl p-6 sm:p-8"
            style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.25)" }}
          >
            <h2 className="text-xl font-bold text-foreground mb-2">These are not siloed roles</h2>
            <p className="text-base text-text-secondary leading-relaxed mb-4" style={{ maxWidth: 720 }}>
              You do not have to choose one and close the rest of the door. Plenty of our people
              help in two or three places, and some of the best fits started out as a mistake. If
              two of these sound right, say so.
            </p>
            <p className="text-base font-semibold" style={{ color: "#92400E" }}>
              Tell us everything you would be open to. Narrowing it down is our job, not yours.
            </p>
          </div>
        </div>
      </section>

      {/* What happens next */}
      <section className="px-4 py-16 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-foreground mb-3">What Happens After You Sign Up</h2>
          <p className="text-lg text-text-secondary leading-relaxed mb-10" style={{ maxWidth: 640 }}>
            No black holes, no silence. Here is the whole sequence.
          </p>

          <div className="grid gap-6 sm:grid-cols-3">
            {steps.map((s) => (
              <div
                key={s.n}
                className="p-6 rounded-xl"
                style={{
                  background: "#fff",
                  border: "1px solid rgba(124,58,237,0.12)",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                }}
              >
                <div
                  className="mb-4 flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold text-white"
                  style={{ background: "#7C3AED" }}
                >
                  {s.n}
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">{s.title}</h3>
                <p className="text-sm text-text-secondary leading-relaxed">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="px-4 py-16">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-foreground mb-3">Questions People Ask</h2>
          <p className="text-lg text-text-secondary leading-relaxed mb-10" style={{ maxWidth: 640 }}>
            If yours is not here, just ask. We would rather answer a question than have you sit on
            it wondering.
          </p>

          <div className="grid gap-x-10 gap-y-8 sm:grid-cols-2">
            {faqs.map((f) => (
              <div key={f.q}>
                <h3 className="text-base font-bold text-foreground mb-2">{f.q}</h3>
                <p className="text-sm text-text-secondary leading-relaxed">{f.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact info in bigger font */}
      <section className="px-4 py-12">
        <div className="max-w-5xl mx-auto">
          <div
            className="rounded-xl p-6 sm:p-8 text-center"
            style={{ background: "rgba(124,58,237,0.06)", border: "1px solid rgba(124,58,237,0.12)" }}
          >
            <h2 className="text-2xl font-bold text-foreground mb-4">Contact Us Directly</h2>
            <p className="text-base text-text-secondary leading-relaxed mb-6" style={{ maxWidth: 640, margin: "0 auto" }}>
              Reach out by phone or email and we will get back to you.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <a
                href="tel:+17408194003"
                className="text-2xl font-bold transition-colors"
                style={{ color: "#7C3AED" }}
              >
                (740) 819-4003
              </a>
              <a
                href="mailto:info@purplefireflies.org"
                className="text-2xl font-bold transition-colors"
                style={{ color: "#7C3AED" }}
              >
                info@purplefireflies.org
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Contact cards */}
      <section className="px-4 py-16 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-foreground mb-3">Get in Touch</h2>
          <p className="text-lg text-text-secondary leading-relaxed mb-10" style={{ maxWidth: 640 }}>
            Whichever way you reach us, mention the interests you are open to. It gets you matched
            faster.
          </p>

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
                <h3 className="text-lg font-bold text-foreground mb-2">{m.title}</h3>
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
