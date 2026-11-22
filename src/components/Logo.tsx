/** Brand mark: a passport-photo frame with crop marks and a tick. */
export default function Logo({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <rect x="5" y="4" width="22" height="24" rx="3" fill="#2337c6" />
      <circle cx="16" cy="13" r="4.2" fill="#fffdf8" />
      <path d="M8.5 25c1.4-4.4 4.2-6.4 7.5-6.4s6.1 2 7.5 6.4" fill="#fffdf8" />
      <path d="M1.5 6V1.5H6M30.5 26v4.5H26" fill="none" stroke="#14172b" strokeWidth="2" strokeLinecap="round" />
      <circle cx="25.5" cy="6.5" r="4.5" fill="#d2452b" stroke="#f7f3ea" strokeWidth="1.5" />
      <path d="m23.6 6.6 1.3 1.3 2.4-2.6" fill="none" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
