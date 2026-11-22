import Link from "next/link";
import ImageTool from "@/components/ImageTool";
import ToolPage from "@/components/ToolPage";
import { pageMetadata } from "@/lib/seo";
import { cmToPx } from "@/lib/sizePages";

const path = "/tools/resize-image-in-cm";

export const metadata = pageMetadata({
  title: "Resize Image in cm and KB Online (Width & Height)",
  description: "Resize a photo or signature by width and height in cm, mm or inches at any DPI, and hit a KB range — for forms that give sizes in centimetres. Free.",
  path,
});

const presets = [
  { id: "3.5x4.5", label: "3.5 × 4.5 cm photo", w: 3.5, h: 4.5, min: 20, max: 50, sig: false },
  { id: "6x2", label: "6 × 2 cm signature", w: 6, h: 2, min: 10, max: 20, sig: true },
  { id: "4x2", label: "4 × 2 cm signature", w: 4, h: 2, min: 10, max: 20, sig: true },
  { id: "3.5x1.5", label: "3.5 × 1.5 cm signature", w: 3.5, h: 1.5, min: 3, max: 30, sig: true },
  { id: "5x5", label: "5 × 5 cm (2 × 2 in)", w: 5.08, h: 5.08, min: 10, max: 200, sig: false },
].map((p) => ({
  id: p.id,
  label: p.label,
  width: cmToPx(p.w, 200),
  height: cmToPx(p.h, 200),
  minKB: p.min,
  maxKB: p.max,
  dpi: 200,
  signature: p.sig,
}));

export default function ResizeInCmPage() {
  return (
    <ToolPage
      title="Resize Image in cm"
      path={path}
      kicker="Size in cm"
      intro="Many notices give the photo or signature size in centimetres — 3.5 × 4.5 cm, 6 × 2 cm, 3.5 × 1.5 cm. Type the size in cm, mm or inches, pick a DPI, and the tool converts it to pixels and hits the KB range for you."
      tool={<ImageTool presets={presets} defaultUnit="cm" openSize fileBaseName="resized-cm" />}
      steps={[
        "Pick a common size, or type your width and height in cm (switch to mm or inch if you prefer).",
        "Set the DPI from your notice. If none is given, 200 DPI is a good choice for exam forms.",
        "Add your image, then drag and zoom to frame it.",
        "Check the KB meter and download the JPG.",
      ]}
      faqs={[
        { q: "How do I resize an image in cm?", a: "Choose cm as the unit, type the width and height and the DPI. The tool converts the size to pixels (cm ÷ 2.54 × DPI) and writes the DPI into the JPG." },
        { q: "Why does the DPI matter?", a: "A digital image has no size in cm until a DPI is chosen. 3.5 cm at 200 DPI is 276 pixels wide; at 300 DPI it is 413 pixels." },
        { q: "Can I resize in cm and KB at the same time?", a: "Yes. Set the Min KB and Max KB as well — the tool keeps the cm size and compresses the file into that range." },
      ]}
    >
      <h2>Common sizes in cm and pixels</h2>
      <table>
        <thead>
          <tr><th>Size</th><th>200 DPI</th><th>300 DPI</th></tr>
        </thead>
        <tbody>
          {[
            ["3.5 × 4.5 cm (passport)", 3.5, 4.5],
            ["6 × 2 cm (signature)", 6, 2],
            ["4 × 2 cm (signature)", 4, 2],
            ["3.5 × 1.5 cm (signature)", 3.5, 1.5],
            ["3 × 3 cm (thumb)", 3, 3],
            ["10 × 5 cm (declaration)", 10, 5],
          ].map(([label, w, h]) => (
            <tr key={label as string}>
              <td>{label}</td>
              <td>{cmToPx(w as number, 200)} × {cmToPx(h as number, 200)} px</td>
              <td>{cmToPx(w as number, 300)} × {cmToPx(h as number, 300)} px</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p>
        Only need the numbers? Use the <Link href="/tools/pixel-to-cm">pixel to cm converter</Link>. Need to change only the DPI? Try the{" "}
        <Link href="/tools/dpi-converter">DPI converter</Link>.
      </p>
    </ToolPage>
  );
}
