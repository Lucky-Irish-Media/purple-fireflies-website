import Link from "next/link";

export const metadata = {
  title: "Legal Observers Program | Purple Fireflies",
  description: "Trained volunteers who document government conduct at protests and support First Amendment activity.",
};

const cards = [
  {
    icon: "👁️",
    title: "Become a Legal Observer",
    desc: "Sign up to become a trained Legal Observer. No law degree required — just a commitment to protecting civil liberties.",
    href: "/programs/legal-observers/signup",
    cta: "Sign up to observe",
  },
  {
    icon: "📋",
    title: "Request Observer Coverage",
    desc: "Organizing a protest or action? Request Legal Observer coverage for your event.",
    href: "/programs/legal-observers/request",
    cta: "Request coverage",
  },
];

export default function LegalObserversPage() {
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
              Legal Observers
            </h1>
            <p className="text-lg leading-8 mb-10" style={{ color: "rgba(255,255,255,0.75)", maxWidth: 560, margin: "0 auto 2.5rem" }}>
              Trained volunteers who serve as the eyes and ears of the legal team at protests and actions — monitoring, observing, and documenting government conduct.
            </p>
          </div>
        </div>
      </section>

      {/* Body content */}
      <section className="px-4 py-16 bg-white">
        <div className="max-w-5xl mx-auto">

          {/* What Are Legal Observers? */}
          <h2 className="text-2xl font-bold text-foreground mb-3">What Are Legal Observers?</h2>
          <div className="space-y-5 text-lg text-text-secondary leading-relaxed mb-12">
            <p>
              Legal Observers are trained volunteers who attend protests, demonstrations, and direct actions
              to document what happens. They are part of a larger legal support infrastructure that includes
              arrest hotlines, bail funds, legal defense funds, and attorney networks.
            </p>
            <p>
              Through training provided by the National Lawyers Guild, Legal Observers learn to objectively
              observe and record events — creating a factual record that can be used to protect the rights
              of protesters and hold authorities accountable.
            </p>
          </div>

          {/* What We Do */}
          <h2 className="text-2xl font-bold text-foreground mb-3">What We Do</h2>
          <div className="space-y-4 text-lg text-text-secondary leading-relaxed mb-12">
            <p>
              At actions and protests, Legal Observers:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Monitor and document law enforcement behavior and interactions with protesters</li>
              <li>Record badge numbers, unit identifiers, and other identifying information</li>
              <li>Note dates, times, and sequences of events as they unfold</li>
              <li>Provide arrest support by documenting arrests and connecting arrestees with attorneys</li>
              <li>Connect activists to legal resources, including the National Lawyers Guild&apos;s legal network</li>
              <li>Deter unconstitutional behavior through visible, documented observation</li>
            </ul>
          </div>

          {/* Who Can Become One? */}
          <h2 className="text-2xl font-bold text-foreground mb-3">Who Can Become One?</h2>
          <div className="space-y-5 text-lg text-text-secondary leading-relaxed mb-12">
            <p>
              Anyone can become a Legal Observer. No law degree or legal background is required.
              We welcome organizers, activists, community members, students, and anyone who
              cares about protecting civil liberties and supporting First Amendment activity.
            </p>
            <p>
              What matters most is a willingness to remain objective, stay calm under pressure,
              and commit to the training process. Legal Observers do not participate in protests
              — they observe and document.
            </p>
          </div>

          {/* Know Your Rights */}
          <h2 className="text-2xl font-bold text-foreground mb-3">Know Your Rights</h2>
          <div className="space-y-5 text-lg text-text-secondary leading-relaxed mb-12">
            <p>
              If you are attending a protest or action, here are your key rights:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong className="text-foreground">Right to protest:</strong> You have a constitutional right to peacefully assemble and express your views in public spaces.</li>
              <li><strong className="text-foreground">Right to remain silent:</strong> You are not required to answer questions from law enforcement about your identity, affiliations, or activities (in most states).</li>
              <li><strong className="text-foreground">Right to record:</strong> You have the right to record police officers performing their duties in public, as long as you do not interfere with their actions.</li>
              <li><strong className="text-foreground">What to do if approached:</strong> Stay calm, keep your hands visible, state that you are exercising your right to remain silent, and do not consent to searches.</li>
            </ul>
            <p>
              Legal Observers are there to document — they cannot provide legal advice, but they can
              connect you with attorneys and legal resources if you are arrested or need assistance.
            </p>
          </div>

          {/* Resources & Links */}
          <h2 className="text-2xl font-bold text-foreground mb-3">Resources &amp; Links</h2>
          <div className="space-y-4 text-lg text-text-secondary leading-relaxed mb-12">
            <ul className="list-disc pl-6 space-y-3">
              <li>
                <a href="https://nlg.org/mass-defense" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                  NLG Mass Defense Program
                </a>
                <span className="text-text-secondary"> — Training and resources for Legal Observers and legal support at protests.</span>
              </li>
              <li>
                <a href="https://nlg.org/kyr" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                  NLG Know Your Rights Materials
                </a>
                <span className="text-text-secondary"> — Comprehensive guides on your rights during protests and encounters with law enforcement.</span>
              </li>
              <li>
                <a href="https://www.communitylib.org/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                  National Bail Fund Network
                </a>
                <span className="text-text-secondary"> — Directory of local bail funds that can help if you or someone you know is arrested.</span>
              </li>
              <li>
                <a href="https://nlg.org/legal-observer" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                  NLG Legal Observer Program
                </a>
                <span className="text-text-secondary"> — Information about the national Legal Observer training program.</span>
              </li>
            </ul>
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
