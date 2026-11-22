"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { SearchItem } from "@/lib/search";

function score(item: SearchItem, q: string) {
  if (!q) return 1;
  const words = q.toLowerCase().split(/\s+/).filter(Boolean);
  let s = 0;
  for (const w of words) {
    if (item.title.toLowerCase().startsWith(w)) s += 3;
    else if (item.keywords.includes(w)) s += 1;
    else return 0;
  }
  return s;
}

export function SearchResults({
  items,
  query,
  active,
  onHover,
  onPick,
}: {
  items: SearchItem[];
  query: string;
  active: number;
  onHover: (i: number) => void;
  onPick: (item: SearchItem) => void;
}) {
  if (!items.length) {
    return (
      <p className="px-4 py-6 text-sm text-ink-2">
        No match for “{query}”. Try the <Link className="font-semibold text-pen underline" href="/tools/photo-resizer">photo resizer</Link> with a custom size.
      </p>
    );
  }
  return (
    <ul role="listbox" className="max-h-[60vh] overflow-y-auto p-1.5">
      {items.map((it, i) => (
        <li key={it.href} role="option" aria-selected={i === active}>
          <button
            type="button"
            onMouseEnter={() => onHover(i)}
            onClick={() => onPick(it)}
            className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition ${
              i === active ? "bg-ink text-card" : "hover:bg-paper-2"
            }`}
          >
            <span
              className={`label shrink-0 rounded-md border px-1.5 py-0.5 ${
                i === active ? "border-card/30 text-card/80" : "border-line-2"
              }`}
            >
              {it.tag}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate font-semibold">{it.title}</span>
              <span className={`block truncate font-mono text-xs ${i === active ? "text-card/70" : "text-ink-3"}`}>{it.subtitle}</span>
            </span>
            <span aria-hidden="true" className={i === active ? "" : "text-ink-3"}>↵</span>
          </button>
        </li>
      ))}
    </ul>
  );
}

function useSearch(index: SearchItem[], limit: number) {
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const results = useMemo(
    () =>
      index
        .map((it) => ({ it, s: score(it, query.trim()) }))
        .filter((r) => r.s > 0)
        .sort((a, b) => b.s - a.s)
        .slice(0, limit)
        .map((r) => r.it),
    [index, query, limit],
  );
  return { query, setQuery: (q: string) => { setQuery(q); setActive(0); }, active, setActive, results };
}

/** Big search box used in the home page hero. */
export function InlineExamSearch({ index }: { index: SearchItem[] }) {
  const router = useRouter();
  const { query, setQuery, active, setActive, results } = useSearch(index, 7);
  const [open, setOpen] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (wrap.current && !wrap.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const pick = (it: SearchItem) => router.push(it.href);

  return (
    <div ref={wrap} className="relative">
      <label htmlFor="hero-search" className="sr-only">Search your exam</label>
      <div className="flex items-center gap-3 rounded-2xl border-2 border-ink bg-card px-4 py-3 shadow-[0_4px_0_var(--color-ink)] focus-within:shadow-[0_4px_0_var(--color-pen)] focus-within:border-pen">
        <svg aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6 shrink-0 text-ink" fill="none" stroke="currentColor" strokeWidth={2.2}>
          <circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" strokeLinecap="round" />
        </svg>
        <input
          id="hero-search"
          type="search"
          autoComplete="off"
          placeholder="Your exam, e.g. SSC CGL"
          value={query}
          onFocus={() => setOpen(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") { e.preventDefault(); setActive(Math.min(active + 1, results.length - 1)); }
            if (e.key === "ArrowUp") { e.preventDefault(); setActive(Math.max(active - 1, 0)); }
            if (e.key === "Enter" && results[active]) pick(results[active]);
            if (e.key === "Escape") setOpen(false);
          }}
          className="w-full bg-transparent text-lg font-medium text-ink placeholder:text-ink-3 focus:outline-none focus-visible:outline-none sm:text-xl"
          role="combobox"
          aria-expanded={open}
          aria-controls="hero-search-results"
        />
      </div>
      {open && (
        <div id="hero-search-results" className="card absolute inset-x-0 top-full z-20 mt-2 overflow-hidden">
          <SearchResults items={results} query={query} active={active} onHover={setActive} onPick={pick} />
        </div>
      )}
    </div>
  );
}

/** Compact trigger in the header that opens a command-palette style dialog (also on "/" or Ctrl/⌘+K). */
export function SearchDialogButton({ index }: { index: SearchItem[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const { query, setQuery, active, setActive, results } = useSearch(index, 8);
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const typing = (e.target as HTMLElement)?.closest("input, textarea, select, [contenteditable]");
      if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || (e.key === "/" && !typing)) {
        e.preventDefault();
        setOpen(true);
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (open) setTimeout(() => input.current?.focus(), 10);
  }, [open]);

  const pick = (it: SearchItem) => {
    setOpen(false);
    setQuery("");
    router.push(it.href);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-full border-[1.5px] border-line-2 bg-card px-3 py-1.5 text-sm text-ink-2 transition hover:border-ink hover:text-ink"
        aria-label="Search exams and tools"
      >
        <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.2}>
          <circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" strokeLinecap="round" />
        </svg>
        <span className="hidden sm:inline">Find your exam</span>
        <kbd className="hidden rounded border border-line-2 px-1.5 font-mono text-[0.65rem] text-ink-3 lg:inline">/</kbd>
      </button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-ink/40 px-4 pt-[12vh] backdrop-blur-sm" onMouseDown={() => setOpen(false)}>
          <div className="card w-full max-w-xl overflow-hidden" role="dialog" aria-modal="true" aria-label="Search" onMouseDown={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 border-b border-dashed border-line-2 px-4 py-3">
              <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 text-ink" fill="none" stroke="currentColor" strokeWidth={2.2}>
                <circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" strokeLinecap="round" />
              </svg>
              <input
                ref={input}
                type="search"
                placeholder="Exam or tool…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "ArrowDown") { e.preventDefault(); setActive(Math.min(active + 1, results.length - 1)); }
                  if (e.key === "ArrowUp") { e.preventDefault(); setActive(Math.max(active - 1, 0)); }
                  if (e.key === "Enter" && results[active]) pick(results[active]);
                }}
                className="w-full bg-transparent text-base text-ink placeholder:text-ink-3 focus:outline-none focus-visible:outline-none"
              />
              <button type="button" onClick={() => setOpen(false)} className="label hover:text-ink">Esc</button>
            </div>
            <SearchResults items={results} query={query} active={active} onHover={setActive} onPick={pick} />
          </div>
        </div>
      )}
    </>
  );
}
