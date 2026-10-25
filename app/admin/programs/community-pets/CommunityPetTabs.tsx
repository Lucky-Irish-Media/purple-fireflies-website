"use client";

import { useState } from "react";
import type {
  AnimalWithPhotos,
  AnimalExpense,
  AnimalSponsorshipWithAnimal,
} from "@/app/lib/definitions";
import { AnimalsTable } from "./AnimalsTable";
import { SponsorsTable } from "./SponsorsTable";

type TabKey = "animals" | "sponsors";

const tabs: { key: TabKey; label: string }[] = [
  { key: "animals", label: "Animals" },
  { key: "sponsors", label: "Sponsors" },
];

export default function CommunityPetTabs({
  animals,
  expenses,
  sponsorships,
  givebutterConfigured,
}: {
  animals: AnimalWithPhotos[];
  expenses: AnimalExpense[];
  sponsorships: AnimalSponsorshipWithAnimal[];
  givebutterConfigured: boolean;
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
          <AnimalsTable initialAnimals={animals} initialExpenses={expenses} />
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
    </div>
  );
}
