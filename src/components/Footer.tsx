import Link from "next/link";
import Logo from "./Logo";
import { siteConfig } from "@/lib/site";
import { exams } from "@/lib/exams";
import { tools } from "@/lib/tools";

export default function Footer() {
  return (
    <footer className="mt-24 bg-ink text-card/80">
      <div className="shell grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-2.5">
            <Logo />
            <span className="font-display text-xl font-extrabold text-card">{siteConfig.name}</span>
          </div>
          <p className="mt-4 max-w-xs text-sm leading-relaxed">
            {siteConfig.tagline}. Your photos are processed on your own device and are never uploaded.
          </p>
          <p className="mt-5 inline-block -rotate-3 rounded border-2 border-stamp px-2 py-1 font-mono text-[0.7rem] font-extrabold uppercase tracking-[0.16em] text-stamp">
            Free · No sign-up
          </p>
        </div>
        <FooterCol title="Tools" links={tools.slice(0, 6).map((t) => ({ href: t.href, label: t.title }))} />
        <FooterCol
          title="Exams"
          links={[
            ...exams.slice(0, 7).map((e) => ({ href: `/exams/${e.slug}`, label: `${e.name} photo & signature` })),
            { href: "/exams", label: "All exams →" },
          ]}
        />
        <FooterCol
          title="Site"
          links={[
            { href: "/blog", label: "Blog" },
            { href: "/about", label: "About us" },
            { href: "/contact", label: "Contact" },
            { href: "/privacy-policy", label: "Privacy policy" },
            { href: "/terms", label: "Terms of use" },
            { href: "/disclaimer", label: "Disclaimer" },
          ]}
        />
      </div>
      <div className="border-t border-dashed border-card/15">
        <p className="shell py-5 text-xs text-card/50">
          © {new Date().getFullYear()} {siteConfig.name}. Not affiliated with SSC, UPSC, IBPS, SBI, RRB, UPPRPB, NTA, CBSE or any government body.
        </p>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: { href: string; label: string }[] }) {
  return (
    <div>
      <p className="font-mono text-[0.68rem] uppercase tracking-[0.14em] text-card/45">{title}</p>
      <ul className="mt-4 space-y-2.5 text-sm">
        {links.map((l) => (
          <li key={l.href}>
            <Link href={l.href} className="transition hover:text-marker">{l.label}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
