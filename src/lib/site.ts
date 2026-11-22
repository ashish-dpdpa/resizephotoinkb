// Central site settings. Change the name, domain and contact details here
// and every page, the sitemap, robots.txt and structured data pick it up.

export const siteConfig = {
  name: "ResizePhotoInKB",
  tagline: "Photo, signature and file tools for Indian exam forms",
  description:
    "Resize your photo and signature to the exact KB and pixel size for SSC, UPSC, IBPS, SBI, Railway and NEET forms. Free, and your files never leave your device.",
  // Set NEXT_PUBLIC_SITE_URL in .env.local / your host once you have a domain.
  url: (process.env.NEXT_PUBLIC_SITE_URL || "https://www.resizephotoinkb.com").replace(/\/$/, ""),
  locale: "en_IN",
  // Temporary: switch to contact@resizephotoinkb.com once the domain is bought and
  // free email forwarding (Cloudflare Email Routing / registrar) points it to this inbox.
  contactEmail: "workwith.ak0@gmail.com",
  // Shown on the About page and as the blog author.
  author: {
    name: "ResizePhotoInKB Editorial Team",
    bio: "We go through exam notices (and the guides that report them), test every size preset in our own tools, and write up what you actually need to know to get your form accepted.",
  },
  // Set NEXT_PUBLIC_ADSENSE_CLIENT (e.g. ca-pub-1234567890123456) to load AdSense.
  adsenseClient: process.env.NEXT_PUBLIC_ADSENSE_CLIENT || "",
};

export const mainNav = [
  { href: "/tools", label: "Tools" },
  { href: "/exams", label: "Exams" },
  { href: "/blog", label: "Blog" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function absoluteUrl(path = "/") {
  return `${siteConfig.url}${path.startsWith("/") ? path : `/${path}`}`;
}
