import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Page not found", robots: { index: false, follow: true } };

export default function NotFound() {
  return (
    <div className="shell py-24 text-center">
      <span className="stamp text-xl">Rejected</span>
      <h1 className="mt-8 text-4xl font-extrabold text-ink sm:text-5xl">This page isn’t on the form.</h1>
      <p className="mt-3 text-lg text-ink-2">It doesn’t exist or has moved. Try one of these instead.</p>
      <div className="mt-8 flex justify-center gap-3">
        <Link href="/" className="btn btn-ink">Go home</Link>
        <Link href="/exams" className="btn btn-ghost">Find your exam</Link>
      </div>
    </div>
  );
}
