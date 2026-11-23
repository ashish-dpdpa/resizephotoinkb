"use client";

import { getBrowserClient } from "./browser";
import { BLOG_IMAGES_BUCKET } from "./config";

const MAX_WIDTH = 1600;
const MAX_BYTES = 5 * 1024 * 1024; // matches the bucket limit in supabase/schema.sql

/** Downscale to MAX_WIDTH and re-encode as WebP. GIFs are kept as-is so animation survives. */
async function optimise(file: File): Promise<Blob> {
  if (file.type === "image/gif") return file;
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_WIDTH / bitmap.width);
  const w = Math.round(bitmap.width * scale);
  const h = Math.round(bitmap.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, w, h);
  bitmap.close();
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/webp", 0.85));
  // Very old browsers can't encode WebP; fall back to the original file.
  return blob && blob.type === "image/webp" ? blob : file;
}

/** Uploads an image to the blog bucket and returns its public URL. */
export async function uploadBlogImage(file: File, slugHint: string): Promise<string> {
  if (!file.type.startsWith("image/")) throw new Error("That file isn't an image.");
  const blob = await optimise(file);
  if (blob.size > MAX_BYTES) throw new Error("Image is over 5 MB even after compression. Try a smaller one.");

  const ext = blob.type === "image/webp" ? "webp" : (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "");
  const now = new Date();
  const base = slugHint.replace(/[^a-z0-9-]/g, "").slice(0, 50) || "image";
  const path = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, "0")}/${base}-${crypto.randomUUID().slice(0, 8)}.${ext}`;

  const supabase = getBrowserClient();
  const { error } = await supabase.storage.from(BLOG_IMAGES_BUCKET).upload(path, blob, {
    contentType: blob.type || file.type,
    cacheControl: "31536000",
    upsert: false,
  });
  if (error) throw new Error(`Upload failed: ${error.message}`);
  return supabase.storage.from(BLOG_IMAGES_BUCKET).getPublicUrl(path).data.publicUrl;
}
