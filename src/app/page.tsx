import Link from "next/link";
import { getAllGuides } from "@/lib/guides";
import { exams, type Exam } from "@/lib/exams";
import { pageMetadata } from "@/lib/seo";
import { siteConfig } from "@/lib/site";
import { buildSearchIndex } from "@/lib/search";
import { InlineExamSearch } from "@/components/ExamSearch";
import Faq from "@/components/Faq";

export const metadata = {
  ...pageMetadata({
    title: `${siteConfig.name}: Exam Photo & Signature Resizer, Exact KB`,
    description: siteConfig.description,
    path: "/",
  }),
  title: { absolute: `${siteConfig.name}: Exam Photo & Signature Resizer, Exact KB` },
};

const popular = ["ssc-cgl", "sbi-po", "ibps-po", "neet-ug", "rrb-ntpc", "ctet"];

const mainTools = [
  { href: "/tools/photo-resizer", title: "Photo resizer", text: "Exact pixels and KB for any exam.", icon: "photo" },
  { href: "/tools/signature-resizer", title: "Signature resizer", text: "Cleans grey paper to pure white.", icon: "sign" },
  { href: "/tools/resize-photo-20kb-to-50kb", title: "Resize to a KB range", text: "20–50 KB, 10–20 KB, 30–50 KB and more.", icon: "squeeze" },
  { href: "/tools/age-calculator", title: "Age calculator", text: "Age on the cut-off date.", icon: "calendar" },
] as const;

const suites = [
  {
    href: "/tools/image-converter",
    icon: "convert",
    kicker: "Image converter",
    title: "Convert HEIC, WebP, PNG and JPG.",
    text: "iPhone photo the form won't take? Convert it to JPG. Batch up to 30 images, set a KB limit and download them all as a ZIP.",
    cta: "Convert images",
    note: "HEIC · WebP · PNG · JPG",
    links: [
      ["/tools/heic-to-jpg", "HEIC to JPG"],
      ["/tools/webp-to-jpg", "WebP to JPG"],
      ["/tools/png-to-jpg", "PNG to JPG"],
      ["/tools/jpg-to-png", "JPG to PNG"],
      ["/tools/jpg-to-webp", "JPG to WebP"],
      ["/tools/png-to-webp", "PNG to WebP"],
    ],
  },
  {
    href: "/tools/compress-pdf",
    icon: "pdf",
    kicker: "PDF tools",
    title: "Make, shrink and merge PDFs.",
    text: "Turn scanned certificates into one PDF, get it under the portal's size limit, or pull pages out as JPG images.",
    cta: "Compress PDF",
    note: "Runs in your browser",
    links: [
      ["/tools/image-to-pdf", "Image to PDF"],
      ["/tools/merge-pdf", "Merge PDF"],
      ["/tools/pdf-to-jpg", "PDF to JPG"],
      ["/tools/compress-pdf-to-100kb", "PDF under 100 KB"],
      ["/tools/compress-pdf-to-200kb", "PDF under 200 KB"],
    ],
  },
] as const;

export default function Home() {
  const posts = getAllGuides().slice(0, 3);
  const index = buildSearchIndex();
  const groups = exams.reduce<Record<string, Exam[]>>((acc, e) => {
    (acc[e.category] ??= []).push(e);
    return acc;
  }, {});

  return (
    <>
      {/* ---------------- hero ---------------- */}
      <section className="relative z-20 overflow-x-clip">
        <div className="shell grid items-center gap-12 pb-16 pt-10 sm:pt-16 lg:grid-cols-[1.15fr_0.85fr] lg:pb-24">
          <div>
            <p className="label">For SSC · UPSC · Banking · Railway · NEET · CTET</p>
            <h1 className="mt-4 text-[2.7rem] font-extrabold leading-[1.02] text-ink sm:text-6xl lg:text-[4.2rem]">
              Your form photo, <span className="marker">accepted</span> the first time.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-2">
              Pick your exam and we set the exact pixels and KB range. Crop, clean and download in seconds. Your photo
              never leaves your phone.
            </p>
            <div className="mt-8 max-w-xl">
              <InlineExamSearch index={index} />
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="label mr-1">Popular</span>
                {popular.map((slug) => {
                  const e = exams.find((x) => x.slug === slug);
                  return e ? (
                    <Link key={slug} href={`/exams/${slug}`} className="chip">{e.name}</Link>
                  ) : null;
                })}
              </div>
            </div>
          </div>

          <AdmitCardArt />
        </div>
      </section>

      {/* ---------------- tools ---------------- */}
      <section className="border-y border-line bg-card/60">
        <div className="shell py-14">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="label">Tools</p>
              <h2 className="mt-1 text-3xl font-extrabold text-ink sm:text-4xl">Not sure of your exam? Start here.</h2>
            </div>
            <Link href="/tools" className="font-semibold text-pen underline underline-offset-4">All tools →</Link>
          </div>
          <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {mainTools.map((t) => (
              <li key={t.href}>
                <Link href={t.href} className="card card-link group flex h-full flex-col p-6">
                  <ToolIcon name={t.icon} />
                  <span className="mt-5 font-display text-xl font-bold text-ink">{t.title}</span>
                  <span className="mt-1 text-sm text-ink-2">{t.text}</span>
                  <span className="mt-5 font-mono text-xs font-extrabold uppercase tracking-wider text-pen transition group-hover:translate-x-1">Open →</span>
                </Link>
              </li>
            ))}
          </ul>

          {/* feature: background remover */}
          <Link
            href="/tools/background-remover"
            className="card card-link group relative mt-4 grid items-center gap-8 overflow-hidden p-6 sm:p-8 md:grid-cols-[minmax(0,1fr)_auto]"
          >
            <div>
              <p className="flex items-center gap-3">
                <span className="rounded-full bg-stamp px-2.5 py-1 font-mono text-[0.65rem] font-extrabold uppercase tracking-[0.14em] text-card">New</span>
                <span className="label">Photo background remover</span>
              </p>
              <h3 className="mt-4 font-display text-2xl font-extrabold leading-tight text-ink sm:text-3xl">
                Remove the <span className="marker">background</span> from your photo.
              </h3>
              <p className="mt-3 max-w-xl text-ink-2">
                Get a transparent PNG in seconds, or add a plain white or coloured background if you need one. The AI runs
                on your device, so the photo is never uploaded.
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-4">
                <span className="btn btn-pen">Remove background →</span>
                <span className="font-mono text-xs text-ink-3">PNG · optional white or colour</span>
              </div>
            </div>
            <BackgroundArt />
          </Link>

          {/* converters: image formats + PDF */}
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            {suites.map((s) => (
              <div key={s.href} className="card group/suite flex flex-col p-6 sm:p-8">
                <div className="flex items-start gap-4">
                  <SuiteIcon name={s.icon} />
                  <div className="min-w-0">
                    <p className="label">{s.kicker}</p>
                    <h3 className="mt-1 font-display text-2xl font-extrabold leading-tight text-ink">
                      <Link href={s.href} className="hover:text-pen">{s.title}</Link>
                    </h3>
                  </div>
                </div>
                <p className="mt-4 text-ink-2">{s.text}</p>
                <ul className="mt-5 flex flex-wrap gap-2">
                  {s.links.map(([href, label]) => (
                    <li key={href}><Link href={href} className="chip">{label}</Link></li>
                  ))}
                </ul>
                <div className="mt-auto flex flex-wrap items-center gap-4 pt-6">
                  <Link href={s.href} className="btn btn-pen">{s.cta} →</Link>
                  <span className="font-mono text-xs text-ink-3">{s.note}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-2">
            <span className="label mr-1">Also popular</span>
            {[
              ["/tools/photo-with-name-and-date", "Photo with name & date"],
              ["/tools/passport-size-photo-maker", "Passport photo + white background"],
              ["/tools/join-photo-and-signature", "Join photo & signature"],
              ["/tools/signature-maker", "Signature maker"],
              ["/tools/signature-resize-10-to-20-kb", "Signature 10–20 KB"],
              ["/tools/resize-image-in-cm", "Resize in cm"],
            ].map(([href, label]) => (
              <Link key={href} href={href} className="chip">{label}</Link>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- exams ---------------- */}
      <section className="shell py-16">
        <p className="label">Exam presets</p>
        <h2 className="mt-1 max-w-2xl text-3xl font-extrabold text-ink sm:text-4xl">
          {exams.length} exams, each with the size rules already filled in.
        </h2>
        <div className="mt-10 space-y-10">
          {Object.entries(groups).map(([cat, list]) => (
            <div key={cat}>
              <div className="flex items-center gap-3">
                <h3 className="font-mono text-xs font-extrabold uppercase tracking-[0.16em] text-stamp">{cat}</h3>
                <span className="cutline flex-1" />
              </div>
              <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {list.map((e) => (
                  <li key={e.slug} className="min-w-0">
                    <Link href={`/exams/${e.slug}`} className="card card-link flex h-full items-center gap-4 p-4">
                      <span className="grid h-12 w-12 shrink-0 place-items-center rounded-lg bg-paper-2 font-display text-sm font-extrabold text-ink">
                        {e.name.split(/[\s()]+/).find((w) => /^[A-Z]{2,5}$/.test(w)) ?? e.name.slice(0, 4)}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block font-bold text-ink">{e.name}</span>
                        <span className="block truncate font-mono text-[0.72rem] text-ink-3">
                          {e.livePhoto ? "Live photo · " : ""}
                          {e.docs.map((d) => `${d.label.split(" (")[0].replace("Left thumb impression", "Thumb").replace("Handwritten declaration", "Declaration")} ${d.minKB}–${d.maxKB}KB`).join(" · ")}
                        </span>
                      </span>
                      <span aria-hidden="true" className="text-ink-3">→</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* ---------------- why ---------------- */}
      <section className="bg-ink text-card">
        <div className="shell grid gap-12 py-16 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="font-mono text-[0.68rem] uppercase tracking-[0.14em] text-card/50">Why students switch</p>
            <h2 className="mt-2 text-3xl font-extrabold sm:text-4xl">Most resizers only get you under the limit. Forms also check the minimum.</h2>
            <p className="mt-4 text-card/70">
              Railway and UP Police forms reject signatures under 30 KB. A clean signature usually comes out at 6 KB. We
              fix both ends, without touching the picture.
            </p>
          </div>
          <div className="overflow-hidden rounded-2xl border border-card/15">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-card/5 font-mono text-[0.68rem] uppercase tracking-[0.12em] text-card/50">
                  <th className="px-4 py-3 text-left font-medium"> </th>
                  <th className="px-4 py-3 text-left font-medium">Typical resizer</th>
                  <th className="px-4 py-3 text-left font-medium text-marker">{siteConfig.name}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dashed divide-card/15">
                {[
                  ["Your photo", "Uploaded to a server", "Stays on your device"],
                  ["KB limit", "Maximum only", "Minimum and maximum"],
                  ["Exam sizes", "You type them in", "Preset from the notice"],
                  ["Signature", "Grey paper stays grey", "Cleaned to pure white"],
                  ["Source", "Not shown", "Linked, with date checked"],
                ].map(([k, a, b]) => (
                  <tr key={k}>
                    <td className="px-4 py-3 font-semibold">{k}</td>
                    <td className="px-4 py-3 text-card/55">{a}</td>
                    <td className="px-4 py-3 font-semibold text-card">✓ {b}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ---------------- guides ---------------- */}
      {posts.length > 0 && (
        <section className="shell py-16">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="label">Guides</p>
              <h2 className="mt-1 text-3xl font-extrabold text-ink sm:text-4xl">Guides that save you a rejection</h2>
            </div>
            <Link href="/guides" className="font-semibold text-pen underline underline-offset-4">All guides →</Link>
          </div>
          <ul className="mt-8 grid gap-4 md:grid-cols-3">
            {posts.map((p, i) => (
              <li key={p.slug}>
                <Link href={`/guides/${p.slug}`} className="card card-link flex h-full flex-col p-6">
                  <span className="font-mono text-xs text-stamp">{String(i + 1).padStart(2, "0")} · {p.category}</span>
                  <span className="mt-3 font-display text-xl font-bold leading-snug text-ink">{p.title}</span>
                  <span className="mt-2 line-clamp-3 text-sm text-ink-2">{p.description}</span>
                  <span className="mt-auto pt-5 font-mono text-xs text-ink-3">{p.readingMinutes} min read</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="shell">
        <Faq
          items={[
            {
              q: "How do I reduce my photo size in KB for an online form?",
              a: "Search your exam above, or open the photo resizer and type the KB range. Choose your photo and the tool finds the best quality that fits, then you download the JPG.",
            },
            {
              q: "Is it safe to use my photo here?",
              a: "Yes. The image is processed inside your browser and is never uploaded to our servers.",
            },
            {
              q: "What if the form says my file is too small?",
              a: "Set the minimum KB in the tool. If the compressed image is smaller, the tool pads the file to reach the minimum without changing how it looks.",
            },
            {
              q: "Are these requirements official?",
              a: "We compile them from official notifications and link to the source, but exam bodies can change them. Always confirm in the latest notice before submitting.",
            },
          ]}
        />
      </div>
    </>
  );
}

/** Illustrated admit-card style panel — shows what the product does without a stock image. */
function AdmitCardArt() {
  return (
    <div className="relative mx-auto w-full max-w-md" aria-hidden="true">
      <div className="absolute inset-0 translate-x-3 translate-y-3 rotate-2 rounded-2xl bg-paper-2" />
      <div className="relative -rotate-1 rounded-2xl border border-line-2 bg-card p-6 shadow-[var(--shadow-lift)]">
        <div className="flex items-center justify-between border-b border-dashed border-line-2 pb-3">
          <span className="font-mono text-[0.65rem] font-extrabold uppercase tracking-[0.18em] text-ink">Application form · Uploads</span>
          <span className="font-mono text-[0.65rem] text-ink-3">Step 4 / 6</span>
        </div>
        <div className="mt-5 flex gap-5">
          <div className="cropmarks shrink-0">
            <div className="h-[132px] w-[112px] overflow-hidden rounded-sm bg-[#eaf0ff]">
              <svg viewBox="0 0 112 132" className="h-full w-full">
                <circle cx="56" cy="50" r="22" fill="#c9a27e" />
                <path d="M30 42c2-16 14-24 26-24s24 8 26 24c-6-6-14-9-26-9s-20 3-26 9z" fill="#2b2118" />
                <path d="M14 132c4-28 20-42 42-42s38 14 42 42z" fill="#2337c6" />
                <path d="M46 92l10 12 10-12" fill="#fffdf8" />
              </svg>
            </div>
            <p className="mt-2 text-center font-mono text-[0.6rem] text-ink-3">200 × 230 px</p>
          </div>
          <div className="min-w-0 flex-1 space-y-3">
            {[
              ["Photo", "38.4 KB", "20–50"],
              ["Signature", "14.2 KB", "10–20"],
              ["Thumb", "31.0 KB", "20–50"],
            ].map(([k, v, r]) => (
              <div key={k} className="rounded-lg border border-line px-3 py-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[0.62rem] uppercase tracking-[0.12em] text-ink-3">{k}</span>
                  <span className="font-mono text-[0.62rem] text-ok">✓ {r} KB</span>
                </div>
                <p className="font-display text-lg font-extrabold text-ink">{v}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-5 rounded-lg border border-line bg-paper px-3 py-2">
          <svg viewBox="0 0 240 40" className="h-9 w-full">
            <path d="M10 28c14-22 22-22 18 0s10-24 20-8 8 14 18-6 14 2 20 10 10-18 24-14 12 18 30 4 18-6 30 0" fill="none" stroke="#14172b" strokeWidth="2.4" strokeLinecap="round" />
          </svg>
        </div>
        <span className="stamp absolute -bottom-5 right-6 bg-card text-base">Accepted</span>
      </div>
    </div>
  );
}

/** The same illustrated person as the hero, shown before (busy room) and after (transparent). */
function Person() {
  return (
    <>
      <circle cx="56" cy="50" r="22" fill="#c9a27e" />
      <path d="M30 42c2-16 14-24 26-24s24 8 26 24c-6-6-14-9-26-9s-20 3-26 9z" fill="#2b2118" />
      <path d="M14 132c4-28 20-42 42-42s38 14 42 42z" fill="#2337c6" />
      <path d="M46 92l10 12 10-12" fill="#fffdf8" />
    </>
  );
}

function BackgroundArt() {
  return (
    <div className="flex items-center justify-center gap-3 sm:gap-5" aria-hidden="true">
      <figure className="text-center">
        <div className="h-[132px] w-[112px] overflow-hidden rounded-md border border-line-2 sm:h-[154px] sm:w-[131px]">
          <svg viewBox="0 0 112 132" className="h-full w-full">
            {/* cluttered room: wall, door, shelf, poster */}
            <rect width="112" height="132" fill="#c7b79a" />
            <rect x="0" y="0" width="34" height="132" fill="#8a6a4a" />
            <rect x="4" y="8" width="26" height="60" fill="#9c7a56" />
            <circle cx="26" cy="74" r="2" fill="#e8d6b4" />
            <rect x="80" y="10" width="28" height="36" fill="#d2452b" opacity="0.75" />
            <rect x="84" y="14" width="20" height="10" fill="#ffe45c" opacity="0.8" />
            <rect x="74" y="60" width="38" height="4" fill="#6b5236" />
            <rect x="78" y="48" width="6" height="12" fill="#2337c6" opacity="0.7" />
            <rect x="86" y="50" width="5" height="10" fill="#1d7a4b" opacity="0.7" />
            <rect x="93" y="47" width="7" height="13" fill="#7b7f95" />
            <Person />
          </svg>
        </div>
        <figcaption className="mt-2 font-mono text-[0.62rem] uppercase tracking-[0.12em] text-ink-3">Before</figcaption>
      </figure>
      <span className="font-display text-2xl font-extrabold text-ink-3 transition group-hover:translate-x-1 group-hover:text-pen">→</span>
      <figure className="text-center">
        <div className="cropmarks">
          <div
            className="h-[132px] w-[112px] overflow-hidden rounded-sm border border-line sm:h-[154px] sm:w-[131px]"
            style={{ backgroundImage: "repeating-conic-gradient(#e7e2d6 0% 25%, #fffdf8 0% 50%)", backgroundSize: "14px 14px" }}
          >
            <svg viewBox="0 0 112 132" className="h-full w-full">
              <Person />
            </svg>
          </div>
        </div>
        <figcaption className="mt-2 font-mono text-[0.62rem] uppercase tracking-[0.12em] text-ok">✓ Transparent</figcaption>
      </figure>
    </div>
  );
}

function SuiteIcon({ name }: { name: "convert" | "pdf" }) {
  const common = { fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  return (
    <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-ink text-card transition group-hover/suite:-rotate-6 group-hover/suite:bg-pen" aria-hidden="true">
      <svg viewBox="0 0 24 24" className="h-6 w-6">
        {name === "convert" && (<><path d="M4 8h13l-3-3M20 16H7l3 3" {...common} /></>)}
        {name === "pdf" && (<><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" {...common} /><path d="M14 3v5h5M9 13h6M9 17h4" {...common} /></>)}
      </svg>
    </span>
  );
}

function ToolIcon({ name }: { name: "photo" | "sign" | "squeeze" | "calendar" }) {
  const common = { fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  return (
    <span className="grid h-12 w-12 place-items-center rounded-xl bg-ink text-card transition group-hover:-rotate-6 group-hover:bg-pen">
      <svg viewBox="0 0 24 24" className="h-6 w-6">
        {name === "photo" && (<><rect x="5" y="3" width="14" height="18" rx="2" {...common} /><circle cx="12" cy="10" r="3" {...common} /><path d="M7.5 18c1-2.5 2.6-3.6 4.5-3.6s3.5 1.1 4.5 3.6" {...common} /></>)}
        {name === "sign" && (<path d="M3 17c3-6 5-9 6-6s-2 6 1 4 3-7 5-5-1 5 2 4 3-2 4-2M3 21h18" {...common} />)}
        {name === "squeeze" && (<><path d="M4 9h16M4 15h16" {...common} /><path d="m9 4 3 3 3-3M9 20l3-3 3 3" {...common} /></>)}
        {name === "calendar" && (<><rect x="4" y="5" width="16" height="15" rx="2" {...common} /><path d="M4 10h16M9 3v4M15 3v4" {...common} /></>)}
      </svg>
    </span>
  );
}
