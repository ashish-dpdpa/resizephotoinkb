import Link from "next/link";
import { redirect } from "next/navigation";
import Logo from "@/components/Logo";
import BrandName from "@/components/BrandName";
import LoginForm from "@/components/admin/LoginForm";
import SetupNotice from "@/components/admin/SetupNotice";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getAdminSession } from "@/lib/supabase/server";

export const metadata = { title: { absolute: "Sign in · Admin" } };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  if (!isSupabaseConfigured) return <SetupNotice />;

  const { next } = await searchParams;
  // Only allow redirects back into the admin panel.
  const target = next && next.startsWith("/admin/") && !next.startsWith("//") ? next : "/admin";

  const { user } = await getAdminSession();
  if (user) redirect(target);

  return (
    <div className="grid min-h-screen place-items-center px-4 py-12">
      <div className="w-full max-w-sm">
        <Link href="/" className="mb-6 flex items-center justify-center gap-2.5">
          <Logo />
          <BrandName className="text-xl" />
        </Link>
        <div className="card p-6 sm:p-8">
          <p className="label text-stamp">Admin</p>
          <h1 className="mt-1 text-2xl font-extrabold text-ink">Sign in to the blog</h1>
          <LoginForm next={target} />
        </div>
        <p className="mt-6 text-center text-sm text-ink-3">
          <Link href="/blog" className="hover:text-ink">← Back to the blog</Link>
        </p>
      </div>
    </div>
  );
}
