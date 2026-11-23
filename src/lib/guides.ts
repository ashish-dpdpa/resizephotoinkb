import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { readingMinutes, renderMarkdown } from "./markdown";

// Guides are Markdown files in /content/guides, served at /guides/<slug>. Front matter:
//   title, description, date (YYYY-MM-DD), updated (optional), category, tags (list),
//   seoTitle (optional), lang ("hi" for Hindi, optional)
// The file name (without .md) becomes the URL slug.
//
// Guides are evergreen how-tos that live in the repo. Blog posts (news, updates)
// are written in the admin panel and stored in Supabase; see src/lib/blog.ts.

const GUIDES_DIR = path.join(process.cwd(), "content", "guides");

export interface GuideMeta {
  slug: string;
  title: string;
  /** Shorter title for search results (optional front matter `seoTitle`). */
  seoTitle?: string;
  description: string;
  date: string;
  updated?: string;
  category: string;
  tags: string[];
  /** "hi" for Hindi guides; defaults to English. */
  lang: "en" | "hi";
  readingMinutes: number;
}

export interface Guide extends GuideMeta {
  html: string;
  headings: { id: string; text: string }[];
}

function readFile(slug: string) {
  const raw = fs.readFileSync(path.join(GUIDES_DIR, `${slug}.md`), "utf8");
  return matter(raw);
}

function toMeta(slug: string, data: Record<string, unknown>, content: string): GuideMeta {
  return {
    slug,
    title: String(data.title),
    seoTitle: data.seoTitle ? String(data.seoTitle) : undefined,
    description: String(data.description),
    date: String(data.date),
    updated: data.updated ? String(data.updated) : undefined,
    category: String(data.category ?? "Guides"),
    tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
    lang: data.lang === "hi" ? "hi" : "en",
    readingMinutes: readingMinutes(content),
  };
}

/** Slugs of every guide (the admin panel keeps blog posts from reusing them). */
export function getGuideSlugs(): string[] {
  if (!fs.existsSync(GUIDES_DIR)) return [];
  return fs.readdirSync(GUIDES_DIR).filter((f) => f.endsWith(".md")).map((f) => f.replace(/\.md$/, ""));
}

export function getAllGuides(): GuideMeta[] {
  return getGuideSlugs()
    .map((slug) => {
      const { data, content } = readFile(slug);
      return toMeta(slug, data, content);
    })
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getGuide(slug: string): Guide | null {
  if (!/^[a-z0-9-]+$/.test(slug) || !fs.existsSync(path.join(GUIDES_DIR, `${slug}.md`))) return null;
  const { data, content } = readFile(slug);
  return { ...toMeta(slug, data, content), ...renderMarkdown(content) };
}
