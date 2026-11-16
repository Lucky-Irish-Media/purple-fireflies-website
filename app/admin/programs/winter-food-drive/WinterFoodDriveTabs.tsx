"use client";

import { useState } from "react";
import type { DonationWeek, DonationRequest, DonationSignupWithParticipant } from "@/app/lib/definitions";
import DonationRequestsManager from "./DonationRequestsManager";
import DonationSignupsTable from "./DonationSignupsTable";

type TabKey = "requests" | "signups";

export default function WinterFoodDriveTabs({
  weeks,
  weekRequests,
  signups,
}: {
  weeks: DonationWeek[];
  weekRequests: Record<number, DonationRequest[]>;
  signups: DonationSignupWithParticipant[];
}) {
  const [activeTab, setActiveTab] = useState<TabKey>("requests");

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setActiveTab("requests")}
          className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
            activeTab === "requests" ? "bg-primary text-white" : "bg-card border border-primary/10 text-text-secondary hover:bg-primary/5 hover:text-foreground"
          }`}
        >
          Donation Requests
        </button>
        <button
          onClick={() => setActiveTab("signups")}
          className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
            activeTab === "signups" ? "bg-primary text-white" : "bg-card border border-primary/10 text-text-secondary hover:bg-primary/5 hover:text-foreground"
          }`}
        >
          Donation Signups
        </button>
      </div>

      {activeTab === "requests" && (
        <DonationRequestsManager weeks={weeks} weekRequests={weekRequests} />
      )}
      {activeTab === "signups" && (
        <DonationSignupsTable initialData={signups} />
      )}
    </div>
  );
}