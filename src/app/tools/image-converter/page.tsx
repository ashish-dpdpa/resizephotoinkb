import Link from "next/link";
import ImageConverter from "@/components/ImageConverter";
import ToolPage from "@/components/ToolPage";
import { convertPages } from "@/lib/convertPages";
import { pageMetadata } from "@/lib/seo";

const path = "/tools/image-converter";

export const metadata = pageMetadata({
  title: "Image Converter: HEIC, WebP, PNG to JPG and More",
  description:
    "Convert images between JPG, PNG and WebP, including iPhone HEIC photos. Batch convert, set a KB limit and download as a ZIP. Runs in your browser, nothing is uploaded.",
  path,
});

export default function ImageConverterPage() {
  return (
    <ToolPage
      title="Image Converter"
      path={path}
      kicker="Converter"
      intro="Convert photos and images to JPG, PNG or WebP, including HEIC photos from iPhones. Add up to 30 at once, set a size limit if your form has one, and download them individually or as a ZIP."
      tool={<ImageConverter defaultTo="jpg" />}
      steps={[
        "Choose the format you need: JPG for forms and sharing, PNG for lossless editing or transparency, WebP for websites.",
        "Add your images: tap the box, drop them in, or paste with Ctrl+V. HEIC, JPG, PNG, WebP, GIF, BMP and AVIF all work.",
        "For JPG or WebP, adjust the quality, or type a Max size in KB to make every file fit under it.",
        "Download each file, or Download all as a ZIP.",
      ]}
      faqs={[
        {
          q: "Which format should I use for an exam or government form?",
          a: "JPG (also written JPEG). That's what almost every Indian exam portal asks for. Then use the photo or signature resizer to match the exact pixel size and KB range.",
        },
        {
          q: "Are my images uploaded?",
          a: "No. Everything runs in your browser on your own device. Location and camera details stored inside the original files are removed from the converted copies.",
        },
        {
          q: "Why does HEIC take longer the first time?",
          a: "Most browsers can't open HEIC by themselves, so the page downloads a HEIC decoder (about 1 MB) the first time you add one. Safari opens HEIC natively and skips this.",
        },
        {
          q: "Is there a limit on file size or count?",
          a: "Up to 30 images at a time. Very large images (over about 16 megapixels) are scaled down slightly so phones can process them.",
        },
      ]}
    >
      <h2>Popular conversions</h2>
      <ul>
        {convertPages.map((p) => (
          <li key={p.slug}>
            <Link href={`/tools/${p.slug}`}>{p.title.replace(" Converter", "")}</Link>: {p.description.split(". ")[0]}.
          </li>
        ))}
      </ul>
      <h2>Need an exact size too?</h2>
      <p>
        Converting changes the format, not the pixel size. For exam uploads, follow up with the{" "}
        <Link href="/tools/photo-resizer">photo resizer</Link>, the <Link href="/tools/signature-resizer">signature resizer</Link> or a{" "}
        <Link href="/tools/compress-image-to-50kb">compress to KB</Link> tool.
      </p>
    </ToolPage>
  );
}
