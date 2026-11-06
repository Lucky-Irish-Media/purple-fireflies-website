"use client";

import { useState } from "react";
import type { Newsletter, NewsletterSubscriber } from "@/app/lib/definitions";
import NewslettersTable from "../NewslettersTable";
import NewsletterSubscribersTable from "../NewsletterSubscribersTable";

type TabKey = "newsletters" | "subscribers";

const tabs: { key: TabKey; label: string }[] = [
  { key: "newsletters", label: "Newsletters" },
  { key: "subscribers", label: "Subscribers" },
];

interface Props {
  newsletters: Newsletter[];
  canSend: boolean;
  canEdit: boolean;
  confirmedSubscriberCount: number;
  subscribers: NewsletterSubscriber[];
  counts: { pending: number; confirmed: number; unsubscribed: number; total: number };
  canManageSubscribers?: boolean;
}

export default function NewslettersTabs({
  newsletters,
  canSend,
  canEdit,
  confirmedSubscriberCount,
  subscribers,
  counts,
  canManageSubscribers = false,
}: Props) {
  const [activeTab, setActiveTab] = useState<TabKey>("newsletters");

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

      {activeTab === "newsletters" && (
        <NewslettersTable
          initialNewsletters={newsletters}
          canSend={canSend}
          canEdit={canEdit}
          confirmedSubscriberCount={confirmedSubscriberCount}
        />
      )}

      {activeTab === "subscribers" && (
        <NewsletterSubscribersTable initialSubscribers={subscribers} counts={counts} canManage={canManageSubscribers} />
      )}
    </div>
  );
}
