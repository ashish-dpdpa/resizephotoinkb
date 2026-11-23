import "server-only";
import { readingMinutes, renderMarkdown, safeUrl } from "./markdown";
import { isValidSlug } from "./slug";
import { createPublicClient } from "./supabase/public";

// Blog posts are written in the admin panel (/admin) and stored in Supabase
// (table `posts`, see supabase/schema.sql). Evergreen how-tos live in
// /content/guides instead; see src/lib/guides.ts.

export interface PostRow {
  id: string;
  slug: string;
  title: string;
  seo_title: string | null;
  excerpt: string;
  content: string;
  cover_image_url: string | null;
  cover_image_alt: string | null;
  category: string;
  tags: string[];
  lang: "en" | "hi";
  status: "draft" | "published";
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface BlogPostMeta {
  slug: string;
  title: string;
  seoTitle?: string;
  excerpt: string;
  coverImage?: { url: string; alt: string };
  category: string;
  tags: string[];
  lang: "en" | "hi";
  publishedAt: string;
  updatedAt: string;
  readingMinutes: number;
}

export interface BlogPost extends BlogPostMeta {
  html: string;
  headings: { id: string; text: string }[];
}

const LIST_COLUMNS =
  "slug, title, seo_title, excerpt, content, cover_image_url, cover_image_alt, category, tags, lang, published_at, updated_at";

function toMeta(row: Omit<PostRow, "id" | "status" | "created_at">): BlogPostMeta {
  const cover = safeUrl(row.cover_image_url);
  return {
    slug: row.slug,
    title: row.title,
    seoTitle: row.seo_title || undefined,
    excerpt: row.excerpt,
    coverImage: cover ? { url: cover, alt: row.cover_image_alt || "" } : undefined,
    category: row.category,
    tags: row.tags ?? [],
    lang: row.lang === "hi" ? "hi" : "en",
    publishedAt: row.published_at ?? row.updated_at,
    updatedAt: row.updated_at,
    readingMinutes: readingMinutes(row.content),
  };
}

/** Published posts, newest first. Returns [] when Supabase isn't configured yet. */
export async function getPublishedPosts(limit?: number): Promise<BlogPostMeta[]> {
  const supabase = createPublicClient();
  if (!supabase) return [];
  let query = supabase
    .from("posts")
    .select(LIST_COLUMNS)
    .eq("status", "published")
    .lte("published_at", new Date().toISOString())
    .order("published_at", { ascending: false });
  if (limit) query = query.limit(limit);
  const { data, error } = await query;
  if (error) {
    console.error("[blog] could not load posts:", error.message);
    return [];
  }
  return (data ?? []).map(toMeta);
}

export async function getPublishedPost(slug: string): Promise<BlogPost | null> {
  if (!isValidSlug(slug)) return null;
  const supabase = createPublicClient();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("posts")
    .select(LIST_COLUMNS)
    .eq("slug", slug)
    .eq("status", "published")
    .lte("published_at", new Date().toISOString())
    .maybeSingle();
  if (error) {
    console.error(`[blog] could not load post "${slug}":`, error.message);
    return null;
  }
  if (!data) return null;
  return { ...toMeta(data), ...renderMarkdown(data.content) };
}

/** Dates on the blog are shown in Indian time, whatever the server's time zone. */
export function formatPostDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  });
}
