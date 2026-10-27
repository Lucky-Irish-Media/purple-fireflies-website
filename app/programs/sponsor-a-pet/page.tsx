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
    "The Sponsor a Pet Program helps Athens County neighbors keep their pets. Money is paid through agreements with vets in the area, and food is purchased by Purple Fireflies and distributed to the pets that are sponsored.",

};

const eligibility = [
  "Live in Athens County",
  "The need fills vet bills, food, or medical supplies that the household is unable to cover",
  "Owner/Carer agrees to having someone come out to photograph pet/animal and fills out their questionnaire about their animal, as well as liability waiver.",
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
      href={`/programs/sponsor-a-pet/${animal.slug}`}
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
              home over a vet bill. Money is paid through
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
              The funds for each pet will go towards vet services
              (spay/neuter/shots, food, and/or flea &amp; tick collar). You pick a
              pet to sponsor with many options for how that looks for you. You set
              the amount, and also if this is a one time donation or a monthly
              amount. The money will go directly to those items needed; we would
              pay the vet and purchase the food for the sponsored pet.
            </p>
            <p>
              Can&apos;t choose just one to sponsor? Donate to the general pet
              fund and it will go towards all the pets in the programs. Also, it
              will help pay for outdoor shelters for those caring for colony
              cats.
            </p>
          </div>

          <h2 className="mb-3 text-2xl font-bold text-foreground">
            Who qualifies
          </h2>
          <p className="mb-6 text-lg leading-relaxed text-text-secondary">
            To qualify, a pet must meet the following:
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
          <p className="mt-6 text-base italic leading-relaxed text-text-secondary">
            *Please be aware we will sponsor your pet for up to 12 months, with a
            review of needs every 3 months.
          </p>
        </div>
      </section>

      {/* How it works */}
      <section className="px-4 py-16">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-3 text-2xl font-bold text-foreground">
            How this works
          </h2>
          <div className="mb-8 space-y-5 text-lg leading-relaxed text-text-secondary">
            <p>
              As funds come in for each pet the money will go towards that
              animal&apos;s needs. Many owners are looking for assistance
              getting their pets spayed/neutered, basic shots, and food. All
              funds will go directly to the vet for services, and we will
              purchase pet food. Any excess money for one pet will be put in
              the general pet fund that will go towards the pets in the
              program, and extra will go towards building outdoor shelters for
              community pets.
            </p>
            <p>
              Our goal is to collaborate with local vets or other organizations
              who may be able to assist us with this program. If you are a vet or
              an organization that would like to collaborate with us, please
              reach out.
            </p>
          </div>
        </div>
      </section>

      {/* Have a pet in need */}
      <section className="px-4 pb-20">
        <div className="mx-auto max-w-5xl">
          <div
            className="rounded-xl p-8 text-center"
            style={{ background: "#fff", border: "1px solid rgba(124,58,237,0.12)", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}
          >
            <h2 className="text-xl font-bold text-foreground">
              Have a pet in need?
            </h2>
            <p className="mx-auto mt-2 max-w-xl text-base leading-relaxed text-text-secondary">
              Tell us about your pet and the cost. We will follow up with the
              you, and nothing is published without your written consent.
            </p>
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
            Pets to Sponsor
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



    </div>
  );
}
