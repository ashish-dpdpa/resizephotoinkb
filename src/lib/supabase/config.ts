// Supabase settings come from env vars (see .env.example). Until they are set,
// the blog shows an empty state and /admin shows setup instructions.

export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
// Supabase's newer "publishable" key (sb_publishable_...) and the legacy anon key both work.
export const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseKey);

/** Storage bucket for cover and in-post images (created by supabase/schema.sql). */
export const BLOG_IMAGES_BUCKET = "blog-images";
