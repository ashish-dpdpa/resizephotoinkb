"use client";

import { useEffect } from "react";
import { siteConfig } from "@/lib/site";

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

/**
 * Manual AdSense unit. Renders nothing until NEXT_PUBLIC_ADSENSE_CLIENT is set,
 * so the site stays clean while it is under review. Auto ads (enabled in the
 * AdSense dashboard) also work with just the script in the layout.
 */
export default function AdSlot({ slot, className = "" }: { slot?: string; className?: string }) {
  useEffect(() => {
    if (!siteConfig.adsenseClient || !slot) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      /* ad blocked or not ready */
    }
  }, [slot]);

  if (!siteConfig.adsenseClient || !slot) return null;
  return (
    <div className={`my-6 text-center ${className}`}>
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client={siteConfig.adsenseClient}
        data-ad-slot={slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}
