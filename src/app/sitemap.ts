import type { MetadataRoute } from "next";
import { getAllPosts } from "@/lib/blog";
import { allDocPages } from "@/lib/docs";
import { exams } from "@/lib/exams";
import { absoluteUrl } from "@/lib/site";
import { tools } from "@/lib/tools";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const staticPages = ["/", "/tools", "/exams", "/blog", "/about", "/contact", "/privacy-policy", "/terms", "/disclaimer"];
  return [
    ...staticPages.map((p) => ({
      url: absoluteUrl(p),
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: p === "/" ? 1 : 0.6,
    })),
    ...tools.map((t) => ({ url: absoluteUrl(t.href), lastModified: now, changeFrequency: "monthly" as const, priority: 0.9 })),
    ...exams.map((e) => ({
      url: absoluteUrl(`/exams/${e.slug}`),
      lastModified: new Date(e.lastChecked),
      changeFrequency: "weekly" as const,
      priority: 0.9,
    })),
    ...allDocPages().map((p) => ({
      url: absoluteUrl(p.path),
      lastModified: new Date(p.exam.lastChecked),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...getAllPosts().map((p) => ({
      url: absoluteUrl(`/blog/${p.slug}`),
      lastModified: new Date(p.updated ?? p.date),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}
