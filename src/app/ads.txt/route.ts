// Serves /ads.txt from the AdSense publisher ID, so you only set it once.
// NEXT_PUBLIC_ADSENSE_CLIENT looks like "ca-pub-1234567890123456".
import { siteConfig } from "@/lib/site";

export const dynamic = "force-static";

export function GET() {
  const pub = siteConfig.adsenseClient.replace(/^ca-/, "");
  const body = pub ? `google.com, ${pub}, DIRECT, f08c47fec0942fa0\n` : "# Add NEXT_PUBLIC_ADSENSE_CLIENT to publish ads.txt\n";
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
