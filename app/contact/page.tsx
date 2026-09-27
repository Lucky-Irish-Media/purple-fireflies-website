export const metadata = {
  title: "Get Involved | Purple Fireflies",
  description:
    "Seven ways to help Purple Fireflies: general volunteering, training, neighborhood outreach, tech support, fundraising, communications, and youth projects.",
};

const CONTACT_EMAIL = "info@purplefireflies.org";

const branches = [
  {
    icon: "🤝",
    name: "General Volunteer",
    blurb:
      "Show up where you are needed and pitch in. If something needs doing this week, we can probably use a hand.",
    tasks: [
      "Deliver meals, drive neighbors to appointments, and run supply runs",
      "Call or text neighbors to confirm details and see how they are doing",
      "Sort, pack, and stock pantry and supply shelves",
      "Set up, run, and tear down community events",
    ],
    fit: "you have a few free hours and don't need a title to do useful work.",
    link: "/programs/meal-delivery",
    linkLabel: "See Meal Delivery",
  },
  {
    icon: "🎓",
    name: "Training",
    blurb:
      "Help us teach the skills our programs depend on. Run a session, co-facilitate one, or build the curriculum from nothing.",
    tasks: [
      "Run or co-facilitate training sessions on de-escalation, safety, and legal rights",
      "Write and revise training materials, handouts, and slide decks",
      "Schedule trainings, manage signups, and handle logistics",
      "Get trained yourself first, then teach the next group",
    ],
    fit: "you know a topic well enough to explain it twice to different people.",
    link: "/programs/legal-observers",
    linkLabel: "See Legal Observers",
  },
  {
    icon: "📣",
    name: "Neighborhood Outreach",
    blurb:
      "Most people find us because a neighbor told them. You are the reason the next block hears about us.",
    tasks: [
      "Talk with neighbors at events, churches, schools, clinics, and local businesses",
      "Hand out flyers and program information in high-traffic places",
      "Build relationships with community organizations that refer people to us",
      "Bring us leads, feedback, and the questions your neighbors are actually asking",
    ],
    fit: "you know the neighborhood, or you want to, and you are not shy about talking to strangers.",
    link: "/programs/springfield-neighbors",
    linkLabel: "See Springfield Neighbors",
  },
  {
    icon: "💻",
    name: "Tech Support",
    blurb:
      "Keep the tools we rely on running. This site, our signups and databases, our email, and the pile of hardware in between.",
    tasks: [
      "Fix bugs and build small features on this website",
      "Keep laptops, phones, printers, and routers alive",
      "Help people with accounts, email, and basic digital security",
      "Set up the tools that make everyone else's job easier",
    ],
    fit: "you are comfortable with tech and would rather fix it than wait for somebody else.",
  },
  {
    icon: "💛",
    name: "Financial / Resources",
    blurb:
      "Fundraising and money management. Every dollar we move has paperwork behind it, and every grant we chase has a deadline.",
    tasks: [
      "Run fundraising campaigns, drives, and donation drives",
      "Track expenses, budgets, and reimbursements so the books are honest",
      "Prepare grant applications and funder reports",
      "Manage donor records, acknowledgments, and receipts",
    ],
    fit: "you are organized, straight with numbers, and comfortable asking people for money.",
    link: "/donate",
    linkLabel: "See where donations go",
  },
  {
    icon: "📱",
    name: "Communication",
    blurb:
      "Getting the word out. Flyers, social posts, and newsletters, done well enough that people actually read them.",
    tasks: [
      "Design and print flyers, posters, and signage",
      "Draft, schedule, and publish social media posts",
      "Write newsletter and program announcements",
      "Keep our public messaging clear, consistent, and on-brand",
    ],
    fit: "you like writing, design, or being the person who tells everyone what is happening.",
  },
  {
    icon: "🌱",
    name: "Projects / Youth",
    blurb:
      "Big ideas and the next generation. Start new community projects from scratch, and mentor young people who want to do the same.",
    tasks: [
      "Design and run new community projects from idea to done",
      "Mentor, supervise, and support youth volunteers",
      "Plan youth events, workshops, and skill-building activities",
      "Keep projects on track: scope it, staff it, finish it",
    ],
    fit: "you want to build something, not just staff something that already exists.",
    link: "/events",
    linkLabel: "See what's already running",
    wide: true,
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

function branchMailto(name: string): string {
  const subject = encodeURIComponent(`Get Involved - ${name}`);
  const body = encodeURIComponent(
    `Hi Purple Fireflies,\n\nI'd like to help with ${name}.\n\nA little about me and what I have to offer:\n\n\nThanks!`
  );
  return `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
}

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
            <p className="text-lg leading-8" style={{ color: "rgba(255,255,255,0.75)", maxWidth: 520, margin: "0 auto" }}>
              Seven ways to lend a hand. Read through them, pick what sounds like you, and tell us
              you are interested. Most of this can be learned on the job.
            </p>
          </div>
        </div>
      </section>

      {/* Ways to help */}
      <section className="px-4 py-16 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-foreground mb-3">Ways to Help</h2>
          <p className="text-lg text-text-secondary leading-relaxed mb-10" style={{ maxWidth: 640 }}>
            Every branch below is real work we are actively doing, not a vague interest area. Read
            the one that pulls at you, or read all of them.
          </p>

          <div className="grid gap-6 sm:grid-cols-2">
            {branches.map((b) => (
              <div
                key={b.name}
                className={`flex flex-col p-6 rounded-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-md ${
                  b.wide ? "sm:col-span-2" : ""
                }`}
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
                  {b.icon}
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">{b.name}</h3>
                <p className="text-sm text-text-secondary leading-relaxed">{b.blurb}</p>

                <ul className={`mt-4 grid gap-2.5 ${b.wide ? "sm:grid-cols-2 sm:gap-x-8" : ""}`}>
                  {b.tasks.map((t) => (
                    <li key={t} className="flex gap-2.5 text-sm text-text-secondary leading-relaxed">
                      <span
                        aria-hidden="true"
                        className="mt-2 h-1 w-1 shrink-0 rounded-full"
                        style={{ background: "rgba(124,58,237,0.5)" }}
                      />
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>

                <p
                  className="mt-4 rounded-lg px-3 py-2.5 text-sm leading-relaxed text-foreground"
                  style={{ background: "rgba(124,58,237,0.06)" }}
                >
                  <span className="font-semibold">Good fit if</span> {b.fit}
                </p>

                <div className="mt-auto pt-5 flex flex-wrap items-center gap-x-5 gap-y-2">
                  <a
                    href={branchMailto(b.name)}
                    className="text-sm font-semibold transition-colors"
                    style={{ color: "#7C3AED" }}
                  >
                    Email us about this →
                  </a>
                  {b.link && (
                    <a href={b.link} className="text-sm font-medium text-text-secondary transition-colors hover:text-primary">
                      {b.linkLabel} →
                    </a>
                  )}
                </div>
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

      {/* Contact cards */}
      <section className="px-4 py-16 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-foreground mb-3">Get in Touch</h2>
          <p className="text-lg text-text-secondary leading-relaxed mb-10" style={{ maxWidth: 640 }}>
            Whichever way you reach us, mention the branch or branches you are interested in. It
            gets you matched faster.
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
