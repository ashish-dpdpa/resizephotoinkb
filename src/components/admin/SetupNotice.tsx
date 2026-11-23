export default function SetupNotice() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <div className="card p-6 sm:p-8">
        <span className="stamp">Not connected</span>
        <h1 className="mt-6 text-3xl font-extrabold text-ink">Connect Supabase to use the admin panel</h1>
        <p className="mt-3 text-ink-2">
          The blog stores posts and images in Supabase. Until it&rsquo;s connected, <code>/blog</code> shows a
          &ldquo;coming soon&rdquo; message and this panel stays locked.
        </p>
        <ol className="mt-6 list-decimal space-y-3 pl-5 text-ink-2 marker:font-mono marker:text-ink-3">
          <li>Create a project at supabase.com.</li>
          <li>
            Put these in <code>.env</code> (Project Settings → API, and Connect → Session pooler):
            <pre className="mt-2 overflow-x-auto rounded-lg bg-ink p-3 text-xs text-card">
{`NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
DATABASE_URL=postgresql://postgres.xxxx:...@...pooler.supabase.com:5432/postgres
ADMIN_EMAIL=admin@yourdomain.com
ADMIN_PASSWORD=at-least-6-characters-12-recommended`}
            </pre>
          </li>
          <li>
            Run <code>npm run db:setup</code>. It creates the tables, security rules, image bucket and your admin login.
          </li>
          <li>Restart the dev server and sign in at <code>/admin/login</code>.</li>
        </ol>
      </div>
    </div>
  );
}
