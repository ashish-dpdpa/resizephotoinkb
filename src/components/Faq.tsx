import JsonLd from "./JsonLd";

export default function Faq({ items, title = "Questions students ask" }: { items: { q: string; a: string }[]; title?: string }) {
  if (!items.length) return null;
  return (
    <section className="mt-16">
      <p className="label">FAQ</p>
      <h2 className="mt-1 text-3xl font-extrabold text-ink">{title}</h2>
      <div className="mt-6 space-y-3">
        {items.map((f, i) => (
          <details key={f.q} className="group card px-5 py-4 open:shadow-[var(--shadow-lift)]">
            <summary className="flex cursor-pointer list-none items-start gap-4 font-semibold text-ink">
              <span className="mt-0.5 font-mono text-xs text-stamp">{String(i + 1).padStart(2, "0")}</span>
              <span className="flex-1">{f.q}</span>
              <span aria-hidden="true" className="grid h-6 w-6 shrink-0 place-items-center rounded-full border-[1.5px] border-line-2 text-sm transition group-open:rotate-45 group-open:border-ink">+</span>
            </summary>
            <p className="mt-3 pl-8 leading-relaxed text-ink-2">{f.a}</p>
          </details>
        ))}
      </div>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: items.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: { "@type": "Answer", text: f.a },
          })),
        }}
      />
    </section>
  );
}
