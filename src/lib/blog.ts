import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { marked } from "marked";

// Blog posts are Markdown files in /content/blog. Front matter fields:
//   title, description, date (YYYY-MM-DD), updated (optional), category, tags (list)
// The file name (without .md) becomes the URL slug.

const BLOG_DIR = path.join(process.cwd(), "content", "blog");

export interface PostMeta {
  slug: string;
  title: string;
  /** Shorter title for search results (optional front matter `seoTitle`). */
  seoTitle?: string;
  description: string;
  date: string;
  updated?: string;
  category: string;
  tags: string[];
  /** "hi" for Hindi posts; defaults to English. */
  lang: "en" | "hi";
  readingMinutes: number;
}

export interface Post extends PostMeta {
  html: string;
  headings: { id: string; text: string }[];
}

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/<[^>]+>/g, "")
    .replace(/[^\p{L}\p{M}\p{N}\s-]/gu, "")
    .trim()
    .replace(/\s+/g, "-");
}

function readFile(slug: string) {
  const raw = fs.readFileSync(path.join(BLOG_DIR, `${slug}.md`), "utf8");
  return matter(raw);
}

function toMeta(slug: string, data: Record<string, unknown>, content: string): PostMeta {
  const words = content.split(/\s+/).filter(Boolean).length;
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
    readingMinutes: Math.max(1, Math.round(words / 200)),
  };
}

export function getAllPosts(): PostMeta[] {
  if (!fs.existsSync(BLOG_DIR)) return [];
  return fs
    .readdirSync(BLOG_DIR)
    .filter((f) => f.endsWith(".md"))
    .map((f) => {
      const slug = f.replace(/\.md$/, "");
      const { data, content } = readFile(slug);
      return toMeta(slug, data, content);
    })
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getPost(slug: string): Post | null {
  if (!/^[a-z0-9-]+$/.test(slug) || !fs.existsSync(path.join(BLOG_DIR, `${slug}.md`))) return null;
  const { data, content } = readFile(slug);
  const headings: { id: string; text: string }[] = [];
  const used = new Map<string, number>();
  const renderer = new marked.Renderer();
  renderer.heading = ({ tokens, depth }) => {
    const text = marked.Parser.parseInline(tokens);
    const baseId = slugify(text) || "section";
    const n = (used.get(baseId) ?? 0) + 1;
    used.set(baseId, n);
    const id = n > 1 ? `${baseId}-${n}` : baseId;
    if (depth === 2) headings.push({ id, text: text.replace(/<[^>]+>/g, "") });
    return `<h${depth} id="${id}">${text}</h${depth}>`;
  };
  renderer.link = ({ href, tokens }) => {
    const text = marked.Parser.parseInline(tokens);
    const external = /^https?:\/\//.test(href);
    return external
      ? `<a href="${href}" target="_blank" rel="noopener nofollow">${text}</a>`
      : `<a href="${href}">${text}</a>`;
  };
  const html = marked.parse(content, { renderer, async: false }) as string;
  return { ...toMeta(slug, data, content), html, headings };
}
