"use client";

import { useState } from "react";
import type { DonationRequest, DonationSignupWithParticipant, VolunteerDay, VolunteerSignupWithParticipant } from "@/app/lib/definitions";
import DonationRequestsManager from "./DonationRequestsManager";
import DonationSignupsTable from "./DonationSignupsTable";
import VolunteerDaysTable from "./VolunteerDaysTable";
import VolunteerSignupsTable from "./VolunteerSignupsTable";

type TabKey = "requests" | "signups" | "volunteerDays" | "volunteerSignups";

export default function WinterFoodDriveTabs({
  requests,
  signups,
  volunteerDays,
  volunteerSignups,
}: {
  requests: DonationRequest[];
  signups: DonationSignupWithParticipant[];
  volunteerDays: VolunteerDay[];
  volunteerSignups: VolunteerSignupWithParticipant[];
}) {
  const [activeTab, setActiveTab] = useState<TabKey>("requests");

  // compute slot usage per day from signups
  const slotUsage: Record<number, Record<string, number>> = {};
  for (const d of volunteerDays) {
    slotUsage[d.id] = { cooking: 0, cleaning: 0, packing: 0 };
  }
  for (const s of volunteerSignups) {
    if (s.status !== "active") continue;
    if (!slotUsage[s.day_id]) slotUsage[s.day_id] = { cooking: 0, cleaning: 0, packing: 0 };
    slotUsage[s.day_id][s.role] = (slotUsage[s.day_id][s.role] || 0) + s.headcount;
  }

  const tabs: { key: TabKey; label: string }[] = [
    { key: "requests", label: "Donation Items" },
    { key: "signups", label: "Donation Signups" },
    { key: "volunteerDays", label: "Volunteer Days" },
    { key: "volunteerSignups", label: "Volunteer Signups" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              activeTab === t.key ? "bg-primary text-white" : "bg-card border border-primary/10 text-text-secondary hover:bg-primary/5 hover:text-foreground"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {activeTab === "requests" && (
        <DonationRequestsManager requests={requests} signups={signups} />
      )}
      {activeTab === "signups" && (
        <DonationSignupsTable initialData={signups} />
      )}
      {activeTab === "volunteerDays" && (
        <VolunteerDaysTable days={volunteerDays} slotUsage={slotUsage} />
      )}
      {activeTab === "volunteerSignups" && (
        <VolunteerSignupsTable initialData={volunteerSignups} />
      )}
    </div>
  );
}
