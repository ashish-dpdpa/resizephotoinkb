import Link from "next/link";
import ToolPage from "@/components/ToolPage";
import { CompressPdf } from "@/components/PdfTools";
import { pageMetadata } from "@/lib/seo";

const path = "/tools/compress-pdf";

export const metadata = pageMetadata({
  title: "Compress PDF to 100 KB, 200 KB, 500 KB or 1 MB",
  description: "Shrink a PDF to the exact size a government or exam portal allows (100 KB, 200 KB, 500 KB or 1 MB) without uploading it anywhere.",
  path,
});

export default function CompressPdfPage() {
  return (
    <ToolPage
      title="Compress PDF"
      path={path}
      kicker="PDF"
      intro="Pick the limit from your form, add the PDF, and download a copy that fits. Everything happens in your browser, so your certificates stay private."
      tool={<CompressPdf />}
      steps={["Add your PDF.", "Pick the target size from your form.", "Press Compress PDF.", "Download the smaller file."]}
      faqs={[
        { q: "How much can a PDF be compressed?", a: "Scanned documents often shrink by 70–95%. A one-page certificate usually fits under 100 KB while staying readable." },
        { q: "Will the quality drop?", a: "The tool lowers resolution only as far as needed for your target. For forms, text stays readable." },
        { q: "Is there a page limit?", a: "No fixed limit, but very long PDFs take longer on phones. Split large files if a portal wants a small size." },
      ]}
    >
      <h2>Pick a size</h2>
      <p>
        <Link href="/tools/compress-pdf-to-100kb">Compress PDF to 100 KB</Link> · <Link href="/tools/compress-pdf-to-200kb">200 KB</Link> ·{" "}
        <Link href="/tools/compress-pdf-to-500kb">500 KB</Link> · <Link href="/tools/compress-pdf-to-1mb">1 MB</Link>
      </p>
      <h2>Why PDFs get too big</h2>
      <p>
        Phone scanners save each page as a large colour photo. A single A4 page at full phone resolution can be 2–4 MB. Lowering it to
        about 150 DPI keeps text sharp on screen and cuts the size dramatically. That is what this tool does.
      </p>
    </ToolPage>
  );
}
