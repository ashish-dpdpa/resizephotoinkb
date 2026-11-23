import Link from "next/link";
import { notFound } from "next/navigation";
import Breadcrumbs from "@/components/Breadcrumbs";
import JsonLd from "@/components/JsonLd";
import AdSlot from "@/components/AdSlot";
import { getAllGuides, getGuide } from "@/lib/guides";
import { formatDate } from "@/lib/exams";
import { pageMetadata } from "@/lib/seo";
import { absoluteUrl, siteConfig } from "@/lib/site";
import { tools } from "@/lib/tools";

export const dynamicParams = false;

export function generateStaticParams() {
  return getAllGuides().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getGuide(slug);
  if (!post) return {};
  return pageMetadata({
    title: post.seoTitle ?? post.title,
    description: post.description,
    path: `/guides/${post.slug}`,
    type: "article",
    publishedTime: post.date,
    modifiedTime: post.updated ?? post.date,
  });
}

export default async function GuidePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getGuide(slug);
  if (!post) notFound();
  const path = `/guides/${post.slug}`;
  const more = getAllGuides().filter((p) => p.slug !== post.slug).slice(0, 3);

  return (
    <div className="shell py-8 sm:py-12">
      <Breadcrumbs items={[{ name: "Guides", href: "/guides" }, { name: post.title, href: path }]} />
      <header className="mx-auto max-w-3xl text-center" lang={post.lang === "hi" ? "hi" : undefined}>
        <p className="label text-stamp">{post.category}</p>
        <h1 className="mt-3 text-4xl font-extrabold leading-[1.08] text-ink sm:text-5xl">{post.title}</h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg text-ink-2">{post.description}</p>
        <p className="mt-6 font-mono text-xs text-ink-3">
          {siteConfig.author.name} · <time dateTime={post.date}>{formatDate(post.date)}</time>
          {post.updated && post.updated !== post.date && (
            <> · Updated <time dateTime={post.updated}>{formatDate(post.updated)}</time></>
          )}
          {" "}· {post.readingMinutes} min read
        </p>
      </header>

      <div className="cutline mx-auto mt-10 max-w-5xl" />

      <div className="mx-auto mt-10 grid max-w-5xl gap-12 lg:grid-cols-[220px_minmax(0,1fr)]">
        <aside className="order-2 space-y-6 lg:order-1 lg:sticky lg:top-24 lg:self-start">
          {post.headings.length > 2 && (
            <nav aria-label="Table of contents" className="hidden lg:block">
              <p className="label">In this guide</p>
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

        <article className="order-1 min-w-0 lg:order-2" lang={post.lang === "hi" ? "hi" : undefined}>
          <div
            className="prose prose-lg max-w-none prose-headings:scroll-mt-24 prose-headings:font-extrabold prose-table:text-base"
            dangerouslySetInnerHTML={{ __html: post.html }}
          />

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
          <p className="label">Read next</p>
          <ul className="mt-4 grid gap-4 md:grid-cols-3">
            {more.map((p) => (
              <li key={p.slug}>
                <Link href={`/guides/${p.slug}`} className="card card-link flex h-full flex-col p-5">
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
          "@type": "Article",
          headline: post.title,
          description: post.description,
          datePublished: post.date,
          dateModified: post.updated ?? post.date,
          mainEntityOfPage: absoluteUrl(path),
          author: { "@type": "Organization", name: siteConfig.author.name, url: absoluteUrl("/about") },
          publisher: { "@type": "Organization", name: siteConfig.name, url: siteConfig.url },
          keywords: post.tags.join(", "),
          inLanguage: post.lang === "hi" ? "hi-IN" : "en-IN",
        }}
      />
    </div>
  );
}
