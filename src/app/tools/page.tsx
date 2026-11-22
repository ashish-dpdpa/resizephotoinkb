import Link from "next/link";
import Breadcrumbs from "@/components/Breadcrumbs";
import { pageMetadata } from "@/lib/seo";
import { tools } from "@/lib/tools";

export const metadata = pageMetadata({
  title: "All Free Tools for Exam Forms",
  description: "Photo resizer, signature resizer, signature maker, image compressor and age calculator for Indian government exam application forms.",
  path: "/tools",
});

export default function ToolsIndex() {
  const compress = tools.filter((t) => t.href.includes("compress-image-to-"));
  const main = tools.filter((t) => !t.href.includes("compress-image-to-"));
  return (
    <div className="shell py-8 sm:py-12">
      <Breadcrumbs items={[{ name: "Tools", href: "/tools" }]} />
      <header className="max-w-3xl">
        <p className="label text-stamp">Free · Private · No sign-up</p>
        <h1 className="mt-2 text-4xl font-extrabold leading-[1.05] text-ink sm:text-5xl">Every tool your application form needs</h1>
        <p className="mt-4 text-lg text-ink-2">All tools run in your browser. Nothing is uploaded.</p>
      </header>

      <ul className="mt-10 grid gap-4 sm:grid-cols-2">
        {main.map((t, i) => (
          <li key={t.href}>
            <Link href={t.href} className="card card-link group flex h-full items-start gap-5 p-6">
              <span className="font-display text-4xl font-extrabold text-line-2 transition group-hover:text-stamp">{String(i + 1).padStart(2, "0")}</span>
              <span className="flex-1">
                <span className="block font-display text-xl font-bold text-ink">{t.title}</span>
                <span className="mt-1 block text-ink-2">{t.description}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>

      <section className="mt-14">
        <div className="flex items-center gap-3">
          <h2 className="font-mono text-xs font-extrabold uppercase tracking-[0.16em] text-stamp">Compress to a size</h2>
          <span className="cutline flex-1" />
        </div>
        <ul className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {compress.map((t) => {
            const kb = t.href.match(/(\d+)kb/)?.[1];
            return (
              <li key={t.href}>
                <Link href={t.href} className="card card-link flex flex-col items-center px-4 py-6 text-center">
                  <span className="font-display text-4xl font-extrabold text-ink">{kb}</span>
                  <span className="label mt-1">KB</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
