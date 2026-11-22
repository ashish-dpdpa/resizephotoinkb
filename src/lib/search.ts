import { exams } from "./exams";
import { tools } from "./tools";

export interface SearchItem {
  href: string;
  title: string;
  subtitle: string;
  tag: string;
  keywords: string;
}

export function buildSearchIndex(): SearchItem[] {
  const examItems: SearchItem[] = exams.map((e) => ({
    href: `/exams/${e.slug}`,
    title: e.name,
    subtitle: e.livePhoto
      ? `Live photo · ${e.docs.map((d) => `${d.label.split(" (")[0]} ${d.minKB}–${d.maxKB} KB`).join(" · ")}`
      : e.docs.map((d) => `${d.label.split(" (")[0]} ${d.minKB}–${d.maxKB} KB`).join(" · "),
    tag: e.category,
    keywords: `${e.name} ${e.fullName} ${e.body} ${e.category}`.toLowerCase(),
  }));
  const toolItems: SearchItem[] = tools.map((t) => ({
    href: t.href,
    title: t.title,
    subtitle: t.description,
    tag: "Tool",
    keywords: `${t.title} ${t.description}`.toLowerCase(),
  }));
  return [...examItems, ...toolItems];
}
