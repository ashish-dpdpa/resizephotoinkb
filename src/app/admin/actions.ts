"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getGuideSlugs } from "@/lib/guides";
import { safeUrl } from "@/lib/markdown";
import { isValidSlug } from "@/lib/slug";

export interface PostInput {
  id?: string;
  slug: string;
  title: string;
  seoTitle: string;
  excerpt: string;
  content: string;
  coverImageUrl: string;
  coverImageAlt: string;
  category: string;
  tags: string[];
  lang: "en" | "hi";
  status: "draft" | "published";
  /** ISO timestamp; empty = now when publishing. */
  publishedAt: string;
}

export type ActionResult<T = object> = ({ ok: true } & T) | { ok: false; error: string };

async function requireAdmin() {
  if (!isSupabaseConfigured) throw new Error("Supabase is not configured.");
  const session = await getAdminSession();
  if (!session.user) throw new Error("Your session has expired. Sign in again in a new tab, then save.");
  if (!session.isAdmin) throw new Error("This account is not an admin.");
  return session.supabase;
}

function refreshBlog(...slugs: (string | null | undefined)[]) {
  revalidatePath("/blog");
  revalidatePath("/sitemap.xml");
  for (const s of new Set(slugs)) if (s) revalidatePath(`/blog/${s}`);
}

function validate(input: PostInput): string | null {
  if (!input.title.trim()) return "Add a title.";
  if (input.title.length > 200) return "Title is too long (200 characters max).";
  if (!isValidSlug(input.slug)) return "The URL slug can only use lowercase letters, numbers and single hyphens.";
  if (getGuideSlugs().includes(input.slug)) return `A guide already uses /${input.slug}. Pick a different slug.`;
  if (input.seoTitle.length > 70) return "SEO title is too long (70 characters max).";
  if (input.excerpt.length > 300) return "Excerpt is too long (300 characters max).";
  if (!input.category.trim()) return "Add a category.";
  if (input.coverImageUrl && !safeUrl(input.coverImageUrl)) return "Cover image must be an https:// URL.";
  if (input.status === "published" && !input.excerpt.trim()) return "Add an excerpt before publishing. It's the description Google shows.";
  if (input.status === "published" && !input.content.trim()) return "The post is empty.";
  if (input.publishedAt && Number.isNaN(Date.parse(input.publishedAt))) return "The publish date isn't valid.";
  return null;
}

export async function savePost(input: PostInput): Promise<ActionResult<{ id: string; slug: string }>> {
  try {
    const supabase = await requireAdmin();
    const error = validate(input);
    if (error) return { ok: false, error };

    const row = {
      slug: input.slug,
      title: input.title.trim(),
      seo_title: input.seoTitle.trim() || null,
      excerpt: input.excerpt.trim(),
      content: input.content,
      cover_image_url: input.coverImageUrl.trim() || null,
      cover_image_alt: input.coverImageAlt.trim() || null,
      category: input.category.trim(),
      tags: [...new Set(input.tags.map((t) => t.trim().toLowerCase()).filter(Boolean))].slice(0, 12),
      lang: input.lang === "hi" ? "hi" : "en",
      status: input.status,
      published_at:
        input.status === "published"
          ? new Date(input.publishedAt || Date.now()).toISOString()
          : input.publishedAt
            ? new Date(input.publishedAt).toISOString()
            : null,
    };

    let previousSlug: string | null = null;
    let result;
    if (input.id) {
      const { data: prev } = await supabase.from("posts").select("slug").eq("id", input.id).maybeSingle();
      previousSlug = prev?.slug ?? null;
      result = await supabase.from("posts").update(row).eq("id", input.id).select("id, slug").single();
    } else {
      result = await supabase.from("posts").insert(row).select("id, slug").single();
    }

    if (result.error) {
      if (result.error.code === "23505") return { ok: false, error: `Another post already uses the slug "${input.slug}".` };
      return { ok: false, error: result.error.message };
    }

    refreshBlog(result.data.slug, previousSlug);
    revalidatePath("/admin");
    return { ok: true, id: result.data.id, slug: result.data.slug };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Something went wrong." };
  }
}

export async function deletePost(id: string): Promise<ActionResult> {
  try {
    const supabase = await requireAdmin();
    const { data, error } = await supabase.from("posts").delete().eq("id", id).select("slug").maybeSingle();
    if (error) return { ok: false, error: error.message };
    refreshBlog(data?.slug);
    revalidatePath("/admin");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Something went wrong." };
  }
}

export async function signOut() {
  if (isSupabaseConfigured) {
    const session = await getAdminSession();
    await session.supabase.auth.signOut();
  }
  redirect("/admin/login");
}
