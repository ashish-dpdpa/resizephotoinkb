import "server-only";
import { createClient } from "@supabase/supabase-js";
import { isSupabaseConfigured, supabaseKey, supabaseUrl } from "./config";

/**
 * Anonymous client for public pages. It never reads cookies, so /blog pages
 * stay statically rendered (ISR) instead of becoming per-request.
 * Row-level security limits it to published posts.
 */
export function createPublicClient() {
  if (!isSupabaseConfigured) return null;
  return createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}
