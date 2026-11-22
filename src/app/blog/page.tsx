import Link from "next/link";
import Breadcrumbs from "@/components/Breadcrumbs";
import { getAllPosts } from "@/lib/blog";
import { formatDate } from "@/lib/exams";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Blog: Guides for Online Exam Application Forms",
  description:
    "Step-by-step guides on photo and signature requirements, image sizes, age limits and avoiding rejection in SSC, UPSC, banking, railway and NEET forms.",
  path: "/blog",
});

export default function BlogIndex() {
  const [lead, ...posts] = getAllPosts();
  return (
    <div className="shell py-8 sm:py-12">
      <Breadcrumbs items={[{ name: "Blog", href: "/blog" }]} />
      <header className="max-w-3xl">
        <p className="label text-stamp">The guides</p>
        <h1 className="mt-2 text-4xl font-extrabold leading-[1.05] text-ink sm:text-5xl">
          Get your form right <span className="marker">the first time</span>
        </h1>
        <p className="mt-4 text-lg text-ink-2">Short, tested advice on uploads, sizes and eligibility. No fluff.</p>
      </header>

      {lead && (
        <Link href={`/blog/${lead.slug}`} className="card card-link mt-10 grid gap-6 p-6 sm:p-8 md:grid-cols-[1fr_auto] md:items-end">
          <div>
            <p className="font-mono text-xs text-stamp">Latest · {lead.category}</p>
            <h2 className="mt-3 text-3xl font-extrabold leading-tight text-ink sm:text-4xl">{lead.title}</h2>
            <p className="mt-3 max-w-2xl text-lg text-ink-2">{lead.description}</p>
          </div>
          <p className="font-mono text-xs text-ink-3">
            <time dateTime={lead.date}>{formatDate(lead.date)}</time> · {lead.readingMinutes} min
          </p>
        </Link>
      )}

      <ul className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {posts.map((p) => (
          <li key={p.slug}>
            <Link href={`/blog/${p.slug}`} className="card card-link flex h-full flex-col p-6">
              <p className="font-mono text-xs text-stamp">{p.category}</p>
              <h2 className="mt-3 font-display text-xl font-bold leading-snug text-ink">{p.title}</h2>
              <p className="mt-2 line-clamp-3 text-sm text-ink-2">{p.description}</p>
              <p className="mt-auto pt-5 font-mono text-xs text-ink-3">
                <time dateTime={p.date}>{formatDate(p.date)}</time> · {p.readingMinutes} min
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
