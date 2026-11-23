"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "./Logo";
import BrandName from "./BrandName";
import { SearchDialogButton } from "./ExamSearch";
import { siteConfig } from "@/lib/site";
import type { SearchItem } from "@/lib/search";
import type { NavMenu } from "@/lib/nav";

type MenuId = NavMenu["id"];

function Chevron({ open }: { open: boolean }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 12 12" className={`h-3 w-3 transition-transform ${open ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth={1.8}>
      <path d="m3 4.5 3 3 3-3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function Header({
  searchIndex,
  menus,
  examCount,
}: {
  searchIndex: SearchItem[];
  menus: NavMenu[];
  examCount: number;
}) {
  const pathname = usePathname() ?? "/";
  const [open, setOpen] = useState<MenuId | null>(null);
  const [sheet, setSheet] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const headerRef = useRef<HTMLElement>(null);

  // Close menus whenever the page changes.
  useEffect(() => {
    setOpen(null);
    setSheet(false);
  }, [pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Esc and outside clicks close the mega menu.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(null);
    const onDown = (e: PointerEvent) => {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) setOpen(null);
    };
    window.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onDown);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onDown);
    };
  }, [open]);

  // Lock page scroll behind the mobile sheet.
  useEffect(() => {
    if (!sheet) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setSheet(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [sheet]);

  const hoverOpen = (id: MenuId) => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpen(id);
  };
  const hoverClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setOpen(null), 160);
  };

  const isActive = (m: NavMenu) => m.match.some((p) => pathname === p || pathname.startsWith(p));
  const blogActive = pathname.startsWith("/blog");
  const current = menus.find((m) => m.id === open);

  return (
    <>
      {/* slim trust strip (desktop) */}
      <div className="hidden bg-ink text-card/75 md:block">
        <div className="shell flex h-8 items-center justify-between font-mono text-[0.68rem] uppercase tracking-[0.12em]">
          <p className="flex items-center gap-4">
            <span><span className="text-marker">✓</span> Free</span>
            <span><span className="text-marker">✓</span> Nothing is uploaded</span>
            <span><span className="text-marker">✓</span> {examCount} exam presets</span>
          </p>
          <p className="flex items-center gap-4">
            <Link href="/about" className="hover:text-card">About</Link>
            <Link href="/contact" className="hover:text-card">Contact</Link>
          </p>
        </div>
      </div>

      <header
        ref={headerRef}
        onMouseLeave={hoverClose}
        className={`sticky top-0 z-40 border-b transition-[background-color,box-shadow,border-color] ${
          scrolled || open
            ? "border-line bg-paper/95 shadow-[0_6px_24px_-18px_rgba(20,23,43,0.45)] backdrop-blur-md"
            : "border-transparent bg-paper/80 backdrop-blur-sm"
        }`}
      >
        <div className="shell flex h-16 items-center gap-3 lg:gap-6">
          <Link href="/" className="flex shrink-0 items-center gap-2.5" aria-label={`${siteConfig.name} home`}>
            <Logo />
            <BrandName className="text-lg sm:text-xl" />
          </Link>

          {/* desktop nav */}
          <nav aria-label="Main" className="hidden lg:block">
            <ul className="flex items-center gap-1">
              {menus.map((m) => {
                const active = isActive(m);
                const expanded = open === m.id;
                return (
                  <li key={m.id} onMouseEnter={() => hoverOpen(m.id)}>
                    <button
                      type="button"
                      aria-expanded={expanded}
                      aria-controls={`menu-${m.id}`}
                      onClick={() => setOpen(expanded ? null : m.id)}
                      className={`relative flex items-center gap-1.5 rounded-full px-3 py-2 text-[0.92rem] font-semibold transition ${
                        expanded ? "bg-ink text-card" : active ? "text-ink" : "text-ink-2 hover:bg-paper-2 hover:text-ink"
                      }`}
                    >
                      {m.label}
                      <Chevron open={expanded} />
                      {active && !expanded && <span aria-hidden="true" className="absolute inset-x-3 -bottom-0.5 h-[5px] rounded-full bg-marker" />}
                    </button>
                  </li>
                );
              })}
              <li onMouseEnter={hoverClose}>
                <Link
                  href="/blog"
                  className={`relative block rounded-full px-3 py-2 text-[0.92rem] font-semibold transition ${blogActive ? "text-ink" : "text-ink-2 hover:bg-paper-2 hover:text-ink"}`}
                >
                  Blog
                  {blogActive && <span aria-hidden="true" className="absolute inset-x-3 -bottom-0.5 h-[5px] rounded-full bg-marker" />}
                </Link>
              </li>
            </ul>
          </nav>

          <div className="ml-auto flex items-center gap-2">
            <div className="hidden w-60 md:block xl:w-72">
              <SearchDialogButton index={searchIndex} variant="field" onOpen={() => setOpen(null)} />
            </div>
            <div className="md:hidden">
              <SearchDialogButton index={searchIndex} variant="icon" onOpen={() => setOpen(null)} />
            </div>
            <Link href="/tools/photo-resizer" className="btn btn-pen hidden !px-4 !py-2.5 !text-sm xl:inline-flex">
              Resize a photo
            </Link>
            <button
              type="button"
              onClick={() => setSheet(true)}
              className="grid h-10 w-10 place-items-center rounded-full border-[1.5px] border-line-2 bg-card transition hover:border-ink lg:hidden"
              aria-label="Open menu"
              aria-expanded={sheet}
            >
              <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth={2.4} aria-hidden="true">
                <path d="M4 7h16M4 12h16M4 17h10" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </div>

        {/* desktop mega menu */}
        {current && (
          <div
            id={`menu-${current.id}`}
            className="absolute inset-x-0 top-full hidden animate-[menu-in_160ms_ease-out] lg:block"
            onMouseEnter={() => hoverOpen(current.id)}
          >
            <div className="shell pt-2">
              <div className="card overflow-hidden shadow-[var(--shadow-lift)]">
                <div className={`grid gap-x-8 gap-y-6 p-6 ${current.id === "exams" ? "grid-cols-4 xl:grid-cols-5" : current.id === "pdf" ? "grid-cols-2" : "grid-cols-4"}`}>
                  {current.groups.map((g) => (
                    <div key={g.title} className="min-w-0">
                      <p className="font-mono text-[0.66rem] font-extrabold uppercase tracking-[0.16em] text-stamp">{g.title}</p>
                      <ul className="mt-2.5 space-y-0.5">
                        {g.links.map((l) => {
                          const here = pathname === l.href;
                          return (
                            <li key={l.href}>
                              <Link
                                href={l.href}
                                aria-current={here ? "page" : undefined}
                                className={`group -mx-2 block rounded-lg px-2 py-1.5 transition ${here ? "bg-paper-2" : "hover:bg-paper-2"}`}
                              >
                                <span className="block font-semibold leading-snug text-ink group-hover:text-pen">{l.label}</span>
                                {l.note && <span className="block font-mono text-[0.66rem] leading-tight text-ink-3">{l.note}</span>}
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between border-t border-dashed border-line-2 bg-paper-2/60 px-6 py-3">
                  <Link href={current.footer.href} className="text-sm font-semibold text-pen hover:underline">
                    {current.footer.label} →
                  </Link>
                  <span className="font-mono text-[0.66rem] uppercase tracking-[0.12em] text-ink-3">Tip: press / to search</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* mobile sheet */}
      {sheet && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Menu">
          <button type="button" aria-label="Close menu" onClick={() => setSheet(false)} className="absolute inset-0 animate-[fade-in_160ms_ease-out] bg-ink/45 backdrop-blur-sm" />
          <div className="absolute inset-y-0 right-0 flex w-[88%] max-w-sm animate-[sheet-in_200ms_ease-out] flex-col bg-paper shadow-2xl">
            <div className="flex h-16 items-center justify-between border-b border-line px-4">
              <Link href="/" className="flex items-center gap-2" onClick={() => setSheet(false)}>
                <Logo className="h-7 w-7" />
                <BrandName className="text-lg" />
              </Link>
              <button type="button" onClick={() => setSheet(false)} aria-label="Close menu" className="grid h-10 w-10 place-items-center rounded-full border-[1.5px] border-line-2 bg-card text-lg">
                ✕
              </button>
            </div>
            <div className="scroll-thin flex-1 overflow-y-auto px-4 py-4">
              <Link href="/tools/photo-resizer" className="btn btn-pen w-full py-3.5">Resize a photo</Link>
              <nav aria-label="Mobile" className="mt-4 divide-y divide-dashed divide-line-2 rounded-2xl border border-line bg-card">
                {menus.map((m) => (
                  <details key={m.id} className="group" open={isActive(m)}>
                    <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3.5 font-display text-lg font-bold text-ink">
                      {m.label}
                      <span className="grid h-7 w-7 place-items-center rounded-full border border-line-2 text-sm transition group-open:rotate-45">+</span>
                    </summary>
                    <div className="space-y-4 px-4 pb-4">
                      {m.groups.map((g) => (
                        <div key={g.title}>
                          <p className="font-mono text-[0.64rem] font-extrabold uppercase tracking-[0.16em] text-stamp">{g.title}</p>
                          <ul className="mt-1.5 grid grid-cols-2 gap-x-3">
                            {g.links.map((l) => (
                              <li key={l.href}>
                                <Link href={l.href} className={`block rounded-md py-1.5 text-[0.92rem] leading-snug ${pathname === l.href ? "font-bold text-pen" : "text-ink-2"}`}>
                                  {l.label}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                      <Link href={m.footer.href} className="inline-block text-sm font-semibold text-pen">{m.footer.label} →</Link>
                    </div>
                  </details>
                ))}
                <Link href="/blog" className="block px-4 py-3.5 font-display text-lg font-bold text-ink">Blog</Link>
              </nav>
              <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2 px-1 text-sm text-ink-2">
                <li><Link href="/about">About</Link></li>
                <li><Link href="/contact">Contact</Link></li>
                <li><Link href="/privacy-policy">Privacy</Link></li>
                <li><Link href="/disclaimer">Disclaimer</Link></li>
              </ul>
              <p className="mt-6 px-1 font-mono text-[0.68rem] uppercase tracking-[0.12em] text-ink-3">
                ✓ Free · ✓ Nothing uploaded · ✓ {examCount} exams
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
