import Link from "next/link";
import ImageTool from "@/components/ImageTool";
import ToolPage from "@/components/ToolPage";
import { pageMetadata } from "@/lib/seo";

const path = "/tools/dpi-converter";

export const metadata = pageMetadata({
  title: "DPI Converter: Change Image to 200 or 300 DPI Online",
  description: "Change the DPI of a JPG to 200 or 300 DPI for exam and job forms without changing the picture, and keep it under a KB limit. Free and private.",
  path,
});

export default function DpiConverterPage() {
  return (
    <ToolPage
      title="DPI Converter"
      path={path}
      kicker="Converter"
      intro="Some forms ask for a 200 DPI or 300 DPI image. Most phones save photos at 72 DPI. This tool rewrites the DPI stored in your JPG (the picture and its pixels stay exactly the same) and keeps the file inside your KB limit."
      tool={<ImageTool compressOnly showDpi defaultDpi={200} defaultMinKB={0} defaultMaxKB={500} fileBaseName="dpi" />}
      steps={[
        "Type the DPI your form needs (200 is the most common, 300 for print).",
        "Set the maximum KB from your form, and a minimum if it has one.",
        "Add your image.",
        "Download the JPG. It now carries the new DPI.",
      ]}
      faqs={[
        { q: "Does changing DPI change the image quality?", a: "No. DPI is a label that tells printers how big to print each pixel. The pixels stay the same; only the stored DPI value changes." },
        { q: "How do I check the DPI of an image?", a: "On Windows, right-click the file → Properties → Details and look at Horizontal resolution. On a Mac, open it in Preview → Tools → Show Inspector." },
        { q: "My form wants a size in cm at 200 DPI. What should I use?", a: "Use the resize image in cm tool. It sets the pixel size from the cm and DPI together." },
      ]}
    >
      <h2>DPI, pixels and centimetres</h2>
      <p>
        DPI connects pixels to physical size: <strong>pixels = cm ÷ 2.54 × DPI</strong>. A 200 × 230 px photo is about 2.5 × 2.9 cm at
        200 DPI, but 7.1 × 8.1 cm at 72 DPI. That is why some portals check DPI as well as pixels.
      </p>
      <p>
        If your notice gives a size in centimetres, use <Link href="/tools/resize-image-in-cm">resize image in cm</Link>. To just calculate the
        numbers, use the <Link href="/tools/pixel-to-cm">pixel to cm converter</Link>.
      </p>
    </ToolPage>
  );
}
