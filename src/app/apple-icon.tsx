import { ImageResponse } from "next/og";

// iPhone/iPad home-screen icon (180 × 180), drawn from the brand mark.
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#f7f3ea" }}>
        <div
          style={{
            width: 110,
            height: 124,
            background: "#2337c6",
            borderRadius: 16,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "flex-end",
            position: "relative",
          }}
        >
          <div style={{ position: "absolute", top: 26, width: 42, height: 42, borderRadius: 999, background: "#fffdf8" }} />
          <div style={{ width: 76, height: 40, background: "#fffdf8", borderRadius: "40px 40px 0 0" }} />
          <div
            style={{
              position: "absolute",
              top: -18,
              right: -18,
              width: 44,
              height: 44,
              borderRadius: 999,
              background: "#d2452b",
              border: "6px solid #f7f3ea",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {/* tick drawn with two borders, so no font is needed */}
            <div style={{ width: 10, height: 18, borderRight: "5px solid #fff", borderBottom: "5px solid #fff", transform: "rotate(45deg)", marginTop: -4 }} />
          </div>
        </div>
      </div>
    ),
    size,
  );
}
