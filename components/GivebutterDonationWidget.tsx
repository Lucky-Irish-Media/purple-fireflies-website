"use client";

import Script from "next/script";
import { useEffect, useState } from "react";

const LIBRARY_URL = "https://widgets.givebutter.com/latest.umd.cjs";
const LIBRARY_PLATFORM = "other";
const WIDGET_TAG = "givebutter-giving-form";
const BLOCKED_AFTER_MS = 10_000;

type WidgetStatus = "pending" | "ready" | "blocked";

interface GivebutterDonationWidgetProps {
  campaignCode: string;
  accountId: string;
}

export default function GivebutterDonationWidget({
  campaignCode,
  accountId,
}: GivebutterDonationWidgetProps) {
  const [status, setStatus] = useState<WidgetStatus>("pending");

  useEffect(() => {
    if (status !== "pending") return;

    const timer = window.setTimeout(() => {
      if (!window.customElements.get(WIDGET_TAG)) {
        setStatus("blocked");
      }
    }, BLOCKED_AFTER_MS);

    return () => window.clearTimeout(timer);
  }, [status]);

  function handleLibraryReady() {
    setStatus(window.customElements.get(WIDGET_TAG) ? "ready" : "blocked");
  }

  const donateUrl = `https://givebutter.com/c/${campaignCode}`;

  return (
    <div>
      <Script
        src={`${LIBRARY_URL}?acct=${encodeURIComponent(
          accountId
        )}&p=${LIBRARY_PLATFORM}`}
        strategy="lazyOnload"
        onReady={handleLibraryReady}
        onError={() => setStatus("blocked")}
      />

      {status === "blocked" ? (
        <div
          className="rounded-lg p-4"
          style={{
            background: "#fff",
            border: "1px solid rgba(124,58,237,0.2)",
          }}
        >
          <p className="text-sm font-semibold text-foreground">
            The donation form could not load
          </p>
          <p className="mt-1 text-sm leading-relaxed text-text-secondary">
            A script blocker may be preventing Givebutter&apos;s form from
            appearing. You can still give on the campaign page.
          </p>
          <a
            href={donateUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex items-center gap-1 text-sm font-semibold"
            style={{ color: "#7C3AED" }}
          >
            Open the campaign page →
          </a>
        </div>
      ) : (
        <>
          {status === "pending" ? (
            <p className="px-1 text-sm text-text-secondary">
              Loading the donation form...
            </p>
          ) : null}
          <givebutter-giving-form
            campaign={campaignCode}
            account={accountId}
            theme-color="#7C3AED"
          />
        </>
      )}
    </div>
  );
}
