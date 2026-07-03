"use client";

import { useState } from "react";
import type { MealSignupWithAssignmentDb } from "@/app/lib/db";
import type { DriverVolunteer } from "@/app/lib/definitions";
import MealSignupsTable from "../../MealSignupsTable";
import DriverVolunteersTable from "../../DriverVolunteersTable";

type TabKey = "signups" | "volunteers";

interface Tab {
  key: TabKey;
  label: string;
}

const tabs: Tab[] = [
  { key: "signups", label: "Meal Signups" },
  { key: "volunteers", label: "Driver Volunteers" },
];

interface Props {
  mealSignups: MealSignupWithAssignmentDb[];
  driverVolunteers: DriverVolunteer[];
}

export default function MealDeliveryTabs({ mealSignups, driverVolunteers }: Props) {
  const [activeTab, setActiveTab] = useState<TabKey>("signups");

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

      {activeTab === "signups" && (
        <section>
          <MealSignupsTable initialData={mealSignups} drivers={driverVolunteers} />
        </section>
      )}

      {activeTab === "volunteers" && (
        <section>
          <DriverVolunteersTable initialData={driverVolunteers} />
        </section>
      )}
    </div>
  );
}
