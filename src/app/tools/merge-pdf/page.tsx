import Link from "next/link";
import ToolPage from "@/components/ToolPage";
import { MergePdf } from "@/components/PdfTools";
import { pageMetadata } from "@/lib/seo";

const path = "/tools/merge-pdf";

export const metadata = pageMetadata({
  title: "Merge PDF Files Online: Free, No Upload",
  description: "Combine several PDFs into one file in the order you choose: certificates, mark sheets, ID proofs. It runs in your browser and nothing is uploaded.",
  path,
});

export default function MergePdfPage() {
  return (
    <ToolPage
      title="Merge PDF"
      path={path}
      kicker="PDF"
      intro="Many forms accept just one document upload. Join your certificates and mark sheets into a single PDF, in the order the form expects."
      tool={<MergePdf />}
      steps={["Add two or more PDFs.", "Arrange them with the arrows.", "Press Merge.", "Download the combined PDF, and compress it if it is over the limit."]}
      faqs={[
        { q: "Does merging reduce quality?", a: "No. Pages are copied as they are, so text stays selectable and sharp." },
        { q: "The merged file is too big. What now?", a: "Run it through Compress PDF and choose your form’s limit." },
        { q: "Can I merge images and PDFs together?", a: "Convert the images to PDF first with Image to PDF, then merge the PDFs." },
      ]}
    >
      <h2>Related</h2>
      <p>
        <Link href="/tools/compress-pdf">Compress PDF</Link> · <Link href="/tools/image-to-pdf">Image to PDF</Link> ·{" "}
        <Link href="/tools/pdf-to-jpg">PDF to JPG</Link>
      </p>
    </ToolPage>
  );
}
