"use client";

import { useState } from "react";
import type {
  AnimalWithPhotos,
  AnimalExpense,
  AnimalSponsorshipWithAnimal,
  PetApplication,
} from "@/app/lib/definitions";
import { AnimalsTable } from "./AnimalsTable";
import { SponsorsTable } from "./SponsorsTable";
import { PetApplicationsTable } from "./PetApplicationsTable";

type TabKey = "animals" | "sponsors" | "applications";

const tabs: { key: TabKey; label: string }[] = [
  { key: "animals", label: "Animals" },
  { key: "sponsors", label: "Sponsors" },
  { key: "applications", label: "Applications" },
];

export default function CommunityPetTabs({
  animals,
  expenses,
  sponsorships,
  givebutterConfigured,
  applications,
  verifiedCampaignCodes,
}: {
  animals: AnimalWithPhotos[];
  expenses: AnimalExpense[];
  sponsorships: AnimalSponsorshipWithAnimal[];
  givebutterConfigured: boolean;
  applications: PetApplication[];
  verifiedCampaignCodes?: string[];
}) {
  const [activeTab, setActiveTab] = useState<TabKey>("animals");

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? "bg-primary text-white"
                : "bg-card border border-primary/10 text-text-secondary hover:bg-primary/5 hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "animals" && (
        <section>
          <AnimalsTable
            initialAnimals={animals}
            initialExpenses={expenses}
            verifiedCampaignCodes={verifiedCampaignCodes}
          />
        </section>
      )}

      {activeTab === "sponsors" && (
        <section>
          <SponsorsTable
            sponsorships={sponsorships}
            givebutterConfigured={givebutterConfigured}
          />
        </section>
      )}

      {activeTab === "applications" && (
        <section>
          <PetApplicationsTable initialData={applications} />
        </section>
      )}
    </div>
  );
}
