import PostEditor from "@/components/admin/PostEditor";
import { getGuideSlugs } from "@/lib/guides";
import { getAdminSession } from "@/lib/supabase/server";
import { categoryOptions } from "../categories";

export const metadata = { title: { absolute: "New post · Admin" } };

export default async function NewPostPage() {
  const { supabase } = await getAdminSession();
  return <PostEditor categories={await categoryOptions(supabase)} guideSlugs={getGuideSlugs()} />;
}
