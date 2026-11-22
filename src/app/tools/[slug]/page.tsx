import Link from "next/link";
import { notFound } from "next/navigation";
import ImageTool from "@/components/ImageTool";
import ToolPage from "@/components/ToolPage";
import { pageMetadata } from "@/lib/seo";
import { allDocPages, docNoun } from "@/lib/docs";
import { allSizePages, getSizePage, maxPages, rangePages, cmToPx, type SizePage } from "@/lib/sizePages";
import { getPdfSizePage, pdfSizePages, type PdfSizePage } from "@/lib/pdfPages";
import { CompressPdf, ImageToPdf } from "@/components/PdfTools";

export const dynamicParams = false;

export function generateStaticParams() {
  return [...allSizePages, ...pdfSizePages].map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = getSizePage(slug) ?? getPdfSizePage(slug);
  if (!page) return {};
  return pageMetadata({ title: page.metaTitle, description: page.description, path: `/tools/${page.slug}` });
}

/** Exam document pages whose limits match this page. */
function matchingDocs(page: SizePage) {
  const docs = allDocPages();
  if (page.kind === "max") {
    const sizes = maxPages.map((m) => m.kb);
    return docs.filter((d) => sizes.find((s) => s >= d.doc.maxKB) === page.kb);
  }
  if (page.kind === "range") {
    return docs.filter((d) => d.doc.minKB === page.minKB && Math.abs(d.doc.maxKB - page.maxKB) <= 1);
  }
  return docs.filter((d) => d.doc.kind === (page.subject === "signature" ? "signature" : "photo") && d.doc.minKB === page.minKB);
}

function Tool({ page }: { page: SizePage }) {
  if (page.kind === "max") {
    return <ImageTool compressOnly defaultMinKB={0} defaultMaxKB={page.kb} fileBaseName={`compressed-${page.kb}kb`} />;
  }
  if (page.kind === "range") {
    return <ImageTool compressOnly defaultMinKB={page.minKB} defaultMaxKB={page.maxKB} fileBaseName={`${page.subject}-${page.minKB}-${page.maxKB}kb`} />;
  }
  return (
    <ImageTool
      presets={[
        {
          id: page.slug,
          label: `${page.widthCm} × ${page.heightCm} cm ${page.subject}`,
          width: cmToPx(page.widthCm, page.dpi),
          height: cmToPx(page.heightCm, page.dpi),
          minKB: page.minKB,
          maxKB: page.maxKB,
          dpi: page.dpi,
          signature: page.subject === "signature",
        },
      ]}
      defaultUnit="cm"
      openSize
      fileBaseName={`${page.subject}-${page.widthCm}x${page.heightCm}cm`}
    />
  );
}

function steps(page: SizePage): string[] {
  if (page.kind === "dimension") {
    return [
      "Choose your photo or a picture of your signature.",
      `The size is already set to ${page.widthCm} × ${page.heightCm} cm at ${page.dpi} DPI. Change cm, DPI or KB if your notice says otherwise.`,
      "Drag and zoom so the face or signature fills the frame.",
      "Download the JPG once it shows “within limit”.",
    ];
  }
  const range = page.kind === "range" ? `${page.minKB}–${page.maxKB} KB` : `under ${page.kb} KB`;
  return [
    "Tap the upload box and choose your image (or paste it with Ctrl+V).",
    `The tool finds the sharpest version that is ${range}${page.kind === "range" ? ", padding small files up to the minimum" : ""}.`,
    page.kind === "max" ? "If your form also needs a minimum size, type it in the Min KB box." : "Check the KB meter shows the file inside the green window.",
    "Tap Download JPG and upload it to your form.",
  ];
}

export default async function SizeToolPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const pdfPage = getPdfSizePage(slug);
  if (pdfPage) return <PdfSizeToolPage page={pdfPage} />;
  const page = getSizePage(slug);
  if (!page) notFound();
  const docs = matchingDocs(page);
  const siblings =
    page.kind === "max" ? maxPages.filter((m) => m.slug !== page.slug) : page.kind === "range" ? rangePages.filter((r) => r.slug !== page.slug) : [];

  return (
    <ToolPage
      title={page.title}
      path={`/tools/${page.slug}`}
      intro={page.intro}
      kicker={page.kind === "max" ? "Compress" : page.kind === "range" ? "KB range" : "Size in cm"}
      tool={<Tool page={page} />}
      steps={steps(page)}
      faqs={page.faqs}
    >
      <h2>Where this size is used</h2>
      <ul>
        {page.uses.map((u) => (
          <li key={u}>{u}</li>
        ))}
      </ul>
      <p>{page.note}</p>

      {docs.length > 0 && (
        <>
          <h2>Exam uploads with this limit</h2>
          <p>Each link opens the tool already set to that exam&apos;s exact pixel size and KB range.</p>
          <ul>
            {docs.map((p) => (
              <li key={p.path}>
                <Link href={p.path}>
                  {p.exam.name} {docNoun[p.doc.kind].toLowerCase()}
                </Link>{" "}
                ({p.doc.minKB}–{p.doc.maxKB} KB, {p.doc.width} × {p.doc.height} px)
              </li>
            ))}
          </ul>
        </>
      )}

      {siblings.length > 0 && (
        <>
          <h2>Other sizes</h2>
          <p>
            {siblings.map((s, i) => (
              <span key={s.slug}>
                <Link href={`/tools/${s.slug}`}>{s.kind === "max" ? `${s.kb} KB` : s.title.replace("Resize ", "")}</Link>
                {i < siblings.length - 1 ? " · " : ""}
              </span>
            ))}
          </p>
        </>
      )}

      <p>
        Need an exact size in pixels or cm as well? Use the <Link href="/tools/photo-resizer">photo resizer</Link>, the{" "}
        <Link href="/tools/signature-resizer">signature resizer</Link> or <Link href="/tools/resize-image-in-cm">resize image in cm</Link>.
      </p>
    </ToolPage>
  );
}

function PdfSizeToolPage({ page }: { page: PdfSizePage }) {
  const siblings = pdfSizePages.filter((p) => p.kind === page.kind && p.slug !== page.slug);
  const isCompress = page.kind === "compress-pdf";
  return (
    <ToolPage
      title={page.title}
      path={`/tools/${page.slug}`}
      intro={page.intro}
      kicker="PDF"
      tool={isCompress ? <CompressPdf defaultMaxKB={page.kb} /> : <ImageToPdf defaultMaxKB={page.kb} />}
      steps={
        isCompress
          ? ["Add your PDF.", `Keep the target at ${page.title.replace("Compress PDF to ", "")} or pick another size.`, "Press Compress PDF and wait a few seconds.", "Download the smaller PDF and upload it to your form."]
          : ["Add one or more photos or scanned pages.", "Put them in order with the arrows.", "Press Create PDF.", "Download the PDF and upload it to your form."]
      }
      faqs={page.faqs}
    >
      <h2>Where this is needed</h2>
      <ul>
        {page.uses.map((u) => (
          <li key={u}>{u}</li>
        ))}
      </ul>
      <h2>Other sizes</h2>
      <p>
        {siblings.map((s, i) => (
          <span key={s.slug}>
            <Link href={`/tools/${s.slug}`}>{s.title}</Link>
            {i < siblings.length - 1 ? " · " : ""}
          </span>
        ))}
      </p>
      <p>
        More PDF tools: <Link href="/tools/image-to-pdf">image to PDF</Link> · <Link href="/tools/compress-pdf">compress PDF</Link> ·{" "}
        <Link href="/tools/pdf-to-jpg">PDF to JPG</Link> · <Link href="/tools/merge-pdf">merge PDF</Link>
      </p>
    </ToolPage>
  );
}
