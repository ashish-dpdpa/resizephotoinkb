"use client";

import { usePathname } from "next/navigation";

/** Hides the public site's header and footer inside the admin panel. */
export default function HideOnAdmin({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname === "/admin" || pathname.startsWith("/admin/")) return null;
  return <>{children}</>;
}
