import Link from "next/link";
import { notFound } from "next/navigation";
import Breadcrumbs from "@/components/Breadcrumbs";
import Faq from "@/components/Faq";
import ImageTool from "@/components/ImageTool";
import JsonLd from "@/components/JsonLd";
import NoticeBox from "@/components/NoticeBox";
import { exams, formatDate, getExam } from "@/lib/exams";
import { examPresets } from "@/lib/presets";
import { pageMetadata } from "@/lib/seo";
import { absoluteUrl, siteConfig } from "@/lib/site";
import { getAllGuides } from "@/lib/guides";
import { docNoun, docSlug } from "@/lib/docs";

export const dynamicParams = false;

export function generateStaticParams() {
  return exams.map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const exam = getExam(slug);
  if (!exam) return {};
  const what = exam.livePhoto ? "Signature" : "Photo & Signature";
  const first = exam.docs[0];
  return pageMetadata({
    title: `${exam.name} ${what} Size 2026 & Resizer (${first.minKB}–${first.maxKB} KB)`,
    description: `${exam.name} 2026 upload sizes: ${exam.docs
      .map((d) => `${docNoun[d.kind].replace("Handwritten ", "").replace(" Impression", "").toLowerCase()} ${d.minKB}–${d.maxKB} KB`)
      .join(", ")}. Free size converter that runs in your browser.`,
    path: `/exams/${exam.slug}`,
  });
}

export default async function ExamPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const exam = getExam(slug);
  if (!exam) notFound();
  const path = `/exams/${exam.slug}`;
  const others = exams.filter((e) => e.slug !== exam.slug);
  const sameCategory = others.filter((e) => e.category === exam.category);
  const rest = others.filter((e) => e.category !== exam.category);
  const posts = getAllGuides().slice(0, 4);
  const title = `${exam.name} ${exam.livePhoto ? "Signature" : "Photo & Signature"} Size 2026`;

  return (
    <div className="shell py-8 sm:py-12">
      <Breadcrumbs items={[{ name: "Exams", href: "/exams" }, { name: exam.name, href: path }]} />

      <header className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
        <div className="max-w-3xl">
          <div className="flex flex-wrap items-center gap-3">
            <span className="stamp">{exam.category}</span>
            {exam.livePhoto && <span className="chip !cursor-default !border-ink !text-ink">● Live photo capture</span>}
          </div>
          <h1 className="mt-5 text-4xl font-extrabold leading-[1.05] text-ink sm:text-5xl">{title}</h1>
          <p className="mt-3 font-mono text-xs text-ink-3">
            {exam.fullName} · {exam.body}
          </p>
          <p className="mt-5 text-lg leading-relaxed text-ink-2">{exam.intro}</p>
        </div>
        <div className="card shrink-0 p-4 lg:w-56">
          <p className="label">Last checked</p>
          <p className="mt-1 font-display text-xl font-extrabold text-ink">{formatDate(exam.lastChecked)}</p>
          <a href={exam.officialSite} target="_blank" rel="noopener nofollow" className="mt-2 inline-block text-sm font-semibold text-pen underline underline-offset-2">
            Official website ↗
          </a>
        </div>
      </header>

      {/* spec sheet */}
      <section className="mt-10">
        <div className="card overflow-hidden">
          <div className="flex items-center justify-between border-b border-dashed border-line-2 bg-paper-2/60 px-5 py-3">
            <p className="font-mono text-[0.68rem] font-extrabold uppercase tracking-[0.16em] text-ink">{exam.name} · Upload specification</p>
            <p className="hidden font-mono text-[0.68rem] text-ink-3 sm:block">JPG / JPEG only</p>
          </div>
          <ul className="divide-y divide-dashed divide-line-2">
            {exam.docs.map((d) => (
              <li key={d.kind}>
                <Link href={`${path}/${docSlug[d.kind]}`} className="group grid items-center gap-2 px-5 py-4 transition hover:bg-paper/70 sm:grid-cols-[1.2fr_0.8fr_1.4fr_auto] sm:gap-6">
                  <span className="font-bold text-ink">{d.label}</span>
                  <span className="font-display text-2xl font-extrabold tabular-nums text-ink">
                    {d.minKB}–{d.maxKB}<span className="ml-1 text-sm text-ink-3">KB</span>
                  </span>
                  <span className="text-sm text-ink-2">{d.dimensionNote}{d.dpi ? ` ${d.dpi} DPI.` : ""}</span>
                  <span className="font-mono text-xs font-extrabold uppercase tracking-wider text-pen transition group-hover:translate-x-1">
                    {docNoun[d.kind]} guide →
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <NoticeBox>
          <strong className="text-ink">Check before you upload.</strong> These values are from the {exam.noticeRef}.
          Limits can change in a new notification, so confirm them on the{" "}
          <a href={exam.officialSite} target="_blank" rel="noopener nofollow" className="font-semibold text-pen underline">
            official website
          </a>
          .
        </NoticeBox>
      </section>

      <section className="mt-14">
        <p className="label">Resize</p>
        <h2 className="mt-1 text-3xl font-extrabold text-ink">Make your {exam.name} {exam.docs.length > 1 ? "files" : "file"} now</h2>
        {exam.livePhoto && (
          <p className="mt-2 max-w-2xl text-ink-2">
            Your photo is taken with the camera inside the {exam.name} form, so you only need to prepare the file below.
          </p>
        )}
        <div className="mt-6">
          <ImageTool presets={examPresets(exam.slug)} fileBaseName={exam.slug} captionMode={!!exam.captionDoc} />
        </div>
      </section>

      <section className="mt-16">
        <p className="label">Preparation</p>
        <h2 className="mt-1 text-3xl font-extrabold text-ink">How to prepare each file</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {exam.docs.map((d) => (
            <div key={d.kind} className="card p-6">
              <h3 className="text-xl font-bold text-ink">
                <Link href={`${path}/${docSlug[d.kind]}`} className="hover:text-pen">{d.label}</Link>
              </h3>
              <ul className="mt-3 space-y-2 text-ink-2">
                {d.tips.map((t) => (
                  <li key={t} className="flex gap-3">
                    <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-stamp" />
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-16 grid gap-8 lg:grid-cols-[1fr_1fr]">
        <div>
          <p className="label">Good to know</p>
          <h2 className="mt-1 text-3xl font-extrabold text-ink">Important notes</h2>
          <ol className="mt-6 space-y-4">
            {exam.notes.map((n, i) => (
              <li key={n} className="flex gap-4">
                <span className="font-display text-2xl font-extrabold text-line-2">{String(i + 1).padStart(2, "0")}</span>
                <span className="pt-1 leading-relaxed text-ink-2">{n}</span>
              </li>
            ))}
          </ol>
        </div>
        <div className="card p-6">
          <p className="label">Guides</p>
          <ul className="mt-3 divide-y divide-dashed divide-line-2">
            {posts.map((p) => (
              <li key={p.slug}>
                <Link href={`/guides/${p.slug}`} className="flex items-center justify-between gap-3 py-3 font-semibold text-ink hover:text-pen">
                  {p.title} <span aria-hidden="true" className="text-ink-3">→</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <Faq items={exam.faqs} title={`${exam.name} questions`} />

      <section className="mt-16">
        <p className="label">Other exams</p>
        <h2 className="mt-1 text-3xl font-extrabold text-ink">Applying to more than one?</h2>
        <div className="mt-6 flex flex-wrap gap-2">
          {[...sameCategory, ...rest].map((e) => (
            <Link key={e.slug} href={`/exams/${e.slug}`} className="chip">
              {e.name}
            </Link>
          ))}
        </div>
      </section>

      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: title,
          url: absoluteUrl(path),
          dateModified: exam.lastChecked,
          about: { "@type": "Thing", name: exam.fullName },
          publisher: { "@type": "Organization", name: siteConfig.name, url: siteConfig.url },
        }}
      />
    </div>
  );
}
