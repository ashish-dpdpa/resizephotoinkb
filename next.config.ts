import type { NextConfig } from "next";

// Guides that were published at /blog/<slug> before they moved to /guides and /blog
// became the Supabase blog. Each one 301-redirects to /guides/<slug> so old links and
// rankings carry over. A fixed historical list: don't add new guides here.
// (Kept inline: importing local modules from this file breaks the Tailwind build here.)
const LEGACY_BLOG_SLUGS = [
  "how-to-calculate-age-for-government-exam-eligibility",
  "how-to-compress-image-to-20kb",
  "how-to-resize-photo-for-government-exam-forms",
  "how-to-scan-signature-for-online-form",
  "jpg-vs-png-vs-pdf-for-online-forms",
  "live-photo-capture-tips-ssc-railway",
  "photo-ka-size-kaise-kam-kare",
  "photo-par-naam-aur-date-kaise-likhe",
  "photo-size-kb-pixels-dpi-explained",
  "signature-10-se-20-kb-kaise-kare",
  "why-exam-form-photos-get-rejected",
];

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
  // Admin pages and actions read /content/guides so a blog post can't take a guide's slug.
  outputFileTracingIncludes: { "/admin/**/*": ["./content/guides/**/*"] },
  async redirects() {
    return LEGACY_BLOG_SLUGS.map((slug) => ({ source: `/blog/${slug}`, destination: `/guides/${slug}`, permanent: true }));
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
