"use client";

import Script from "next/script";
import { useEffect, useState } from "react";

/**
 * Givebutter's embedded donation form for one pet.
 *
 * Built from the manual embed docs rather than a copied dashboard snippet:
 *
 * - https://docs.givebutter.com/widgets/getting-started
 * - https://docs.givebutter.com/widgets/widget-types/form
 *
 * The library is keyed to the org's **Widgets account ID**, not to a campaign,
 * and each form names its own campaign code. That is why `animals` stores
 * `gb_campaign_code` and no per-pet widget id: adding a pet needs a Givebutter
 * campaign, which the publish gate already requires, and no extra dashboard
 * widget.
 *
 * The card fields live in Givebutter's iframe, so nothing here touches payment
 * data, and the page shows progress from cached D1 totals rather than this
 * widget's own goal bar.
 */
const LIBRARY_URL = "https://widgets.givebutter.com/latest.umd.cjs";

/** The custom element the library registers, used to detect a blocked script. */
const WIDGET_TAG = "givebutter-giving-form";

/**
 * `next/script` surfaces a failed request through `onError`, but a script
 * blocker can swallow the request without ever firing it. This is the backstop:
 * if the element is still undefined after this long, show the campaign link
 * instead of an empty gap.
 */
const BLOCKED_AFTER_MS = 10_000;

type WidgetStatus = "pending" | "ready" | "blocked";

interface GivebutterWidgetProps {
  /** `animals.gb_campaign_code` for this pet. */
  campaignCode: string;
  /** Givebutter Widgets account ID from the dashboard. */
  accountId: string;
  /** `animals.gb_campaign_url`, used when the form cannot load. */
  campaignUrl: string | null;
}

export default function GivebutterWidget({
  campaignCode,
  accountId,
  campaignUrl,
}: GivebutterWidgetProps) {
  const [status, setStatus] = useState<WidgetStatus>("pending");

  // Prefer the URL an admin recorded, and fall back to the canonical campaign
  // address so a missing URL never leaves a donor with nowhere to go.
  const donateUrl =
    campaignUrl?.trim() || `https://givebutter.com/c/${campaignCode}`;

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
    // A request that was never blocked still does the donor no good if the
    // library loaded without registering the element, so check rather than
    // assuming.
    setStatus(window.customElements.get(WIDGET_TAG) ? "ready" : "blocked");
  }

  return (
    <div>
      <Script
        src={`${LIBRARY_URL}?acct=${encodeURIComponent(accountId)}`}
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
