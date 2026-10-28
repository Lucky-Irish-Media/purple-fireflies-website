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
