"use client";

import { useState } from "react";
import type {
  Participant,
  VolunteerSignupWithDeliveries,
} from "@/app/lib/definitions";
import { SignupsSection } from "@/app/volunteer/SignupsSection";
import { ProfileForm } from "@/app/volunteer/ProfileForm";
import { PasswordForm } from "@/app/volunteer/PasswordForm";

type TabKey = "signups" | "profile";

const tabs: { key: TabKey; label: string }[] = [
  { key: "signups", label: "Upcoming Signups" },
  { key: "profile", label: "Profile" },
];

interface Props {
  signups: VolunteerSignupWithDeliveries[];
  participant: Participant | null;
  initialRegions: string[];
  initialOnSignal: string;
}

export function VolunteerTabs({
  signups,
  participant,
  initialRegions,
  initialOnSignal,
}: Props) {
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
        <section className="space-y-4">
          <SignupsSection signups={signups} />
        </section>
      )}

      {activeTab === "profile" && (
        <div className="space-y-12">
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground">My Profile</h2>
            <ProfileForm
              participant={participant}
              initialRegions={initialRegions}
              initialOnSignal={initialOnSignal}
            />
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground">Change Password</h2>
            <PasswordForm />
          </section>
        </div>
      )}
    </div>
  );
}
