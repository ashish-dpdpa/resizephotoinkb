import type { SupabaseClient } from "@supabase/supabase-js";

const DEFAULT_CATEGORIES = ["News", "Exam notices", "Form updates", "Admit cards", "Results", "Tips"];

/** Category suggestions for the editor: the defaults plus any already in use. */
export async function categoryOptions(supabase: SupabaseClient): Promise<string[]> {
  const { data } = await supabase.from("posts").select("category");
  const used = (data ?? []).map((r: { category: string }) => r.category);
  return [...new Set([...DEFAULT_CATEGORIES, ...used])].sort((a, b) => a.localeCompare(b));
}
