import Link from "next/link";
import ToolPage from "@/components/ToolPage";
import { PdfToJpg } from "@/components/PdfTools";
import { pageMetadata } from "@/lib/seo";

const path = "/tools/pdf-to-jpg";

export const metadata = pageMetadata({
  title: "PDF to JPG Converter — Under 100 KB per Page",
  description: "Convert each page of a PDF into a JPG image at 100–300 DPI, with an optional size limit like 100 KB per page. Free, works on phones, no upload.",
  path,
});

export default function PdfToJpgPage() {
  return (
    <ToolPage
      title="PDF to JPG Converter"
      path={path}
      kicker="PDF"
      intro="Some forms want a certificate as a JPG, not a PDF. Add the PDF and download every page as a separate JPG image."
      tool={<PdfToJpg />}
      steps={["Add your PDF.", "Choose the resolution — 150 DPI suits most forms.", "Set a size limit per page if your form has one.", "Convert and download the pages you need."]}
      faqs={[
        { q: "Which DPI should I choose?", a: "150 DPI is clear and small. Use 200–300 DPI only if the form asks for it or you need to print." },
        { q: "How do I get a page under 100 KB?", a: "Choose the 100 KB target before converting. Each page is compressed to fit." },
        { q: "Does it work with password-protected PDFs?", a: "Only if the PDF opens without a password. Remove the password first with the app that created it." },
      ]}
    >
      <h2>Next steps</h2>
      <p>
        Need an exact pixel size or cm size for the image? Run the page through the <Link href="/tools/photo-resizer">photo resizer</Link> or{" "}
        <Link href="/tools/resize-image-in-cm">resize image in cm</Link>.
      </p>
    </ToolPage>
  );
}
