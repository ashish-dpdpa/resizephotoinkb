import Link from "next/link";
import ToolPage from "@/components/ToolPage";
import { ImageToPdf } from "@/components/PdfTools";
import { pageMetadata } from "@/lib/seo";

const path = "/tools/image-to-pdf";

export const metadata = pageMetadata({
  title: "Image to PDF Converter — JPG to PDF Under 200 KB",
  description: "Convert JPG, PNG or phone photos into one A4 PDF, with an optional size limit like 100 KB or 200 KB for government forms. Free and private.",
  path,
});

export default function ImageToPdfPage() {
  return (
    <ToolPage
      title="Image to PDF Converter"
      path={path}
      kicker="PDF"
      intro="Photograph your certificates or mark sheets, add the pictures here, and get one tidy A4 PDF — under the size limit your form sets, if it has one."
      tool={<ImageToPdf />}
      steps={[
        "Add your photos or scanned pages (JPG, PNG or WebP).",
        "Put them in the right order with the arrows.",
        "Choose a target size like 200 KB, or No limit.",
        "Press Create PDF and download it.",
      ]}
      faqs={[
        { q: "How do I convert a photo to PDF on my phone?", a: "Open this page on your phone, tap Choose files, pick the photos and press Create PDF. It works in any modern browser." },
        { q: "How do I make the PDF smaller?", a: "Pick a target size before creating the PDF. The tool lowers image resolution and quality just enough to fit." },
        { q: "Can I combine several images into one PDF?", a: "Yes. Every image becomes one page, in the order shown in the list." },
      ]}
    >
      <h2>Tips for document PDFs that portals accept</h2>
      <ul>
        <li>Photograph each page flat, in daylight, from straight above so the text isn’t slanted.</li>
        <li>Crop out the table and background before adding the photo.</li>
        <li>Add only the pages the form asks for — every extra page adds size.</li>
      </ul>
      <p>
        Fixed limit? Use <Link href="/tools/jpg-to-pdf-under-100kb">JPG to PDF under 100 KB</Link> or{" "}
        <Link href="/tools/jpg-to-pdf-under-200kb">under 200 KB</Link>. Already have a PDF that’s too big? <Link href="/tools/compress-pdf">Compress it</Link>.
      </p>
    </ToolPage>
  );
}
