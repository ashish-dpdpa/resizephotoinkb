import type { MetadataRoute } from "next";
import { getPublishedPosts } from "@/lib/blog";
import { getAllGuides } from "@/lib/guides";
import { allDocPages } from "@/lib/docs";
import { exams } from "@/lib/exams";
import { absoluteUrl } from "@/lib/site";
import { tools } from "@/lib/tools";

// Re-generated at most hourly so new blog posts show up; publishing also refreshes it.
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const posts = await getPublishedPosts();
  const staticPages = ["/", "/tools", "/exams", "/guides", "/blog", "/about", "/contact", "/privacy-policy", "/terms", "/disclaimer"];
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
    ...getAllGuides().map((p) => ({
      url: absoluteUrl(`/guides/${p.slug}`),
      lastModified: new Date(p.updated ?? p.date),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    ...posts.map((p) => ({
      url: absoluteUrl(`/blog/${p.slug}`),
      lastModified: new Date(p.updatedAt),
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
  ];
}
