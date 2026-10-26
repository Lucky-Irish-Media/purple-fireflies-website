import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
import path from "path";

initOpenNextCloudflareForDev();

const csp = [
  "default-src 'self'",
  // `widgets.givebutter.com` is the Givebutter Widgets library, loaded only on
  // pet pages that embed a donation form. Everything else on the site is
  // first-party.
  "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://widgets.givebutter.com",
  "style-src 'self' 'unsafe-inline'",
  // `givebuttercdn.com` serves the widget's own icons and "powered by" mark in
  // its shadow DOM.
  "img-src 'self' data: blob: https://givebutter.com https://givebuttercdn.com",
  "font-src 'self'",
  // The widget looks up its configuration at `givebutter.com/elements/api`.
  "connect-src 'self' https://givebutter.com https://widgets.givebutter.com",
  // Without an explicit frame-src the donation form's iframe inherits
  // default-src 'self' and is blocked, which shows as an empty card.
  "frame-src https://givebutter.com https://*.givebutter.com",
  "base-uri 'self'",
  "form-action 'self'",
].join("; ");

const nextConfig: NextConfig = {
  experimental: {
    // Pet photo uploads go through a server action. The browser resizes them
    // to well under a megabyte, but the action accepts up to 8 MB, so the
    // 1 MB default would reject a valid file before the action ever ran.
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
  turbopack: {
    root: path.resolve(import.meta.dirname ?? process.cwd()),
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "Content-Security-Policy", value: csp },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
};

export default nextConfig;
