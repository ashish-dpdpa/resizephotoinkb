import Breadcrumbs from "./Breadcrumbs";

export default function LegalPage({
  title,
  path,
  updated,
  children,
}: {
  title: string;
  path: string;
  updated?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="shell py-8 sm:py-12">
      <div className="mx-auto max-w-3xl">
        <Breadcrumbs items={[{ name: title, href: path }]} />
        <h1 className="text-4xl font-extrabold leading-[1.05] text-ink sm:text-5xl">{title}</h1>
        {updated && <p className="mt-3 font-mono text-xs text-ink-3">Last updated · {updated}</p>}
        <div className="card mt-8 p-6 sm:p-10">
          <div className="prose max-w-none prose-headings:font-extrabold">{children}</div>
        </div>
      </div>
    </div>
  );
}
