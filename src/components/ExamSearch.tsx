"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
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

function SearchIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={2.2}>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" strokeLinecap="round" />
    </svg>
  );
}

function SearchResults({
  id,
  items,
  query,
  active,
  onHover,
  onPick,
  maxHeight = "max-h-[min(60vh,420px)]",
}: {
  id: string;
  items: SearchItem[];
  query: string;
  active: number;
  onHover: (i: number) => void;
  onPick: (item: SearchItem) => void;
  maxHeight?: string;
}) {
  const list = useRef<HTMLUListElement>(null);

  // Keep the highlighted row visible while moving with the arrow keys — scroll only the list,
  // never the page (scrollIntoView would also scroll the window).
  useEffect(() => {
    const box = list.current;
    const el = box?.querySelector<HTMLElement>(`[data-index="${active}"]`);
    if (!box || !el) return;
    const top = el.offsetTop;
    const bottom = top + el.offsetHeight;
    if (top < box.scrollTop) box.scrollTop = top - 6;
    else if (bottom > box.scrollTop + box.clientHeight) box.scrollTop = bottom - box.clientHeight + 6;
  }, [active]);

  if (!items.length) {
    return (
      <p className="px-4 py-6 text-sm text-ink-2">
        No match for “{query}”. Try the{" "}
        <Link className="font-semibold text-pen underline" href="/tools/photo-resizer">
          photo resizer
        </Link>{" "}
        with a custom size.
      </p>
    );
  }
  return (
    <ul ref={list} id={id} role="listbox" className={`scroll-thin relative overflow-y-auto overscroll-contain p-1.5 ${maxHeight}`}>
      {!query && <li className="label px-3 pb-1 pt-2" role="presentation">Popular</li>}
      {items.map((it, i) => (
        <li key={it.href} id={`${id}-${i}`} data-index={i} role="option" aria-selected={i === active}>
          <button
            type="button"
            tabIndex={-1}
            onMouseMove={() => i !== active && onHover(i)}
            onClick={() => onPick(it)}
            className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors ${
              i === active ? "bg-ink text-card" : "hover:bg-paper-2"
            }`}
          >
            <span
              className={`label w-[4.6rem] shrink-0 truncate rounded-md border px-1.5 py-0.5 text-center ${
                i === active ? "border-card/30 text-card/80" : "border-line-2"
              }`}
            >
              {it.tag}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate font-semibold">{it.title}</span>
              <span className={`block truncate font-mono text-xs ${i === active ? "text-card/70" : "text-ink-3"}`}>{it.subtitle}</span>
            </span>
            <span aria-hidden="true" className={`text-sm ${i === active ? "" : "text-ink-3 opacity-0"}`}>↵</span>
          </button>
        </li>
      ))}
    </ul>
  );
}

function useSearch(index: SearchItem[], limit: number) {
  const [query, setQueryRaw] = useState("");
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
  const setQuery = (q: string) => {
    setQueryRaw(q);
    setActive(0);
  };
  const onKey = (e: React.KeyboardEvent, pick: (it: SearchItem) => void, close?: () => void) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (results[active]) pick(results[active]);
    } else if (e.key === "Escape") {
      close?.();
    }
  };
  return { query, setQuery, active, setActive, results, onKey };
}

/** Big search box used in the home page hero. */
export function InlineExamSearch({ index }: { index: SearchItem[] }) {
  const router = useRouter();
  const { query, setQuery, active, setActive, results, onKey } = useSearch(index, 8);
  const [open, setOpen] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);
  const listId = useId();

  useEffect(() => {
    const close = (e: PointerEvent) => {
      if (wrap.current && !wrap.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, []);

  const pick = (it: SearchItem) => {
    setOpen(false);
    router.push(it.href);
  };

  return (
    <div
      ref={wrap}
      className="relative z-30"
      onBlur={(e) => {
        // close when keyboard focus leaves the search box and its results
        if (!wrap.current?.contains(e.relatedTarget as Node)) setOpen(false);
      }}
    >
      <label htmlFor="hero-search" className="sr-only">Search your exam</label>
      <div className="flex items-center gap-3 rounded-2xl border-2 border-ink bg-card px-4 py-3 shadow-[0_4px_0_var(--color-ink)] transition focus-within:border-pen focus-within:shadow-[0_4px_0_var(--color-pen)]">
        <SearchIcon className="h-6 w-6 shrink-0 text-ink" />
        <input
          id="hero-search"
          type="search"
          autoComplete="off"
          spellCheck={false}
          enterKeyHint="go"
          placeholder="Your exam, e.g. SSC CGL"
          value={query}
          onFocus={(e) => {
            setOpen(true);
            // Bring the box near the top so the results (and the phone keyboard) have room.
            const top = e.currentTarget.getBoundingClientRect().top;
            if (top > window.innerHeight * 0.35) window.scrollBy({ top: top - 96, behavior: "smooth" });
          }}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onKeyDown={(e) => onKey(e, pick, () => setOpen(false))}
          className="w-full min-w-0 appearance-none border-0 bg-transparent p-0 text-lg font-medium text-ink outline-none placeholder:text-ink-3 focus:outline-none focus-visible:outline-none sm:text-xl"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={open}
          aria-controls={listId}
          aria-activedescendant={open && results.length ? `${listId}-${active}` : undefined}
        />
        {query && (
          <button type="button" aria-label="Clear search" onClick={() => setQuery("")} className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-ink-3 hover:bg-paper-2 hover:text-ink">
            ✕
          </button>
        )}
      </div>
      {open && (
        <div className="card absolute inset-x-0 top-full mt-2 overflow-hidden shadow-[var(--shadow-lift)]">
          <SearchResults id={listId} items={results} query={query} active={active} onHover={setActive} onPick={pick} />
        </div>
      )}
    </div>
  );
}

/**
 * Header search: a trigger that opens a command-palette dialog.
 * Also opens with "/" or Ctrl/⌘+K. `variant="field"` looks like an input, `"icon"` is a round button.
 */
export function SearchDialogButton({
  index,
  variant = "field",
  onOpen,
}: {
  index: SearchItem[];
  variant?: "field" | "icon";
  /** Called when the dialog opens (the header uses it to close its menus). */
  onOpen?: () => void;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const { query, setQuery, active, setActive, results, onKey } = useSearch(index, 10);
  const input = useRef<HTMLInputElement>(null);
  const listId = useId();

  useEffect(() => {
    // Only one instance should own the global shortcut — the "field" variant (desktop).
    if (variant !== "field") return;
    const onKeyDown = (e: KeyboardEvent) => {
      const typing = (e.target as HTMLElement)?.closest("input, textarea, select, [contenteditable]");
      if ((e.key.toLowerCase() === "k" && (e.metaKey || e.ctrlKey)) || (e.key === "/" && !typing)) {
        e.preventDefault();
        show();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [variant]);

  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => input.current?.focus(), 20);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden"; // no background scrolling behind the dialog
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", esc);
    return () => {
      clearTimeout(t);
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", esc);
    };
  }, [open]);

  const pick = (it: SearchItem) => {
    setOpen(false);
    setQuery("");
    router.push(it.href);
  };
  const show = () => {
    onOpen?.();
    setOpen(true);
  };

  return (
    <>
      {variant === "field" ? (
        <button
          type="button"
          onClick={show}
          className="group flex h-10 w-full items-center gap-2.5 rounded-xl border-[1.5px] border-line-2 bg-card px-3 text-sm text-ink-3 transition hover:border-ink hover:text-ink-2"
          aria-label="Search exams and tools"
        >
          <SearchIcon className="h-4 w-4 text-ink-2" />
          <span className="flex-1 truncate text-left">Search exam or tool…</span>
          <kbd className="rounded-md border border-line-2 bg-paper px-1.5 py-0.5 font-mono text-[0.65rem] text-ink-3">/</kbd>
        </button>
      ) : (
        <button
          type="button"
          onClick={show}
          className="grid h-10 w-10 place-items-center rounded-full border-[1.5px] border-line-2 bg-card text-ink transition hover:border-ink"
          aria-label="Search exams and tools"
        >
          <SearchIcon className="h-[18px] w-[18px]" />
        </button>
      )}

      {/* Rendered into <body>: the header's backdrop-blur would otherwise trap this fixed overlay inside the navbar. */}
      {open && createPortal(
        <div
          className="fixed inset-0 z-[60] flex items-start justify-center bg-ink/45 px-3 pt-[10vh] backdrop-blur-sm sm:px-4"
          onPointerDown={() => setOpen(false)}
        >
          <div
            className="card w-full max-w-xl overflow-hidden shadow-[var(--shadow-lift)]"
            role="dialog"
            aria-modal="true"
            aria-label="Search exams and tools"
            onPointerDown={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 border-b border-dashed border-line-2 px-4 py-3.5">
              <SearchIcon className="h-5 w-5 shrink-0 text-ink" />
              <input
                ref={input}
                type="search"
                autoComplete="off"
                spellCheck={false}
                enterKeyHint="go"
                placeholder="Exam, tool or size, e.g. SBI PO, 20 KB, PDF"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => onKey(e, pick, () => setOpen(false))}
                className="w-full min-w-0 appearance-none border-0 bg-transparent p-0 text-base text-ink outline-none placeholder:text-ink-3 focus:outline-none focus-visible:outline-none"
                role="combobox"
                aria-autocomplete="list"
                aria-expanded="true"
                aria-controls={listId}
                aria-activedescendant={results.length ? `${listId}-${active}` : undefined}
              />
              <button type="button" onClick={() => setOpen(false)} className="rounded-md border border-line-2 px-1.5 py-0.5 font-mono text-[0.65rem] text-ink-3 hover:border-ink hover:text-ink">
                ESC
              </button>
            </div>
            <SearchResults id={listId} items={results} query={query} active={active} onHover={setActive} onPick={pick} maxHeight="max-h-[min(62vh,480px)]" />
            <div className="hidden items-center gap-4 border-t border-dashed border-line-2 px-4 py-2 font-mono text-[0.65rem] text-ink-3 sm:flex">
              <span><kbd className="font-semibold">↑ ↓</kbd> move</span>
              <span><kbd className="font-semibold">↵</kbd> open</span>
              <span><kbd className="font-semibold">esc</kbd> close</span>
            </div>
          </div>
        </div>,
        document.body,
      )}
    </>
  );
}
