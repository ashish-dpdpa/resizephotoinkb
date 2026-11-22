import Link from "next/link";
import Breadcrumbs from "@/components/Breadcrumbs";
import { pageMetadata } from "@/lib/seo";
import { toolGroups, tools } from "@/lib/tools";

export const metadata = pageMetadata({
  title: "All Free Tools for Exam Application Forms",
  description: "Photo and signature resizers, resize in cm, KB range converters, image compressors, DPI, pixel-to-cm and KB-to-MB converters, and an exam age calculator.",
  path: "/tools",
});

export default function ToolsIndex() {
  return (
    <div className="shell py-8 sm:py-12">
      <Breadcrumbs items={[{ name: "Tools", href: "/tools" }]} />
      <header className="max-w-3xl">
        <p className="label text-stamp">Free · Private · No sign-up</p>
        <h1 className="mt-2 text-4xl font-extrabold leading-[1.05] text-ink sm:text-5xl">Every tool your application form needs</h1>
        <p className="mt-4 text-lg text-ink-2">{tools.length} tools, all running in your browser. Nothing is uploaded.</p>
      </header>

      {toolGroups.map((g) => {
        const list = tools.filter((t) => t.group === g.id);
        if (!list.length) return null;
        const compact = g.id === "compress";
        return (
          <section key={g.id} className="mt-12">
            <div className="flex items-center gap-3">
              <h2 className="font-mono text-xs font-extrabold uppercase tracking-[0.16em] text-stamp">{g.title}</h2>
              <span className="cutline flex-1" />
            </div>
            {compact ? (
              <ul className="mt-5 grid grid-cols-3 gap-3 sm:grid-cols-5 lg:grid-cols-9">
                {list.map((t) => (
                  <li key={t.href}>
                    <Link href={t.href} className="card card-link flex flex-col items-center px-2 py-5 text-center">
                      <span className="font-display text-3xl font-extrabold text-ink">{t.href.match(/(\d+)kb/)?.[1]}</span>
                      <span className="label mt-1">KB</span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <ul className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {list.map((t) => (
                  <li key={t.href}>
                    <Link href={t.href} className="card card-link group flex h-full flex-col p-5">
                      <span className="font-display text-lg font-bold text-ink">{t.title}</span>
                      <span className="mt-1 line-clamp-2 text-sm text-ink-2">{t.description}</span>
                      <span className="mt-auto pt-4 font-mono text-xs font-extrabold uppercase tracking-wider text-pen transition group-hover:translate-x-1">Open →</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        );
      })}
    </div>
  );
}
