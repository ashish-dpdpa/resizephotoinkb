import Link from "next/link";
import { getAdminSession } from "@/lib/supabase/server";
import { formatPostDate } from "@/lib/blog";
import DeletePostButton from "@/components/admin/DeletePostButton";

type Filter = "all" | "published" | "scheduled" | "draft";

interface ListRow {
  id: string;
  slug: string;
  title: string;
  category: string;
  status: "draft" | "published";
  published_at: string | null;
  updated_at: string;
}

function stateOf(p: ListRow, now: number): Exclude<Filter, "all"> {
  if (p.status === "draft") return "draft";
  return p.published_at && new Date(p.published_at).getTime() > now ? "scheduled" : "published";
}

const BADGE: Record<Exclude<Filter, "all">, string> = {
  published: "bg-ok-50 text-ok",
  scheduled: "bg-pen-50 text-pen",
  draft: "bg-paper-2 text-ink-2",
};

export default async function AdminPosts({ searchParams }: { searchParams: Promise<{ status?: string; q?: string }> }) {
  const { status, q } = await searchParams;
  const filter: Filter = status === "published" || status === "scheduled" || status === "draft" ? status : "all";
  const query = (q ?? "").trim().toLowerCase();

  const { supabase } = await getAdminSession();
  const { data, error } = await supabase
    .from("posts")
    .select("id, slug, title, category, status, published_at, updated_at")
    .order("updated_at", { ascending: false });

  const now = Date.now();
  const all = (data ?? []) as ListRow[];
  const counts = { all: all.length, published: 0, scheduled: 0, draft: 0 };
  for (const p of all) counts[stateOf(p, now)]++;
  const rows = all.filter(
    (p) =>
      (filter === "all" || stateOf(p, now) === filter) &&
      (!query || p.title.toLowerCase().includes(query) || p.slug.includes(query)),
  );

  const tabs: { id: Filter; label: string }[] = [
    { id: "all", label: "All" },
    { id: "published", label: "Published" },
    { id: "scheduled", label: "Scheduled" },
    { id: "draft", label: "Drafts" },
  ];

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="label">Blog</p>
          <h1 className="mt-1 text-3xl font-extrabold text-ink">Posts</h1>
        </div>
        <Link href="/admin/posts/new" className="btn btn-pen">+ New post</Link>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Filter posts">
          {tabs.map((t) => (
            <Link
              key={t.id}
              href={{ pathname: "/admin", query: { ...(t.id !== "all" && { status: t.id }), ...(query && { q: query }) } }}
              role="tab"
              aria-selected={filter === t.id}
              className="chip"
            >
              {t.label} <span className="font-mono text-xs opacity-70">{counts[t.id]}</span>
            </Link>
          ))}
        </div>
        <form className="w-full sm:w-72">
          {filter !== "all" && <input type="hidden" name="status" value={filter} />}
          <input type="search" name="q" defaultValue={q} placeholder="Search titles…" aria-label="Search posts" className="field !font-sans !text-sm" />
        </form>
      </div>

      {error && (
        <p role="alert" className="card mt-6 border-stamp p-4 text-sm text-stamp">
          Could not load posts: {error.message}. Did you run <code>supabase/schema.sql</code>?
        </p>
      )}

      {!error && rows.length === 0 ? (
        <div className="card mt-6 p-10 text-center">
          <p className="text-lg text-ink-2">{all.length === 0 ? "No posts yet. Write the first one." : "No posts match."}</p>
          {all.length === 0 && <Link href="/admin/posts/new" className="btn btn-ink mt-5">Write a post</Link>}
        </div>
      ) : (
        <div className="card mt-6 overflow-hidden">
          <ul className="divide-y divide-line">
            {rows.map((p) => {
              const state = stateOf(p, now);
              return (
                <li key={p.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:gap-6 sm:px-5">
                  <div className="min-w-0 flex-1">
                    <Link href={`/admin/posts/${p.id}`} className="font-display text-lg font-bold leading-snug text-ink hover:text-pen">
                      {p.title || "(untitled)"}
                    </Link>
                    <p className="mt-1 truncate font-mono text-xs text-ink-3">
                      /blog/{p.slug} · {p.category}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 text-sm sm:w-[22rem] sm:justify-end">
                    <span className={`rounded-full px-2.5 py-1 font-mono text-[0.68rem] font-bold uppercase tracking-wider ${BADGE[state]}`}>
                      {state}
                    </span>
                    <span className="mr-auto text-xs text-ink-3 sm:mr-0">
                      {state === "draft" ? `Edited ${formatPostDate(p.updated_at)}` : formatPostDate(p.published_at!)}
                    </span>
                    {state === "published" && (
                      <Link href={`/blog/${p.slug}`} target="_blank" className="font-semibold text-ink-2 hover:text-ink">View</Link>
                    )}
                    <Link href={`/admin/posts/${p.id}`} className="font-semibold text-pen">Edit</Link>
                    <DeletePostButton id={p.id} title={p.title} />
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </>
  );
}
