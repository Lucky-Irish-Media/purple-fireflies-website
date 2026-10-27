"use client";

import Script from "next/script";
import { useEffect, useState } from "react";

const LIBRARY_URL = "https://widgets.givebutter.com/latest.umd.cjs";
const LIBRARY_PLATFORM = "other";
const WIDGET_TAG = "givebutter-widget";
const BLOCKED_AFTER_MS = 10_000;

type WidgetStatus = "pending" | "ready" | "blocked";

interface GivebutterDonationWidgetProps {
  widgetId: string;
  accountId: string;
}

export default function GivebutterDonationWidget({
  widgetId,
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
            appearing.
          </p>
        </div>
      ) : (
        <>
          {status === "pending" ? (
            <p className="px-1 text-sm text-text-secondary">
              Loading the donation form...
            </p>
          ) : null}
          <givebutter-widget id={widgetId} />
        </>
      )}
    </div>
  );
}
