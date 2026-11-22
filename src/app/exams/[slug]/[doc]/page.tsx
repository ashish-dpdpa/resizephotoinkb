import Link from "next/link";
import { notFound } from "next/navigation";
import Breadcrumbs from "@/components/Breadcrumbs";
import Faq from "@/components/Faq";
import ImageTool from "@/components/ImageTool";
import JsonLd from "@/components/JsonLd";
import NoticeBox from "@/components/NoticeBox";
import { allDocPages, compressSizeFor, docGuide, docNoun, getDocPage } from "@/lib/docs";
import { formatDate } from "@/lib/exams";
import { pageMetadata } from "@/lib/seo";
import { absoluteUrl, siteConfig } from "@/lib/site";
import { rangePages } from "@/lib/sizePages";

export const dynamicParams = false;

/** One practical question per kind of upload. */
const kindFaq: Record<string, { q: string; a: string }> = {
  photo: {
    q: "Can I take the photo on my phone?",
    a: "Yes. Stand against a plain light wall facing a window, hold the phone at eye level, and keep your face straight. If the wall isn't plain, switch on White background in the tool.",
  },
  postcard: {
    q: "Does the postcard photo need my name on it?",
    a: "Usually yes: your name and the date the photo was taken, printed at the bottom. Switch on “Name & date under photo” in the tool to add them.",
  },
  signature: {
    q: "Can I sign in capital letters?",
    a: "Better not. Most notices, SSC and banking in particular, reject signatures written in capitals. Sign the way you normally do, because you'll sign the same way in the exam hall.",
  },
  thumb: {
    q: "Left thumb or right thumb?",
    a: "Follow the notice. Most forms ask for the left thumb. Use a stamp pad lightly so the ridges show instead of a solid smudge.",
  },
  declaration: {
    q: "Can I type the declaration instead of writing it?",
    a: "No. It has to be in your own handwriting, in English and not in capital letters, copied word for word from the notice.",
  },
};

export function generateStaticParams() {
  return allDocPages().map((p) => ({ slug: p.exam.slug, doc: p.slug }));
}

type Params = Promise<{ slug: string; doc: string }>;

export async function generateMetadata({ params }: { params: Params }) {
  const { slug, doc } = await params;
  const page = getDocPage(slug, doc);
  if (!page) return {};
  const { exam, doc: d } = page;
  const noun = docNoun[d.kind];
  return pageMetadata({
    title: `${exam.name} ${noun.replace("Handwritten ", "")} Resizer: ${d.minKB}–${d.maxKB} KB, ${d.width}×${d.height} px`,
    description: `${exam.name} ${noun.toLowerCase()} size: ${d.minKB}–${d.maxKB} KB JPG, ${d.width} × ${d.height} px. Free ${noun.toLowerCase()} resizer and size converter. Nothing is uploaded.`,
    path: page.path,
  });
}

export default async function DocPage({ params }: { params: Params }) {
  const { slug, doc } = await params;
  const page = getDocPage(slug, doc);
  if (!page) notFound();
  const { exam, doc: d } = page;
  const noun = docNoun[d.kind];
  const guide = docGuide[d.kind];
  const all = allDocPages();
  const siblings = all.filter((p) => p.exam.slug === exam.slug && p.slug !== page.slug);
  const sameKind = all.filter((p) => p.doc.kind === d.kind);
  const compressKB = compressSizeFor(d.maxKB);
  const rangePage = rangePages.find((r) => r.minKB === d.minKB && Math.abs(r.maxKB - d.maxKB) <= 1);
  const title = `${exam.name} ${noun} Size 2026`;
  const isInk = d.kind === "signature" || d.kind === "thumb" || d.kind === "declaration";

  // FAQ built from this exam's own data, not a fixed template: the size question,
  // the exam's own questions about this document, and one question about this kind of upload.
  const nounLower = noun.toLowerCase();
  const kindWord = d.kind === "postcard" ? "postcard" : d.kind === "declaration" ? "declaration" : d.kind === "thumb" ? "thumb" : nounLower;
  const examFaqs = exam.faqs.filter((f) => f.q.toLowerCase().includes(kindWord));
  const faqs = [
    ...(examFaqs.some((f) => /size|kb/i.test(f.q))
      ? []
      : [
          {
            q: `What is the ${exam.name} ${nounLower} size?`,
            a: `${d.minKB} to ${d.maxKB} KB as a JPG, according to the ${exam.noticeRef}. ${d.dimensionNote}`,
          },
        ]),
    ...examFaqs,
    ...(d.minKB >= 15
      ? [
          {
            q: `Why does the form say my ${nounLower} is too small?`,
            a: `${exam.name} wants at least ${d.minKB} KB, and a small, clean image often comes out well below that. The tool here pads the file up to ${d.minKB} KB without changing the picture.`,
          },
        ]
      : []),
    ...(exam.livePhoto && d.kind === "signature" && !examFaqs.some((f) => /photo/i.test(f.q))
      ? [
          {
            q: `Do I also upload a photo for ${exam.name}?`,
            a: `No. The photo is taken live with your camera while you fill the form, so the signature is the only image to prepare.`,
          },
        ]
      : []),
    kindFaq[d.kind],
  ];

  // Intro that changes with the facts of this upload instead of one sentence for every page.
  const introBits = [
    `${exam.name} asks for the ${d.label.toLowerCase()} as a JPG between ${d.minKB} and ${d.maxKB} KB.`,
    d.minKB >= 15 ? `That minimum is higher than on most forms, so files that are too small get rejected as often as big ones.` : "",
    d.dpi ? `It should also carry ${d.dpi} DPI, which the tool writes into the file for you.` : "",
    exam.livePhoto && d.kind === "signature" ? `Your photo is captured live in the form, so this is the one image you need ready beforehand.` : "",
    isInk ? `Photograph it on white paper and the tool will clean the background to pure white.` : `Add your photo below, line up your face, and download when the meter turns green.`,
  ].filter(Boolean);

  const facts: [string, string][] = [
    ["File size", `${d.minKB}–${d.maxKB} KB`],
    ["Pixels", `${d.width} × ${d.height}`],
    ["Format", "JPG"],
    ["DPI", d.dpi ? String(d.dpi) : "—"],
  ];

  return (
    <div className="shell py-8 sm:py-12">
      <Breadcrumbs
        items={[
          { name: "Exams", href: "/exams" },
          { name: exam.name, href: `/exams/${exam.slug}` },
          { name: `${noun} size`, href: page.path },
        ]}
      />

      <header className="max-w-3xl">
        <p className="label text-stamp">{exam.name} · {noun}</p>
        <h1 className="mt-2 text-4xl font-extrabold leading-[1.05] text-ink sm:text-5xl">
          {title}: <span className="marker whitespace-nowrap">{d.minKB}–{d.maxKB} KB</span>
        </h1>
        <p className="mt-5 text-lg leading-relaxed text-ink-2">{introBits.join(" ")}</p>
      </header>

      <dl className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {facts.map(([k, v]) => (
          <div key={k} className="card px-4 py-3">
            <dt className="label">{k}</dt>
            <dd className="mt-1 font-display text-2xl font-extrabold tabular-nums text-ink">{v}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-8">
        <ImageTool
          presets={[
            {
              id: page.path,
              label: `${exam.name} ${noun.toLowerCase()}`,
              width: d.width,
              height: d.height,
              minKB: d.minKB,
              maxKB: d.maxKB,
              dpi: d.dpi,
              signature: isInk,
            },
          ]}
          fileBaseName={`${exam.slug}-${d.kind}`}
          captionMode={exam.captionDoc === d.kind}
        />
      </div>

      <NoticeBox>
        <strong className="text-ink">Source:</strong> {exam.noticeRef}, checked {formatDate(exam.lastChecked)}. {d.dimensionNote}{" "}
        Requirements can change, so confirm them on the{" "}
        <a href={exam.officialSite} target="_blank" rel="noopener nofollow" className="font-semibold text-pen underline">
          official {exam.body} website
        </a>{" "}
        before submitting.
      </NoticeBox>

      <section className="mt-16 grid gap-4 md:grid-cols-2">
        <div className="card p-6">
          <p className="label">Before you start</p>
          <h2 className="mt-1 text-2xl font-extrabold text-ink">How to prepare your {noun.toLowerCase()}</h2>
          <ol className="mt-4 space-y-3">
            {guide.prepare.map((s, i) => (
              <li key={s} className="flex gap-3 text-ink-2">
                <span className="font-mono text-xs font-extrabold text-stamp">{String(i + 1).padStart(2, "0")}</span>
                <span>{s}</span>
              </li>
            ))}
          </ol>
        </div>
        <div className="card p-6">
          <p className="label">{exam.name} rules</p>
          <h2 className="mt-1 text-2xl font-extrabold text-ink">What {exam.name} specifically asks</h2>
          <ul className="mt-4 space-y-3">
            {d.tips.map((t) => (
              <li key={t} className="flex gap-3 text-ink-2">
                <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-stamp" />
                <span>{t}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mt-16">
        <p className="label">Avoid these</p>
        <h2 className="mt-1 text-3xl font-extrabold text-ink">Mistakes that get it rejected</h2>
        <ul className="mt-6 grid gap-3 sm:grid-cols-2">
          {guide.mistakes.map((m) => (
            <li key={m} className="flex items-start gap-3 rounded-xl border border-stamp/25 bg-stamp-50/60 px-4 py-3 text-ink-2">
              <span aria-hidden="true" className="font-mono font-extrabold text-stamp">✗</span>
              <span>{m}</span>
            </li>
          ))}
        </ul>
      </section>

      {sameKind.length > 1 && (
        <section className="mt-16">
          <p className="label">Compare</p>
          <h2 className="mt-1 text-3xl font-extrabold text-ink">{noun} size in other exams</h2>
          <p className="mt-2 max-w-2xl text-ink-2">The limits differ, so prepare a separate file for each exam you apply to.</p>
          <div className="card mt-6 overflow-x-auto">
            <table className="spec-table w-full min-w-[520px] text-sm">
              <thead>
                <tr>
                  <th>Exam</th>
                  <th>File size</th>
                  <th>Preset size</th>
                </tr>
              </thead>
              <tbody>
                {sameKind.map((p) => (
                  <tr key={p.path} className={p.path === page.path ? "bg-[#fff9d6]" : ""}>
                    <td>
                      {p.path === page.path ? (
                        <strong>{p.exam.name} (this page)</strong>
                      ) : (
                        <Link href={p.path} className="font-semibold text-pen hover:underline">{p.exam.name}</Link>
                      )}
                    </td>
                    <td className="font-mono">{p.doc.minKB}–{p.doc.maxKB} KB</td>
                    <td className="font-mono">{p.doc.width} × {p.doc.height} px</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <Faq items={faqs} title={`${exam.name} ${noun.toLowerCase()} questions`} />

      <section className="mt-16 grid gap-4 md:grid-cols-2">
        <div className="card p-6">
          <p className="label">Other {exam.name} uploads</p>
          <ul className="mt-3 divide-y divide-dashed divide-line-2">
            <li>
              <Link href={`/exams/${exam.slug}`} className="flex justify-between py-3 font-semibold text-ink hover:text-pen">
                All {exam.name} requirements <span aria-hidden="true">→</span>
              </Link>
            </li>
            {siblings.map((p) => (
              <li key={p.path}>
                <Link href={p.path} className="flex justify-between gap-3 py-3 font-semibold text-ink hover:text-pen">
                  {exam.name} {docNoun[p.doc.kind].toLowerCase()}
                  <span className="font-mono text-xs text-ink-3">{p.doc.minKB}–{p.doc.maxKB} KB</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="card p-6">
          <p className="label">Related tools</p>
          <ul className="mt-3 divide-y divide-dashed divide-line-2">
            {rangePage && (
              <li>
                <Link href={`/tools/${rangePage.slug}`} className="flex justify-between py-3 font-semibold text-ink hover:text-pen">
                  {rangePage.title} <span aria-hidden="true">→</span>
                </Link>
              </li>
            )}
            {compressKB && (
              <li>
                <Link href={`/tools/compress-image-to-${compressKB}kb`} className="flex justify-between py-3 font-semibold text-ink hover:text-pen">
                  Compress image to {compressKB} KB <span aria-hidden="true">→</span>
                </Link>
              </li>
            )}
            <li>
              <Link href={isInk ? "/tools/signature-resizer" : "/tools/photo-resizer"} className="flex justify-between py-3 font-semibold text-ink hover:text-pen">
                {isInk ? "Signature resizer" : "Photo resizer"} (all exams) <span aria-hidden="true">→</span>
              </Link>
            </li>
            <li>
              <Link href="/tools/age-calculator" className="flex justify-between py-3 font-semibold text-ink hover:text-pen">
                Check your age eligibility <span aria-hidden="true">→</span>
              </Link>
            </li>
          </ul>
        </div>
      </section>

      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: title,
          url: absoluteUrl(page.path),
          dateModified: exam.lastChecked,
          about: { "@type": "Thing", name: `${exam.fullName} ${noun.toLowerCase()} requirements` },
          isPartOf: { "@type": "WebPage", url: absoluteUrl(`/exams/${exam.slug}`) },
          publisher: { "@type": "Organization", name: siteConfig.name, url: siteConfig.url },
        }}
      />
    </div>
  );
}
