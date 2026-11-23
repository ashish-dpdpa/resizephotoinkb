import Link from "next/link";
import Breadcrumbs from "@/components/Breadcrumbs";
import { formatPostDate, getPublishedPosts, type BlogPostMeta } from "@/lib/blog";
import { pageMetadata } from "@/lib/seo";

// Rebuilt in the background at most every 5 minutes; saving in /admin refreshes it immediately.
export const revalidate = 300;

export const metadata = pageMetadata({
  title: "Blog: Exam Form News, Notices and Updates",
  description:
    "News and updates on exam application forms: new notices, changed photo and signature rules, deadlines and portal changes for SSC, UPSC, banking, railway and state exams.",
  path: "/blog",
});

export default async function BlogIndex() {
  const [lead, ...posts] = await getPublishedPosts();

  return (
    <div className="shell py-8 sm:py-12">
      <Breadcrumbs items={[{ name: "Blog", href: "/blog" }]} />
      <header className="max-w-3xl">
        <p className="label text-stamp">The blog</p>
        <h1 className="mt-2 text-4xl font-extrabold leading-[1.05] text-ink sm:text-5xl">
          What changed on the <span className="marker">forms</span> this week
        </h1>
        <p className="mt-4 text-lg text-ink-2">
          New notices, changed upload rules and portal updates. For step-by-step how-tos, see the{" "}
          <Link href="/guides" className="font-semibold text-pen underline underline-offset-4">guides</Link>.
        </p>
      </header>

      {!lead ? (
        <div className="card mt-10 p-8 text-center sm:p-12">
          <span className="stamp">Coming soon</span>
          <p className="mx-auto mt-6 max-w-md text-lg text-ink-2">
            No posts yet. Meanwhile, our guides cover photo sizes, signatures and the most common rejection reasons.
          </p>
          <Link href="/guides" className="btn btn-ink mt-6">Read the guides</Link>
        </div>
      ) : (
        <>
          <Link
            href={`/blog/${lead.slug}`}
            className="card card-link mt-10 grid overflow-hidden md:grid-cols-[1.1fr_1fr]"
            lang={lead.lang === "hi" ? "hi" : undefined}
          >
            {lead.coverImage && (
              <Cover post={lead} className="aspect-[16/9] md:order-2 md:aspect-auto md:h-full" priority />
            )}
            <div className={`flex flex-col p-6 sm:p-8 ${lead.coverImage ? "" : "md:col-span-2"}`}>
              <p className="font-mono text-xs text-stamp">Latest · {lead.category}</p>
              <h2 className="mt-3 text-3xl font-extrabold leading-tight text-ink sm:text-4xl">{lead.title}</h2>
              {lead.excerpt && <p className="mt-3 max-w-2xl text-lg text-ink-2">{lead.excerpt}</p>}
              <p className="mt-auto pt-6 font-mono text-xs text-ink-3">
                <time dateTime={lead.publishedAt}>{formatPostDate(lead.publishedAt)}</time> · {lead.readingMinutes} min
              </p>
            </div>
          </Link>

          {posts.length > 0 && (
            <ul className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {posts.map((p) => (
                <li key={p.slug} lang={p.lang === "hi" ? "hi" : undefined}>
                  <Link href={`/blog/${p.slug}`} className="card card-link flex h-full flex-col overflow-hidden">
                    {p.coverImage && <Cover post={p} className="aspect-[16/9]" />}
                    <div className="flex flex-1 flex-col p-6">
                      <p className="font-mono text-xs text-stamp">{p.category}</p>
                      <h2 className="mt-3 font-display text-xl font-bold leading-snug text-ink">{p.title}</h2>
                      {p.excerpt && <p className="mt-2 line-clamp-3 text-sm text-ink-2">{p.excerpt}</p>}
                      <p className="mt-auto pt-5 font-mono text-xs text-ink-3">
                        <time dateTime={p.publishedAt}>{formatPostDate(p.publishedAt)}</time> · {p.readingMinutes} min
                      </p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}

function Cover({ post, className, priority }: { post: BlogPostMeta; className: string; priority?: boolean }) {
  if (!post.coverImage) return null;
  return (
    <div className={`overflow-hidden bg-paper-2 ${className}`}>
      {/* Images live in Supabase Storage and are already resized on upload. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={post.coverImage.url}
        alt={post.coverImage.alt}
        className="h-full w-full object-cover"
        loading={priority ? "eager" : "lazy"}
        decoding="async"
      />
    </div>
  );
}
