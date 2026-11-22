import { ImageResponse } from "next/og";
import { siteConfig } from "@/lib/site";

// Social preview card (1200 × 630) used by every page: /og?title=...&tag=...
// Rendered on demand and cached, so each page gets a card with its own title.

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const title = (searchParams.get("title") || "Exam photo & signature resizer").slice(0, 120);
  const tag = (searchParams.get("tag") || "Free · Nothing is uploaded").slice(0, 60);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#f7f3ea",
          padding: "64px 72px",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div style={{ width: 56, height: 62, background: "#2337c6", borderRadius: 8, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", position: "relative" }}>
            <div style={{ position: "absolute", top: 12, width: 20, height: 20, borderRadius: 999, background: "#fffdf8" }} />
            <div style={{ width: 34, height: 20, background: "#fffdf8", borderRadius: "18px 18px 0 0" }} />
          </div>
          <div style={{ display: "flex", fontSize: 38, fontWeight: 800, color: "#14172b" }}>
            ResizePhoto<span style={{ color: "#2337c6" }}>InKB</span>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ fontSize: 22, letterSpacing: 4, textTransform: "uppercase", color: "#d2452b", fontWeight: 700 }}>{tag}</div>
          <div style={{ fontSize: title.length > 60 ? 58 : 70, fontWeight: 800, lineHeight: 1.08, color: "#14172b", maxWidth: 960 }}>{title}</div>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ fontSize: 26, color: "#4a4e66" }}>{siteConfig.url.replace(/^https?:\/\//, "")}</div>
          <div
            style={{
              display: "flex",
              fontSize: 30,
              fontWeight: 800,
              letterSpacing: 5,
              color: "#1d7a4b",
              border: "5px solid #1d7a4b",
              borderRadius: 10,
              padding: "8px 20px",
              transform: "rotate(-8deg)",
            }}
          >
            ACCEPTED
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      headers: { "Cache-Control": "public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400" },
    },
  );
}
