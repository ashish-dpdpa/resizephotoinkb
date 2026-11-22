import type { NextConfig } from "next";

// Security headers for every response. CSP is left out on purpose: AdSense loads
// scripts and frames from many Google domains, and a strict CSP would block ads.
// The Topics API is not disabled either, because AdSense uses it for ad relevance.
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  // "Take photo" opens the phone camera through a file input, which needs no camera permission.
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
