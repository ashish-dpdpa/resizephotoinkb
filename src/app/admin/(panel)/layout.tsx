import Link from "next/link";
import { redirect } from "next/navigation";
import Logo from "@/components/Logo";
import SetupNotice from "@/components/admin/SetupNotice";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getAdminSession } from "@/lib/supabase/server";
import { signOut } from "../actions";

export const dynamic = "force-dynamic";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  if (!isSupabaseConfigured) return <SetupNotice />;

  const { user, isAdmin } = await getAdminSession();
  if (!user) redirect("/admin/login");

  if (!isAdmin) {
    return (
      <div className="grid min-h-screen place-items-center px-4">
        <div className="card max-w-md p-8 text-center">
          <span className="stamp">No access</span>
          <h1 className="mt-6 text-2xl font-extrabold text-ink">This account isn&rsquo;t an admin</h1>
          <p className="mt-3 text-ink-2">
            You&rsquo;re signed in as <b>{user.email}</b>, but the admin login is the one set in{" "}
            <code>ADMIN_EMAIL</code> in <code>.env</code>. Sign out and use that one.
          </p>
          <form action={signOut} className="mt-6">
            <button className="btn btn-ghost">Sign out</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-line bg-ink text-card">
        <div className="mx-auto flex h-14 max-w-7xl items-center gap-4 px-4 sm:px-6">
          <Link href="/admin" className="flex items-center gap-2">
            <Logo />
            <span className="font-display text-lg font-extrabold">Blog admin</span>
          </Link>
          <nav aria-label="Admin" className="ml-2 hidden items-center gap-1 text-sm font-semibold sm:flex">
            <Link href="/admin" className="rounded-full px-3 py-1.5 text-card/75 hover:bg-card/10 hover:text-card">Posts</Link>
            <Link href="/admin/posts/new" className="rounded-full px-3 py-1.5 text-card/75 hover:bg-card/10 hover:text-card">New post</Link>
            <Link href="/blog" target="_blank" className="rounded-full px-3 py-1.5 text-card/75 hover:bg-card/10 hover:text-card">View blog ↗</Link>
          </nav>
          <div className="ml-auto flex items-center gap-3 text-sm">
            <span className="hidden max-w-[16rem] truncate text-card/60 md:inline">{user.email}</span>
            <form action={signOut}>
              <button className="rounded-full border border-card/30 px-3 py-1.5 font-semibold hover:bg-card hover:text-ink">Sign out</button>
            </form>
          </div>
        </div>
      </header>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">{children}</div>
    </>
  );
}
