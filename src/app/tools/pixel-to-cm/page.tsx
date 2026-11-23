import Link from "next/link";
import ToolPage from "@/components/ToolPage";
import { PixelConverter } from "@/components/UnitConverter";
import { pageMetadata } from "@/lib/seo";
import { cmToPx } from "@/lib/sizePages";

const path = "/tools/pixel-to-cm";

export const metadata = pageMetadata({
  title: "Pixel to cm Converter (and cm to Pixel) at Any DPI",
  description: "Convert pixels to cm, mm or inches and back at 72, 96, 200 or 300 DPI. See what exam photo sizes like 200 × 230 px or 3.5 × 4.5 cm really mean.",
  path,
});

export default function PixelToCmPage() {
  return (
    <ToolPage
      title="Pixel to cm Converter"
      path={path}
      kicker="Converter"
      intro="Exam notices mix pixels and centimetres. Type either one and see the other instantly, at the DPI your form uses."
      tool={<PixelConverter />}
      steps={[
        "Choose cm, mm or inch.",
        "Set the DPI. 200 is common for exam forms, 300 for printing, 96 for screens.",
        "Type the pixels to get cm, or type cm to get pixels.",
        "Use the result in the photo resizer if you need to make the image.",
      ]}
      faqs={[
        { q: "How many pixels is 1 cm?", a: "It depends on DPI: 1 cm is about 79 px at 200 DPI, 118 px at 300 DPI and 38 px at 96 DPI." },
        { q: "What is the formula?", a: "cm = pixels ÷ DPI × 2.54, and pixels = cm ÷ 2.54 × DPI." },
        { q: "What is 200 × 230 pixels in cm?", a: "About 2.54 × 2.92 cm at 200 DPI." },
      ]}
    >
      <h2>Quick reference</h2>
      <table>
        <thead>
          <tr><th>Size</th><th>96 DPI</th><th>200 DPI</th><th>300 DPI</th></tr>
        </thead>
        <tbody>
          {[1, 2, 3.5, 4.5, 5, 6, 10].map((cm) => (
            <tr key={cm}>
              <td>{cm} cm</td>
              <td>{cmToPx(cm, 96)} px</td>
              <td>{cmToPx(cm, 200)} px</td>
              <td>{cmToPx(cm, 300)} px</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p>
        Ready to resize? Use <Link href="/tools/resize-image-in-cm">resize image in cm</Link> or the{" "}
        <Link href="/tools/photo-resizer">photo resizer</Link>. For background, read{" "}
        <Link href="/guides/photo-size-kb-pixels-dpi-explained">KB vs pixels vs cm vs DPI</Link>.
      </p>
    </ToolPage>
  );
}
