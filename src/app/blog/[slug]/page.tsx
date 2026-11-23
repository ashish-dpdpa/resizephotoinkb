import Link from "next/link";
import { notFound } from "next/navigation";
import Breadcrumbs from "@/components/Breadcrumbs";
import JsonLd from "@/components/JsonLd";
import AdSlot from "@/components/AdSlot";
import { formatPostDate, getPublishedPost, getPublishedPosts } from "@/lib/blog";
import { pageMetadata } from "@/lib/seo";
import { absoluteUrl, siteConfig } from "@/lib/site";
import { tools } from "@/lib/tools";

export const revalidate = 300;
// Posts published after the last build are rendered on first visit, then cached.
export const dynamicParams = true;

export async function generateStaticParams() {
  return (await getPublishedPosts()).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPublishedPost(slug);
  if (!post) return {};
  const meta = pageMetadata({
    title: post.seoTitle ?? post.title,
    description: post.excerpt || post.title,
    path: `/blog/${post.slug}`,
    type: "article",
    publishedTime: post.publishedAt,
    modifiedTime: post.updatedAt,
  });
  // Use the post's own cover as the social card when it has one.
  if (post.coverImage) {
    const image = { url: post.coverImage.url, alt: post.coverImage.alt || post.title };
    meta.openGraph = { ...meta.openGraph, images: [image] };
    meta.twitter = { ...meta.twitter, images: [image.url] };
  }
  return meta;
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPublishedPost(slug);
  if (!post) notFound();
  const path = `/blog/${post.slug}`;
  const more = (await getPublishedPosts(4)).filter((p) => p.slug !== post.slug).slice(0, 3);
  const lang = post.lang === "hi" ? "hi" : undefined;
  const wasUpdated = new Date(post.updatedAt).getTime() - new Date(post.publishedAt).getTime() > 24 * 3600 * 1000;

  return (
    <div className="shell py-8 sm:py-12">
      <Breadcrumbs items={[{ name: "Blog", href: "/blog" }, { name: post.title, href: path }]} />
      <header className="mx-auto max-w-3xl text-center" lang={lang}>
        <p className="label text-stamp">{post.category}</p>
        <h1 className="mt-3 text-4xl font-extrabold leading-[1.08] text-ink sm:text-5xl">{post.title}</h1>
        {post.excerpt && <p className="mx-auto mt-5 max-w-2xl text-lg text-ink-2">{post.excerpt}</p>}
        <p className="mt-6 font-mono text-xs text-ink-3">
          {siteConfig.author.name} · <time dateTime={post.publishedAt}>{formatPostDate(post.publishedAt)}</time>
          {wasUpdated && (
            <> · Updated <time dateTime={post.updatedAt}>{formatPostDate(post.updatedAt)}</time></>
          )}
          {" "}· {post.readingMinutes} min read
        </p>
      </header>

      {post.coverImage ? (
        <figure className="mx-auto mt-10 max-w-5xl overflow-hidden rounded-[var(--radius-card)] border border-line bg-paper-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={post.coverImage.url} alt={post.coverImage.alt} className="max-h-[32rem] w-full object-cover" />
        </figure>
      ) : (
        <div className="cutline mx-auto mt-10 max-w-5xl" />
      )}

      <div className="mx-auto mt-10 grid max-w-5xl gap-12 lg:grid-cols-[220px_minmax(0,1fr)]">
        <aside className="order-2 space-y-6 lg:order-1 lg:sticky lg:top-24 lg:self-start">
          {post.headings.length > 2 && (
            <nav aria-label="Table of contents" className="hidden lg:block">
              <p className="label">In this post</p>
              <ol className="mt-3 space-y-2 border-l-2 border-line-2 text-sm">
                {post.headings.map((h) => (
                  <li key={h.id}>
                    <a href={`#${h.id}`} className="-ml-[2px] block border-l-2 border-transparent pl-3 text-ink-2 hover:border-ink hover:text-ink">{h.text}</a>
                  </li>
                ))}
              </ol>
            </nav>
          )}
          <div className="card p-4">
            <p className="label">Free tools</p>
            <ul className="mt-2 space-y-2 text-sm">
              {tools.slice(0, 4).map((t) => (
                <li key={t.href}>
                  <Link href={t.href} className="font-semibold text-ink hover:text-pen">{t.title} →</Link>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        <article className="order-1 min-w-0 lg:order-2" lang={lang}>
          <div
            className="prose prose-lg max-w-none prose-headings:scroll-mt-24 prose-headings:font-extrabold prose-table:text-base prose-img:rounded-xl"
            dangerouslySetInnerHTML={{ __html: post.html }}
          />

          {post.tags.length > 0 && (
            <ul className="mt-10 flex flex-wrap gap-2" aria-label="Tags">
              {post.tags.map((t) => (
                <li key={t} className="rounded-full border border-line-2 px-3 py-1 font-mono text-xs text-ink-2">#{t}</li>
              ))}
            </ul>
          )}

          <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_ARTICLE} />

          <div className="card mt-12 flex gap-4 p-5">
            <span aria-hidden="true" className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-ink font-display text-lg font-extrabold text-card">
              {siteConfig.name.charAt(0)}
            </span>
            <div>
              <p className="font-bold text-ink">{siteConfig.author.name}</p>
              <p className="mt-1 text-sm text-ink-2">{siteConfig.author.bio}</p>
            </div>
          </div>
        </article>
      </div>

      {more.length > 0 && (
        <section className="mx-auto mt-16 max-w-5xl">
          <p className="label">More from the blog</p>
          <ul className="mt-4 grid gap-4 md:grid-cols-3">
            {more.map((p) => (
              <li key={p.slug}>
                <Link href={`/blog/${p.slug}`} className="card card-link flex h-full flex-col p-5">
                  <span className="font-mono text-xs text-stamp">{p.category}</span>
                  <span className="mt-2 font-display text-lg font-bold leading-snug text-ink">{p.title}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          headline: post.title,
          description: post.excerpt || undefined,
          datePublished: post.publishedAt,
          dateModified: post.updatedAt,
          mainEntityOfPage: absoluteUrl(path),
          ...(post.coverImage ? { image: post.coverImage.url } : {}),
          author: { "@type": "Organization", name: siteConfig.author.name, url: absoluteUrl("/about") },
          publisher: { "@type": "Organization", name: siteConfig.name, url: siteConfig.url },
          keywords: post.tags.join(", ") || undefined,
          inLanguage: post.lang === "hi" ? "hi-IN" : "en-IN",
        }}
      />
    </div>
  );
}
