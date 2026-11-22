// Central site settings. Change the name, domain and contact details here
// and every page, the sitemap, robots.txt and structured data pick it up.

export const siteConfig = {
  name: "FormReady",
  tagline: "Photo, signature and file tools for Indian exam forms",
  description:
    "Resize your photo and signature to the exact KB and pixel size for SSC, UPSC, IBPS, SBI, Railway and NEET forms. Free, and your files never leave your device.",
  // Set NEXT_PUBLIC_SITE_URL in .env.local / your host once you have a domain.
  url: (process.env.NEXT_PUBLIC_SITE_URL || "https://www.example.com").replace(/\/$/, ""),
  locale: "en_IN",
  // Replace with a real address on your own domain before applying for AdSense.
  contactEmail: "contact@example.com",
  // Shown on the About page and as the blog author.
  author: {
    name: "FormReady Editorial Team",
    bio: "We help students fill government exam forms correctly by turning each official notification into clear, tested instructions and free tools.",
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
