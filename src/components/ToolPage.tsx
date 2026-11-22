import Link from "next/link";
import Breadcrumbs from "./Breadcrumbs";
import Faq from "./Faq";
import JsonLd from "./JsonLd";
import { absoluteUrl } from "@/lib/site";
import { tools } from "@/lib/tools";

/** Shared shell for tool pages: hero, the tool, steps, article content, FAQ and related tools. */
export default function ToolPage({
  title,
  path,
  intro,
  tool,
  steps,
  faqs,
  kicker = "Free tool",
  children,
}: {
  title: string;
  path: string;
  intro: string;
  tool: React.ReactNode;
  steps: string[];
  faqs: { q: string; a: string }[];
  kicker?: string;
  children?: React.ReactNode;
}) {
  // Same-group tools first (e.g. other KB ranges), then the main tools.
  const self = tools.find((t) => t.href === path);
  const related = [
    ...tools.filter((t) => t.href !== path && self && t.group === self.group && t.group !== "main"),
    ...tools.filter((t) => t.href !== path && t.group === "main"),
    ...tools.filter((t) => t.href !== path && t.group === "converter"),
  ]
    .filter((t, i, a) => a.findIndex((x) => x.href === t.href) === i)
    .slice(0, 6);
  return (
    <div className="shell py-8 sm:py-12">
      <Breadcrumbs items={[{ name: "Tools", href: "/tools" }, { name: title, href: path }]} />
      <header className="max-w-3xl">
        <p className="label text-stamp">{kicker}</p>
        <h1 className="mt-2 text-4xl font-extrabold leading-[1.05] text-ink sm:text-5xl">{title}</h1>
        <p className="mt-4 text-lg leading-relaxed text-ink-2">{intro}</p>
      </header>

      <div className="mt-8">{tool}</div>

      <section className="mt-16">
        <p className="label">How it works</p>
        <h2 className="mt-1 text-3xl font-extrabold text-ink">In {steps.length} steps</h2>
        <ol className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((s, i) => (
            <li key={s} className="card p-5">
              <span className="font-display text-4xl font-extrabold text-line-2">{String(i + 1).padStart(2, "0")}</span>
              <p className="mt-2 leading-relaxed text-ink-2">{s}</p>
            </li>
          ))}
        </ol>
      </section>

      {children && (
        <div className="prose prose-lg mt-16 max-w-3xl prose-headings:font-extrabold">{children}</div>
      )}

      <Faq items={faqs} />

      <section className="mt-16">
        <p className="label">Keep going</p>
        <h2 className="mt-1 text-3xl font-extrabold text-ink">More tools</h2>
        <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {related.map((t) => (
            <li key={t.href}>
              <Link href={t.href} className="card card-link flex h-full items-start gap-3 p-5">
                <span className="flex-1">
                  <span className="block font-bold text-ink">{t.title}</span>
                  <span className="mt-1 block text-sm text-ink-2">{t.description}</span>
                </span>
                <span aria-hidden="true" className="text-ink-3">→</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: title,
          url: absoluteUrl(path),
          applicationCategory: "MultimediaApplication",
          operatingSystem: "Any (runs in the browser)",
          offers: { "@type": "Offer", price: "0", priceCurrency: "INR" },
          description: intro,
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "HowTo",
          name: `How to use the ${title}`,
          step: steps.map((s, i) => ({ "@type": "HowToStep", position: i + 1, text: s })),
        }}
      />
    </div>
  );
}
