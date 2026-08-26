"use client";

import { useState } from "react";
import type { LegalObserverSignup, LegalObserverRequest } from "@/app/lib/definitions";
import { LegalObserverSignupsTable } from "./LegalObserverSignupsTable";
import { LegalObserverRequestsTable } from "./LegalObserverRequestsTable";

type TabKey = "signups" | "requests";

const tabs: { key: TabKey; label: string }[] = [
  { key: "signups", label: "Observer Signups" },
  { key: "requests", label: "Coverage Requests" },
];

export default function LegalObserverTabs({
  signups,
  requests,
}: {
  signups: LegalObserverSignup[];
  requests: LegalObserverRequest[];
}) {
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
          <LegalObserverSignupsTable initialData={signups} />
        </section>
      )}
      {activeTab === "requests" && (
        <section>
          <LegalObserverRequestsTable initialData={requests} />
        </section>
      )}
    </div>
  );
}
