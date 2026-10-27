import Link from "next/link";
import GivebutterWidget from "@/components/GivebutterWidget";
import { getAnimalExpenses, getPublishedAnimals } from "@/app/lib/db";
import {
  getCommunityPetsConfig,
  getTaxStatusCopy,
} from "@/app/lib/community-pets-config";
import { formatCents } from "@/app/lib/currency";
import type { AnimalWithPhotos } from "@/app/lib/definitions";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Sponsor a Pet Program | Purple Fireflies",
  description:
    "The Sponsor a Pet Program helps Athens County neighbors keep their pets. Money is paid as vouchers and through agreements with vets in the area, and food is purchased by Purple Fireflies and distributed to the pets that are sponsored.",
};

const steps = [
  {
    title: "A neighbor applies",
    body: "A pet owner, a friend, or a caseworker tells us about a pet whose household cannot cover a vet bill, medication, food, or supplies. We ask for the basics: who the pet lives with, what the need is, and what it costs.",
  },
  {
    title: "The board approves a vendor payment",
    body: "The board reviews the request and approves the amount. Money never goes to the owner in cash. Money is paid as vouchers and through agreements with vets in the area, and food is purchased by Purple Fireflies and distributed to the pets that are sponsored. The receipt is recorded as an expense on the pet's page.",
  },
  {
    title: "Neighbors sponsor the pet",
    body: "Each pet gets a profile with photos, a needs list, and real costs. Neighbors give any amount, one time or monthly, and every gift is tied to that pet while it is in the program.",
  },
];

const eligibility = [
  "The pet lives with a neighbor in our Athens County service area.",
  "The need is a real cost: a vet bill, medication, food, or supplies the household cannot cover.",
  "The cost would otherwise mean the pet goes without care or leaves the home.",
  "The owner signs a photo and story consent form before anything is published.",
  "The vendor invoices us directly. We do not reimburse owners in cash.",
  "Neighbors caring for colony cats can receive food and outdoor shelters through the general pet fund.",
];

// The tax answer is deliberately absent from this list. It is built from
// NONPROFIT_STATUS inside the page so neither version is hardcoded here.
const faqs = [
  {
    q: "What happens when a pet's needs are met?",
    a: "Designations are honored while the pet is in the program. If the pet's needs are fully met, or the pet leaves the program, the remaining gifts stay in the Sponsor a Pet Program and go to other neighbors' pets. We say the same thing on every acknowledgment.",
  },
  {
    q: "Can't choose just one pet to sponsor?",
    a: "Donate to the general pet fund. The money goes toward food for all the pets in the program, and helps pay for outdoor shelters for those caring for colony cats.",
  },
  {
    q: "How do I nominate a pet?",
    a: "Get in touch and tell us about the pet and the cost. A vet clinic or supplier can reach out too, with the owner's permission. We follow up with the owner directly before anything is published.",
  },
  {
    q: "Is this adoption?",
    a: "No. This is not a shelter and the pets are not up for adoption. The point is to keep a pet in the home it already has by covering a cost the household cannot carry.",
  },
  {
    q: "Will my name be published?",
    a: "No. We never publish donor names, email addresses, or amounts. The pages show totals only, and owners are never named or described in a way that identifies where they live.",
  },
];

function PetCard({ animal }: { animal: AnimalWithPhotos }) {
  const cover = animal.photos[0];
  const hasGoal = animal.goal_cents > 0;
  const percent = hasGoal
    ? Math.min(
        100,
        Math.max(
          0,
          Math.round((animal.gb_raised_cents / animal.goal_cents) * 100),
        ),
      )
    : 0;
  const subtitle =
    animal.tagline?.trim() ||
    [animal.breed, animal.species].filter(Boolean).join(" / ");

  return (
    <Link
      href={`/programs/community-pets/${animal.slug}`}
      className="group flex flex-col overflow-hidden rounded-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
      style={{
        background: "#fff",
        border: "1px solid rgba(124,58,237,0.12)",
        boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
      }}
    >
      <div
        className="flex aspect-[4/3] w-full items-center justify-center overflow-hidden"
        style={{ background: "rgba(124,58,237,0.08)" }}
      >
        {cover ? (
          <img
            src={`/api/media/${cover.photo_key}`}
            alt={cover.alt?.trim() || `${animal.name}, a ${animal.species.toLowerCase()} in the Sponsor a Pet Program`}
            width={640}
            height={480}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <span
            className="text-5xl font-bold"
            style={{ color: "#7C3AED" }}
            aria-hidden="true"
          >
            {animal.name.charAt(0).toUpperCase()}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-lg font-bold text-foreground">{animal.name}</h3>
        <p className="mt-1 text-sm leading-relaxed text-text-secondary">
          {subtitle}
        </p>

        <div className="mt-4">
          {hasGoal ? (
            <div
              className="h-2 w-full overflow-hidden rounded-full"
              style={{ background: "rgba(124,58,237,0.15)" }}
            >
              <div
                className="h-full rounded-full"
                style={{ width: `${percent}%`, background: "#7C3AED" }}
              />
            </div>
          ) : null}
          <p className="mt-2 text-sm text-text-secondary">
            <span className="font-semibold text-foreground">
              {formatCents(animal.gb_raised_cents)}
            </span>{" "}
            {hasGoal ? `of ${formatCents(animal.goal_cents)} goal` : "raised, any amount helps"}
          </p>
        </div>

        <span
          className="mt-4 inline-flex items-center gap-1 text-sm font-semibold"
          style={{ color: "#7C3AED" }}
        >
          Meet {animal.name} →
        </span>
      </div>
    </Link>
  );
}

export default async function CommunityPetsPage() {
  const [animals, config] = await Promise.all([
    getPublishedAnimals(),
    getCommunityPetsConfig(),
  ]);

  const expenseLists = await Promise.all(
    animals.map((animal) => getAnimalExpenses(animal.id)),
  );
  const totalSpentCents = expenseLists.reduce(
    (total, expenses) =>
      total + expenses.reduce((sum, expense) => sum + expense.amount_cents, 0),
    0,
  );
  const totalRaisedCents = animals.reduce(
    (total, animal) => total + animal.gb_raised_cents,
    0,
  );

  const taxCopy = getTaxStatusCopy(config.nonprofitStatus);
  const faqsWithTax = [
    { q: "Is my gift tax-deductible?", a: taxCopy },
    ...faqs,
  ];
  const hasGeneralFund =
    config.donationsEnabled &&
    Boolean(config.generalFundCampaignCode?.trim());

  return (
    <div className="flex flex-1 flex-col font-sans">
      {/* Hero */}
      <section
        style={{ background: "linear-gradient(160deg, #3b0764 0%, #5B21B6 45%, #7C3AED 100%)" }}
      >
        <div className="px-4 pt-16 pb-12 text-center">
          <div className="mx-auto max-w-2xl">
            <span
              className="mb-5 inline-block rounded-full px-4 py-1.5 text-sm font-semibold text-white"
              style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.25)" }}
            >
              Sponsor a Pet Program
            </span>
            <h1 className="mb-4 text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl">
              Sponsor a Pet Program
            </h1>
            <p
              className="text-lg leading-8"
              style={{ color: "rgba(255,255,255,0.75)", maxWidth: 560, margin: "0 auto 2rem" }}
            >
              Many neighbors are caring for pets and colony cats that would
              otherwise have no shelter or food. When household budgets run
              short, the Sponsor a Pet Program steps in so a pet never loses its
              home over a vet bill. Money is paid as vouchers and through
              agreements with vets in the area, and food is purchased by Purple
              Fireflies and distributed to the pets that are sponsored.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link
                href="#pets"
                className="rounded-full px-7 py-3 text-sm font-bold text-white shadow-lg transition-all duration-200 hover:opacity-90"
                style={{ background: "#F59E0B" }}
              >
                Meet the pets
              </Link>
              {config.donationsEnabled ? (
                <>
                  {hasGeneralFund ? (
                    <Link
                      href="#general-pet-fund"
                      className="rounded-full px-7 py-3 text-sm font-semibold text-white transition-all duration-200 hover:bg-white/20"
                      style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.3)" }}
                    >
                      Donate to the general pet fund
                    </Link>
                  ) : null}
                </>
              ) : (
                <Link
                  href="/contact"
                  className="rounded-full px-7 py-3 text-sm font-semibold text-white transition-all duration-200 hover:bg-white/20"
                  style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.3)" }}
                >
                  Ask about sponsoring
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* About */}
      <section className="bg-white px-4 py-16">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-3 text-2xl font-bold text-foreground">
            What the fund is
          </h2>
          <div className="mb-8 space-y-5 text-lg leading-relaxed text-text-secondary">
            <p>
              The Sponsor a Pet Program is a neighbors helping neighbors program.
              Funds for each pet go toward vet services - spay or neuter,
              shots, food, and flea and tick collars - plus other care a
              household cannot cover. Money is paid as vouchers and through
              agreements with vets in the area, and food is purchased by Purple
              Fireflies and distributed to the pets that are sponsored. It is not a
              shelter, a rescue, or adoption.
            </p>
            <p>
              Purple Fireflies runs the fund as a fund, not as a crowdfunding
              page for one person. There are published eligibility rules, a
              board that approves each award, and an expense record for every
              dollar. Owners are never paid in cash.
            </p>
            <p>
              You can sponsor a specific pet, or donate to the general pet
              fund to help feed all pets in the program and support outdoor
              shelters for those caring for colony cats.
            </p>
          </div>

          <div
            className="mb-8 rounded-xl p-5"
            style={{ background: "rgba(124,58,237,0.06)", border: "1px solid rgba(124,58,237,0.12)" }}
          >
            <p className="font-semibold text-foreground">
              Money is paid as vouchers and through agreements with vets
            </p>
            <p className="mt-2 text-base leading-relaxed text-text-secondary">
              Money is paid as vouchers and through agreements with vets in the
              area, and food is purchased by Purple Fireflies and distributed to
              the pets that are sponsored. We do not pay the pet owner in cash.
              That keeps the money tied to the actual cost, gives us a receipt for
              every expense, and means the totals on this page are backed by
              records rather than estimates.
            </p>
          </div>

          <h2 className="mb-3 text-2xl font-bold text-foreground">
            Who qualifies
          </h2>
          <p className="mb-6 text-lg leading-relaxed text-text-secondary">
            Every request is reviewed on its own facts, and the list below is the
            whole test:
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {eligibility.map((item) => (
              <div
                key={item}
                className="flex items-start gap-3 rounded-lg p-3"
                style={{ background: "rgba(124,58,237,0.06)", border: "1px solid rgba(124,58,237,0.1)" }}
              >
                <span
                  className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs text-white"
                  style={{ background: "#7C3AED" }}
                >
                  ✓
                </span>
                <span className="text-base font-medium text-foreground">
                  {item}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="px-4 py-16">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-3 text-2xl font-bold text-foreground">
            How it works
          </h2>
          <p className="mb-8 max-w-2xl text-lg leading-relaxed text-text-secondary">
            Three steps, in this order. The vendor payment comes before any
            fundraising, so a pet is never waiting on a campaign to start.
          </p>
          <div className="grid gap-6 sm:grid-cols-3">
            {steps.map((step, index) => (
              <div
                key={step.title}
                className="flex flex-col rounded-xl p-6"
                style={{
                  background: "#fff",
                  border: "1px solid rgba(124,58,237,0.12)",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                }}
              >
                <span
                  className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl text-base font-bold"
                  style={{ background: "rgba(124,58,237,0.08)", color: "#7C3AED" }}
                >
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="mb-2 text-lg font-bold text-foreground">
                  {step.title}
                </h3>
                <p className="text-sm leading-relaxed text-text-secondary">
                  {step.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Transparency */}
      <section className="bg-white px-4 py-16">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-3 text-2xl font-bold text-foreground">
            Where the money goes
          </h2>
          <p className="mb-8 max-w-2xl text-lg leading-relaxed text-text-secondary">
            These totals come from the fund&apos;s own records and update as
            expenses are recorded. Donor names are never published, and neither
            are owners.
          </p>
          <div className="grid gap-6 sm:grid-cols-3">
            <div
              className="rounded-xl p-6 text-center"
              style={{ background: "rgba(124,58,237,0.06)", border: "1px solid rgba(124,58,237,0.12)" }}
            >
              <div className="text-3xl font-bold" style={{ color: "#7C3AED" }}>
                {formatCents(totalRaisedCents)}
              </div>
              <div className="mt-1 text-sm text-text-secondary">
                Raised for pets in the fund
              </div>
            </div>
            <div
              className="rounded-xl p-6 text-center"
              style={{ background: "rgba(124,58,237,0.06)", border: "1px solid rgba(124,58,237,0.12)" }}
            >
              <div className="text-3xl font-bold" style={{ color: "#7C3AED" }}>
                {formatCents(totalSpentCents)}
              </div>
              <div className="mt-1 text-sm text-text-secondary">
                Paid to clinics and suppliers
              </div>
            </div>
            <div
              className="rounded-xl p-6 text-center"
              style={{ background: "rgba(124,58,237,0.06)", border: "1px solid rgba(124,58,237,0.12)" }}
            >
              <div className="text-3xl font-bold" style={{ color: "#7C3AED" }}>
                {animals.length}
              </div>
              <div className="mt-1 text-sm text-text-secondary">
                Pets helped so far
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pets */}
      <section id="pets" className="scroll-mt-20 px-4 py-16">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-3 text-2xl font-bold text-foreground">
            Pets in the fund
          </h2>
          <p className="mb-8 max-w-2xl text-lg leading-relaxed text-text-secondary">
            Each profile lists what the pet actually needs, what it costs, and
            how much has been raised and spent.
          </p>

          {animals.length === 0 ? (
            <div
              className="rounded-xl p-8 text-center"
              style={{ background: "rgba(124,58,237,0.06)", border: "1px solid rgba(124,58,237,0.12)" }}
            >
              <p className="text-lg font-bold text-foreground">
                No pets are published yet
              </p>
              <p className="mx-auto mt-2 max-w-xl text-base leading-relaxed text-text-secondary">
                We are collecting signed owner consent forms before the first
                profiles go up, and we will publish a pet only once the consent
                form, the needs list, and the campaign are all in place. Check
                back soon, or get in touch to nominate a pet or be notified when
                sponsorship opens.
              </p>
              <Link
                href="/contact"
                className="mt-5 inline-flex items-center gap-1 text-sm font-semibold"
                style={{ color: "#7C3AED" }}
              >
                Contact us →
              </Link>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {animals.map((animal) => (
                <PetCard key={animal.id} animal={animal} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* General pet fund, the option for donors who can't pick just one */} 
      {hasGeneralFund ? (
        <section
          id="general-pet-fund"
          className="scroll-mt-20 px-4 py-16"
          style={{ background: "linear-gradient(160deg, #3b0764 0%, #5B21B6 45%, #7C3AED 100%)" }}
        >
          <div className="mx-auto max-w-5xl">
            <div className="grid gap-8 lg:grid-cols-2">
              <div className="text-white">
                <h2 className="mb-3 text-2xl font-bold">
                  Can&apos;t choose just one?
                </h2>
                <p className="text-lg leading-relaxed" style={{ color: "rgba(255,255,255,0.75)" }}>
                  Donate to the general pet fund. Your gift goes toward food for
                  all the pets in the program, and helps pay for outdoor shelters
                  for those caring for colony cats.
                </p>
                <p className="mt-4 text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.6)" }}>
                  {taxCopy}
                </p>
                <p className="mt-4 text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.75)" }}>
                  Prefer to give through our main donation page?{" "}
                  <Link href="/donate" className="font-semibold underline">
                    Visit the Donate page
                  </Link>
                  .
                </p>
              </div>
              <div className="rounded-xl bg-white p-6">
                <GivebutterWidget
                  campaignCode={config.generalFundCampaignCode}
                  accountId={config.givebutterAccountId}
                  campaignUrl={config.generalFundCampaignUrl}
                />
              </div>
            </div>
          </div>
        </section>
      ) : null}

      {/* Surplus policy, its own block rather than an FAQ footnote */}
      <section className="bg-white px-4 py-16">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-3 text-2xl font-bold text-foreground">
            If a pet&apos;s needs are met
          </h2>
          <div
            className="rounded-xl p-6"
            style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.25)" }}
          >
            <p className="font-semibold text-foreground">
              Leftover gifts stay in the fund, for other pets
            </p>
            <p className="mt-2 text-base leading-relaxed text-text-secondary">
              A gift designated for a pet is honored while that pet is in the
              program. If the pet&apos;s needs are fully met, or the pet leaves
              the program, any remaining money stays in the Sponsor a Pet Program
              and supports other neighbors&apos; pets. We do not refund the
              difference to the donor and we do not pay it to the owner.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="px-4 py-16">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-3 text-2xl font-bold text-foreground">
            Questions people ask
          </h2>
          <p className="mb-10 max-w-2xl text-lg leading-relaxed text-text-secondary">
            If yours is not here, get in touch and we will answer it directly.
          </p>
          <div className="grid gap-x-10 gap-y-8 sm:grid-cols-2">
            {faqsWithTax.map((faq) => (
              <div key={faq.q}>
                <h3 className="mb-2 text-base font-bold text-foreground">
                  {faq.q}
                </h3>
                <p className="text-sm leading-relaxed text-text-secondary">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="px-4 pb-20">
        <div className="mx-auto max-w-5xl">
          <div
            className="rounded-xl p-8 text-center"
            style={{ background: "#fff", border: "1px solid rgba(124,58,237,0.12)", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}
          >
            <h2 className="text-xl font-bold text-foreground">
              Know a pet who needs a hand?
            </h2>
            <p className="mx-auto mt-2 max-w-xl text-base leading-relaxed text-text-secondary">
              Tell us about the pet and the cost. We will follow up with the
              owner, and nothing is published without their written consent.
            </p>
            <Link
              href="/contact"
              className="mt-5 inline-flex items-center gap-1 text-sm font-semibold"
              style={{ color: "#7C3AED" }}
            >
              Nominate a pet →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
