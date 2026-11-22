import Link from "next/link";
import Logo from "./Logo";
import { SearchDialogButton } from "./ExamSearch";
import { mainNav, siteConfig } from "@/lib/site";
import type { SearchItem } from "@/lib/search";

export default function Header({ searchIndex }: { searchIndex: SearchItem[] }) {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper/85 backdrop-blur-md">
      <div className="shell flex h-16 items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2.5" aria-label={`${siteConfig.name} home`}>
          <Logo />
          <span className="font-display text-xl font-extrabold tracking-tight text-ink">{siteConfig.name}</span>
        </Link>

        <nav aria-label="Main" className="hidden md:block">
          <ul className="flex items-center gap-1 text-[0.92rem] font-semibold text-ink-2">
            {mainNav.map((n) => (
              <li key={n.href}>
                <Link href={n.href} className="rounded-full px-3 py-1.5 transition hover:bg-paper-2 hover:text-ink">
                  {n.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <SearchDialogButton index={searchIndex} />
          <details className="relative md:hidden">
            <summary className="flex h-9 w-9 cursor-pointer list-none items-center justify-center rounded-full border-[1.5px] border-line-2 bg-card" aria-label="Menu">
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.4} aria-hidden="true">
                <path d="M4 7h16M4 12h16M4 17h10" strokeLinecap="round" />
              </svg>
            </summary>
            <ul className="card absolute right-0 mt-2 w-52 p-1.5">
              {mainNav.map((n) => (
                <li key={n.href}>
                  <Link href={n.href} className="block rounded-lg px-3 py-2.5 font-semibold hover:bg-paper-2">{n.label}</Link>
                </li>
              ))}
            </ul>
          </details>
        </div>
      </div>
    </header>
  );
}
