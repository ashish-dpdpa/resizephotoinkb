/** "Check the official notice" callout, styled like a pinned paper slip. */
export default function NoticeBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative mt-6 rounded-xl border border-[#eadf9e] bg-[#fff9d6] px-5 py-4 pl-14 text-sm leading-relaxed text-ink-2">
      <span aria-hidden="true" className="absolute left-4 top-4 grid h-7 w-7 place-items-center rounded-full bg-ink font-mono text-xs font-extrabold text-marker">!</span>
      {children}
    </div>
  );
}
