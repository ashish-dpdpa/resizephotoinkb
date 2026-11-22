import Link from "next/link";
import Breadcrumbs from "@/components/Breadcrumbs";
import { pageMetadata } from "@/lib/seo";
import { exams, formatDate, type Exam } from "@/lib/exams";

export const metadata = pageMetadata({
  title: "Exam Photo & Signature Size Requirements 2026",
  description:
    "Photo, signature, thumb and declaration size requirements for SSC, UPSC, IBPS, SBI, RRB, UP Police, NEET and CTET 2026, with a resizer preset for each.",
  path: "/exams",
});

export default function ExamsIndex() {
  const groups = exams.reduce<Record<string, Exam[]>>((acc, e) => {
    (acc[e.category] ??= []).push(e);
    return acc;
  }, {});
  return (
    <div className="shell py-8 sm:py-12">
      <Breadcrumbs items={[{ name: "Exams", href: "/exams" }]} />
      <header className="max-w-3xl">
        <p className="label text-stamp">{exams.length} exams · 2026</p>
        <h1 className="mt-2 text-4xl font-extrabold leading-[1.05] text-ink sm:text-5xl">Photo &amp; signature size, exam by exam</h1>
        <p className="mt-4 text-lg text-ink-2">
          Open your exam to see what to upload, the exact limits, the source notice and a resizer that is already set up.
        </p>
      </header>

      <div className="mt-12 space-y-12">
        {Object.entries(groups).map(([cat, list]) => (
          <section key={cat}>
            <div className="flex items-center gap-3">
              <h2 className="font-mono text-xs font-extrabold uppercase tracking-[0.16em] text-stamp">{cat}</h2>
              <span className="cutline flex-1" />
            </div>
            <ul className="mt-5 grid gap-4 md:grid-cols-2">
              {list.map((e) => (
                <li key={e.slug}>
                  <Link href={`/exams/${e.slug}`} className="card card-link block h-full p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-display text-xl font-extrabold text-ink">{e.name}</p>
                        <p className="text-sm text-ink-3">{e.fullName}</p>
                      </div>
                      {e.livePhoto && <span className="chip !cursor-default shrink-0 !py-1 !text-xs">Live photo</span>}
                    </div>
                    <ul className="mt-4 divide-y divide-dashed divide-line-2 border-t border-dashed border-line-2">
                      {e.docs.map((d) => (
                        <li key={d.kind} className="flex items-center justify-between py-2 text-sm">
                          <span className="text-ink-2">{d.label.split(" (")[0]}</span>
                          <span className="font-mono font-extrabold text-ink">{d.minKB}–{d.maxKB} KB</span>
                        </li>
                      ))}
                    </ul>
                    <p className="mt-3 font-mono text-[0.68rem] text-ink-3">Checked {formatDate(e.lastChecked)}</p>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
