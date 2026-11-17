"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type {
  Participant,
  VolunteerSignupWithDeliveries,
  VolunteerSignupWithDay,
} from "@/app/lib/definitions";
import { SignupsSection } from "@/app/volunteer/SignupsSection";
import { DeliveriesSection } from "@/app/volunteer/DeliveriesSection";
import { ProfileForm } from "@/app/volunteer/ProfileForm";
import { PasswordForm } from "@/app/volunteer/PasswordForm";
import { cancelMyVolunteerSignupAction } from "@/app/actions/volunteer-meals";

type TabKey = "signups" | "deliveries" | "kitchen" | "profile";

const tabs: { key: TabKey; label: string }[] = [
  { key: "signups", label: "Upcoming Signups" },
  { key: "deliveries", label: "My Deliveries" },
  { key: "kitchen", label: "Kitchen Volunteering" },
  { key: "profile", label: "Profile" },
];

interface Props {
  signups: VolunteerSignupWithDeliveries[];
  participant: Participant | null;
  initialRegions: string[];
  initialOnSignal: string;
  kitchenSignups: VolunteerSignupWithDay[];
}

export function VolunteerTabs({
  signups,
  participant,
  initialRegions,
  initialOnSignal,
  kitchenSignups,
}: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  function cancel(id: number) {
    const fd = new FormData();
    fd.set("id", String(id));
    startTransition(async () => {
      await cancelMyVolunteerSignupAction(fd);
      router.refresh();
    });
  }
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

      {activeTab === "deliveries" && (
        <section className="space-y-4">
          <DeliveriesSection signups={signups} />
        </section>
      )}

      {activeTab === "kitchen" && (
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground">Kitchen Volunteer Signups</h2>
          {kitchenSignups.length === 0 && (
            <p className="text-text-secondary">No kitchen volunteer signups.</p>
          )}
          <ul className="space-y-2">
            {kitchenSignups.map((s) => (
              <li key={s.id} className="border border-primary/10 rounded-lg p-3 flex items-center justify-between gap-3">
                <div>
                  <p className="font-medium text-foreground">
                    {new Date(s.day_date + "T00:00:00").toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric", year: "numeric" })}
                  </p>
                  <p className="text-sm text-text-secondary">
                    Role: {s.role} · {s.is_group ? `Group: ${s.group_name} (${s.headcount})` : "Individual"} · Status: {s.status}
                  </p>
                </div>
                {s.status === "active" && (
                  <button
                    onClick={() => cancel(s.id)}
                    disabled={pending}
                    className="rounded-lg border border-red-200 text-red-600 px-3 py-1.5 text-xs font-medium"
                  >
                    Cancel
                  </button>
                )}
              </li>
            ))}
          </ul>
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
