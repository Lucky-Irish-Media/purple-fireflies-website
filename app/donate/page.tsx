import GivebutterDonationWidget from "@/components/GivebutterDonationWidget";
import { readEnvVar } from "@/app/lib/env";

export const dynamic = "force-dynamic";

export default async function Donate() {
  const accountId =
    (await readEnvVar("GIVEBUTTER_WIDGET_ACCOUNT_ID"))?.trim() ||
    "WCsdHvZKyriW1GgL";

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
              Support Us
            </span>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-white leading-tight mb-4">
              Donate
            </h1>
            <p className="text-lg leading-8" style={{ color: "rgba(255,255,255,0.75)", maxWidth: 480, margin: "0 auto" }}>
              Every contribution helps us continue our mission. Choose a campaign below to support Purple Fireflies.
            </p>
          </div>
        </div>
      </section>

      {/* Campaigns */}
      <section className="px-4 py-16 bg-white">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="flex flex-col gap-4">
            <h2 className="text-xl font-bold text-foreground">General Donation</h2>
            <p className="text-sm leading-relaxed text-text-secondary">
              Support Purple Fireflies&apos; day-to-day work feeding neighbors across Athens and Meigs counties.
            </p>
            <GivebutterDonationWidget campaignCode="GTIM3Q" accountId={accountId} />
          </div>

          <div className="flex flex-col gap-4">
            <h2 className="text-xl font-bold text-foreground">General Sponsor a Pet Fund</h2>
            <p className="text-sm leading-relaxed text-text-secondary">
              Help neighbors keep their pets by covering vet bills, medication, food, and supplies.
            </p>
            <GivebutterDonationWidget campaignCode="QXB4GF" accountId={accountId} />
          </div>
        </div>
      </section>
    </div>
  );
}
