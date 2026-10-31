import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
import path from "path";

initOpenNextCloudflareForDev();

const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://widgets.givebutter.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://givebutter.com https://givebuttercdn.com",
  "font-src 'self'",
  "connect-src 'self' https://givebutter.com https://widgets.givebutter.com",
  "frame-src https://givebutter.com https://*.givebutter.com",
  "base-uri 'self'",
  "form-action 'self'",
].join("; ");

const nextConfig: NextConfig = {
  experimental: {
    // Newsletter image and pet photo uploads go through server actions. The
    // browser resizes pet photos to well under a megabyte, but the action
    // accepts up to 8 MB, so the 1 MB default would reject a valid file
    // before the action ever ran.
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
