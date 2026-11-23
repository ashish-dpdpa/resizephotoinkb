import { notFound } from "next/navigation";
import PostEditor, { type EditorPost } from "@/components/admin/PostEditor";
import { getGuideSlugs } from "@/lib/guides";
import { getAdminSession } from "@/lib/supabase/server";
import { categoryOptions } from "../categories";

export const metadata = { title: { absolute: "Edit post · Admin" } };

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();

  const { supabase } = await getAdminSession();
  const { data: post } = await supabase
    .from("posts")
    .select("id, slug, title, seo_title, excerpt, content, cover_image_url, cover_image_alt, category, tags, lang, status, published_at, updated_at")
    .eq("id", id)
    .maybeSingle();
  if (!post) notFound();

  // key: remount the editor with fresh state when a different post is opened
  return (
    <PostEditor
      key={post.id}
      post={post as EditorPost}
      categories={await categoryOptions(supabase)}
      guideSlugs={getGuideSlugs()}
    />
  );
}
