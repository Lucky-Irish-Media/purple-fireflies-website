import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import AnimalProgress from "@/components/AnimalProgress";
import GivebutterWidget from "@/components/GivebutterWidget";
import { getAnimalBySlug, getAnimalExpenses } from "@/app/lib/db";
import {
  getCommunityPetsConfig,
  getTaxStatusCopy,
} from "@/app/lib/community-pets-config";
import { formatCents } from "@/app/lib/currency";
import {
  ANIMAL_STATUS_OPTIONS,
  NEED_CADENCE_OPTIONS,
  parseAnimalNeeds,
  type AnimalStatus,
  type AnimalWithPhotos,
} from "@/app/lib/definitions";

export const dynamic = "force-dynamic";

interface AnimalPageProps {
  params: Promise<{ slug: string }>;
}

function coverPhoto(animal: AnimalWithPhotos) {
  // `attachPhotos()` already orders by sort_order then id, so the first entry
  // is the cover.
  return animal.photos[0];
}

function flatten(text: string, max: number): string {
  const flat = text.replace(/\s+/g, " ").trim();
  if (flat.length <= max) return flat;
  return `${flat.slice(0, max - 3).trimEnd()}...`;
}

export async function generateMetadata({
  params,
}: AnimalPageProps): Promise<Metadata> {
  const { slug } = await params;
  const animal = await getAnimalBySlug(slug);

  // An unpublished pet must not leak a title or an image through metadata.
  if (!animal || animal.is_published !== 1) {
    return {
      title: "Pet not found | Community Pet Fund | Purple Fireflies",
      description:
        "This pet profile is not published. Browse the pets in the Community Pet Fund instead.",
    };
  }

  const cover = coverPhoto(animal);
  const description = flatten(
    animal.tagline?.trim() || animal.bio,
    160,
  );
  const title = `${animal.name} | Community Pet Fund | Purple Fireflies`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      // Omitted entirely when the pet has no photo, rather than pointing at a
      // broken or inherited image.
      ...(cover
        ? {
            images: [
              {
                url: `/api/media/${cover.photo_key}`,
                alt: cover.alt?.trim() || animal.name,
              },
            ],
          }
        : {}),
    },
    ...(cover
      ? {
          twitter: {
            card: "summary_large_image" as const,
            title,
            description,
            images: [`/api/media/${cover.photo_key}`],
          },
        }
      : {}),
  };
}

function cadenceLabel(cadence: string): string {
  const known = NEED_CADENCE_OPTIONS.find(
    (option) => option.value === cadence,
  );
  if (known) return known.label;
  // Admins can type a free cadence such as "weekly" or "as needed", so fall back
  // to the raw value instead of hiding the need.
  return cadence.replace(/_/g, " ");
}

function PetGallery({ animal }: { animal: AnimalWithPhotos }) {
  const [cover, ...rest] = animal.photos;

  if (!cover) return null;

  return (
    <div>
      <img
        src={`/api/media/${cover.photo_key}`}
        alt={
          cover.alt?.trim() ||
          `${animal.name}, a ${animal.species.toLowerCase()} in the Community Pet Fund`
        }
        width={1200}
        height={900}
        loading="lazy"
        className="w-full rounded-xl object-cover"
        style={{ border: "1px solid rgba(124,58,237,0.12)" }}
      />
      {rest.length > 0 ? (
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {rest.map((photo) => (
            <img
              key={photo.id}
              src={`/api/media/${photo.photo_key}`}
              alt={
                photo.alt?.trim() || `${animal.name}, additional photo`
              }
              width={400}
              height={300}
              loading="lazy"
              className="aspect-[4/3] w-full rounded-lg object-cover"
              style={{ border: "1px solid rgba(124,58,237,0.12)" }}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

function StatusPill({ status }: { status: AnimalStatus }) {
  const label =
    ANIMAL_STATUS_OPTIONS.find((option) => option.value === status)?.label ??
    status;

  return (
    <span
      className="inline-block rounded-full px-3 py-1 text-xs font-semibold text-white"
      style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.25)" }}
    >
      {label}
    </span>
  );
}

interface SponsorBlockProps {
  name: string;
  status: AnimalStatus;
  /** `animals.gb_campaign_code`; the publish gate requires it before release. */
  campaignCode: string | null;
  campaignUrl: string | null;
  /** Givebutter Widgets account ID; empty until the org's ID is configured. */
  widgetAccountId: string;
  donationsEnabled: boolean;
  taxCopy: string;
}

/**
 * The one place a donation form can appear. It renders nothing third-party
 * unless donations are on, the pet is accepting sponsors, and both a campaign
 * code and the org's widget account ID are configured - otherwise a visitor
 * gets an explanation and the campaign link, never a broken embed.
 */
function SponsorBlock({
  name,
  status,
  campaignCode,
  campaignUrl,
  widgetAccountId,
  donationsEnabled,
  taxCopy,
}: SponsorBlockProps) {
  const cardStyle = {
    background: "rgba(124,58,237,0.06)",
    border: "1px solid rgba(124,58,237,0.12)",
  } as const;

  if (!donationsEnabled) {
    return (
      <div className="rounded-xl p-6" style={cardStyle}>
        <p className="text-lg font-bold text-foreground">
          Sponsorship opens soon
        </p>
        <p className="mt-2 text-sm leading-relaxed text-text-secondary">
          Online sponsorship is not open yet. Pet profiles, photos, and needs are
          published ahead of the donation form so you can see exactly what the
          fund covers.{" "}
          <Link href="/contact" className="font-semibold" style={{ color: "#7C3AED" }}>
            Contact us
          </Link>{" "}
          and we will let you know when you can sponsor {name}.
        </p>
        <p className="mt-4 text-xs leading-relaxed text-text-secondary">
          {taxCopy}
        </p>
      </div>
    );
  }

  if (status === "accepting") {
    const embeddableCode = campaignCode?.trim();
    const accountId = widgetAccountId.trim();

    return (
      <div className="rounded-xl" style={cardStyle}>
        <div className="p-6 pb-0">
          <p
            className="text-xs font-semibold uppercase tracking-wide"
            style={{ color: "#7C3AED" }}
          >
            Sponsor this pet
          </p>
          <p className="mt-1 text-lg font-bold text-foreground">
            Sponsor {name}
          </p>
          <p className="mt-2 text-sm leading-relaxed text-text-secondary">
            Give any amount, one time or monthly. The form is Givebutter&apos;s
            and stays on this page, so card details never touch our servers.
          </p>
        </div>

        <div className="mt-4 px-3">
          {embeddableCode && accountId ? (
            <GivebutterWidget
              campaignCode={embeddableCode}
              accountId={accountId}
              campaignUrl={campaignUrl}
            />
          ) : (
            <div className="px-3">
              <p className="text-sm leading-relaxed text-text-secondary">
                The embedded donation form is not available right now.
                {campaignUrl
                  ? " You can still give on the campaign page."
                  : " Get in touch and we will help you give."}
              </p>
              {campaignUrl ? (
                <a
                  href={campaignUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-1 text-sm font-semibold"
                  style={{ color: "#7C3AED" }}
                >
                  Open the {name} campaign →
                </a>
              ) : null}
            </div>
          )}
        </div>

        <div className="p-6 pt-4">
          <p className="border-t pt-4 text-sm leading-relaxed text-text-secondary" style={{ borderColor: "rgba(124,58,237,0.12)" }}>
            <span className="font-semibold text-foreground">
              Where the money goes:
            </span>{" "}
            gifts pay vet clinics and suppliers directly for the needs listed on
            this page. Leftover funds stay in the Community Pet Fund for other
            neighbors&apos; pets.
          </p>
          <p className="mt-3 text-xs leading-relaxed text-text-secondary">
            {taxCopy}
          </p>
        </div>
      </div>
    );
  }

  if (status === "funded" || status === "closed") {
    return (
      <div className="rounded-xl p-6" style={cardStyle}>
        <p className="text-lg font-bold text-foreground">
          This pet&apos;s needs are currently met
        </p>
        <p className="mt-2 text-sm leading-relaxed text-text-secondary">
          Sponsorship for {name} is paused because the listed needs are covered.
          Anything given to the Community Pet Fund beyond this pet&apos;s needs
          supports other neighbors&apos; pets.
        </p>
        <p className="mt-4 text-xs leading-relaxed text-text-secondary">
          {taxCopy}
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl p-6" style={cardStyle}>
      <p className="text-lg font-bold text-foreground">
        Sponsorship is not open for this pet
      </p>
      <p className="mt-2 text-sm leading-relaxed text-text-secondary">
        This profile is not accepting sponsors right now.{" "}
        <Link href="/contact" className="font-semibold" style={{ color: "#7C3AED" }}>
          Contact us
        </Link>{" "}
        if you would like to help with another pet.
      </p>
      <p className="mt-4 text-xs leading-relaxed text-text-secondary">
        {taxCopy}
      </p>
    </div>
  );
}

export default async function CommunityPetPage({ params }: AnimalPageProps) {
  const { slug } = await params;
  const animal = await getAnimalBySlug(slug);

  // `getAnimalBySlug()` returns drafts too, so the publish gate is enforced
  // here as well as in the admin UI.
  if (!animal || animal.is_published !== 1) {
    notFound();
  }

  const [expenses, config] = await Promise.all([
    getAnimalExpenses(animal.id),
    getCommunityPetsConfig(),
  ]);

  const spentCents = expenses.reduce(
    (total, expense) => total + expense.amount_cents,
    0,
  );
  const needs = parseAnimalNeeds(animal.needs_json);
  const needsTotalCents = needs.reduce(
    (total, need) => total + need.cost_cents,
    0,
  );
  const taxCopy = getTaxStatusCopy(config.nonprofitStatus);
  const facts = [animal.species, animal.breed, animal.age_text].filter(
    (value): value is string => Boolean(value && value.trim()),
  );

  return (
    <div className="flex flex-1 flex-col font-sans">
      {/* Hero */}
      <section
        style={{ background: "linear-gradient(160deg, #3b0764 0%, #5B21B6 45%, #7C3AED 100%)" }}
      >
        <div className="px-4 pb-10 pt-12">
          <div className="mx-auto max-w-5xl">
            <Link
              href="/programs/community-pets"
              className="text-sm font-semibold text-white/70 transition-colors hover:text-white"
            >
              ← Community Pet Fund
            </Link>
            <div className="mt-6 flex flex-wrap items-center gap-2">
              <span
                className="inline-block rounded-full px-3 py-1 text-xs font-semibold text-white"
                style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.25)" }}
              >
                {animal.species}
              </span>
              <StatusPill status={animal.status} />
            </div>
            <h1 className="mt-3 text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl">
              {animal.name}
            </h1>
            {animal.tagline ? (
              <p
                className="mt-3 text-lg leading-8"
                style={{ color: "rgba(255,255,255,0.75)", maxWidth: 560 }}
              >
                {animal.tagline}
              </p>
            ) : null}
            <p
              className="mt-3 text-sm"
              style={{ color: "rgba(255,255,255,0.6)" }}
            >
              {facts.join(" / ")}
            </p>
          </div>
        </div>
      </section>

      {/* Body */}
      <section className="bg-white px-4 py-12">
        <div className="mx-auto grid max-w-5xl gap-10 lg:grid-cols-[1.4fr_1fr]">
          <div>
            <PetGallery animal={animal} />

            <h2 className="mb-3 mt-10 text-2xl font-bold text-foreground">
              About {animal.name}
            </h2>
            <div className="space-y-5 text-lg leading-relaxed text-text-secondary">
              <p>{animal.bio}</p>
              {animal.story ? (
                <p className="whitespace-pre-line">{animal.story}</p>
              ) : null}
            </div>

            <h2 className="mb-3 mt-10 text-2xl font-bold text-foreground">
              What {animal.name} needs
            </h2>
            {needs.length === 0 ? (
              <p className="text-base leading-relaxed text-text-secondary">
                The needs list for this pet is being finalized. Get in touch if
                you would like details before you give.
              </p>
            ) : (
              <div
                className="overflow-hidden rounded-xl"
                style={{ border: "1px solid rgba(124,58,237,0.12)" }}
              >
                {needs.map((need, index) => (
                  <div
                    key={`${need.label}-${index}`}
                    className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 px-4 py-3"
                    style={{
                      borderTop:
                        index === 0 ? undefined : "1px solid rgba(124,58,237,0.1)",
                      background:
                        index % 2 === 0 ? "#fff" : "rgba(124,58,237,0.03)",
                    }}
                  >
                    <span className="text-base font-medium text-foreground">
                      {need.label}
                    </span>
                    <span className="text-sm text-text-secondary">
                      {formatCents(need.cost_cents)}{" "}
                      <span className="capitalize">
                        {cadenceLabel(need.cadence)}
                      </span>
                    </span>
                  </div>
                ))}
                <div
                  className="flex items-baseline justify-between px-4 py-3"
                  style={{ borderTop: "1px solid rgba(124,58,237,0.12)", background: "rgba(124,58,237,0.06)" }}
                >
                  <span className="text-sm font-semibold text-foreground">
                    Needs total
                  </span>
                  <span className="text-sm font-semibold text-foreground">
                    {formatCents(needsTotalCents)}
                  </span>
                </div>
              </div>
            )}
          </div>

          <aside className="space-y-6">
            <AnimalProgress
              raisedCents={animal.gb_raised_cents}
              goalCents={animal.goal_cents}
              supporters={animal.gb_supporters}
              spentCents={spentCents}
            />

            <SponsorBlock
              name={animal.name}
              status={animal.status}
              campaignCode={animal.gb_campaign_code}
              campaignUrl={animal.gb_campaign_url}
              widgetAccountId={config.givebutterAccountId}
              donationsEnabled={config.donationsEnabled}
              taxCopy={taxCopy}
            />

            <div
              className="rounded-xl p-6"
              style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.25)" }}
            >
              <p className="font-semibold text-foreground">
                If this pet&apos;s needs are met
              </p>
              <p className="mt-2 text-sm leading-relaxed text-text-secondary">
                Designations are honored while the pet is in the program. If the
                listed needs are fully met, or the pet leaves the program, any
                remaining gifts stay in the Community Pet Fund and support other
                neighbors&apos; pets. We do not pay leftovers to the owner.
              </p>
              <p className="mt-4 border-t pt-4 text-sm leading-relaxed text-text-secondary" style={{ borderColor: "rgba(245,158,11,0.25)" }}>
                <span className="font-semibold text-foreground">
                  Donor privacy:
                </span>{" "}
                we never publish donor names, email addresses, or individual gift
                amounts. Owners are not named or described in a way that
                identifies where they live.
              </p>
            </div>

            <Link
              href="/programs/community-pets"
              className="inline-flex items-center gap-1 text-sm font-semibold"
              style={{ color: "#7C3AED" }}
            >
              See all pets in the fund →
            </Link>
          </aside>
        </div>
      </section>
    </div>
  );
}
