import Link from "next/link";
import { notFound } from "next/navigation";
import ImageTool from "@/components/ImageTool";
import ToolPage from "@/components/ToolPage";
import { pageMetadata } from "@/lib/seo";
import { compressSizes } from "@/lib/tools";
import { docNoun, docPagesForCompressSize } from "@/lib/docs";

// Each size gets its own content so the pages are genuinely different, not copies.
const details: Record<number, { uses: string[]; note: string; min: number }> = {
  10: {
    min: 4,
    uses: ["Signatures for older state PSC and university forms", "Thumb impressions with a 10 KB cap", "Very small profile pictures"],
    note: "10 KB is extremely small. For a colour photo, the tool will usually need to reduce the pixel size as well as the quality. Signatures on a white background compress much better than photos.",
  },
  20: {
    min: 10,
    uses: ["Signatures for SSC and IBPS forms (10–20 KB)", "Photos for some state recruitment and scholarship portals", "Small ID photos for college admission forms"],
    note: "A 200 × 230 px passport photo usually fits under 20 KB with good quality. Larger photos will be scaled down automatically if needed.",
  },
  30: {
    min: 10,
    uses: ["NEET signature (4–30 KB)", "Photos for portals with a 30 KB cap", "Scanned thumb impressions"],
    note: "30 KB is a comfortable size for a passport photo up to about 300 × 400 px.",
  },
  50: {
    min: 20,
    uses: ["IBPS and SBI photos (20–50 KB)", "Thumb impressions for banking forms", "Most state government job portals"],
    note: "50 KB is the most common upper limit in Indian exam forms. If your form also has a minimum like 20 KB, set it in the Minimum box.",
  },
  100: {
    min: 20,
    uses: ["UPSC signature sheet (20–100 KB)", "IBPS handwritten declaration (50–100 KB)", "Scholarship and university document photos"],
    note: "At 100 KB you can keep a fairly large image. Most phone photos only need light compression to reach this size.",
  },
  200: {
    min: 10,
    uses: ["UPSC photo (20–200 KB)", "NEET passport and postcard photos (10–200 KB)", "Passport Seva and visa portal photos"],
    note: "200 KB keeps most phone photos sharp. The tool keeps your original pixel size unless the file cannot fit.",
  },
};

const slugFor = (kb: number) => `compress-image-to-${kb}kb`;

export const dynamicParams = false;

export function generateStaticParams() {
  return compressSizes.map((kb) => ({ slug: slugFor(kb) }));
}

function sizeFromSlug(slug: string) {
  const m = /^compress-image-to-(\d+)kb$/.exec(slug);
  const kb = m ? Number(m[1]) : NaN;
  return (compressSizes as readonly number[]).includes(kb) ? kb : null;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const kb = sizeFromSlug(slug);
  if (!kb) return {};
  return pageMetadata({
    title: `Compress Image to ${kb} KB Online — JPG, PNG to ${kb}KB`,
    description: `Reduce any photo or signature to under ${kb} KB in seconds, without uploading it. Ideal for government exam and job application forms.`,
    path: `/tools/${slug}`,
  });
}

export default async function CompressPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const kb = sizeFromSlug(slug);
  if (!kb) notFound();
  const d = details[kb];
  const others = compressSizes.filter((s) => s !== kb);
  const examDocs = docPagesForCompressSize(kb);

  return (
    <ToolPage
      title={`Compress Image to ${kb} KB`}
      path={`/tools/${slug}`}
      intro={`Choose a JPG, PNG or WebP image and get a JPG under ${kb} KB with the best quality that fits. The image is processed on your device and never uploaded.`}
      tool={<ImageTool compressOnly defaultMinKB={0} defaultMaxKB={kb} fileBaseName={`compressed-${kb}kb`} />}
      steps={[
        "Tap the upload box and choose your image.",
        `The tool automatically finds the highest quality that keeps the file under ${kb} KB.`,
        "If your form also needs a minimum size, type it in the Minimum box.",
        "Tap Download JPG and upload the file to your form.",
      ]}
      faqs={[
        {
          q: `How do I reduce a photo to ${kb} KB without losing quality?`,
          a: `Every compression removes some detail, but this tool tests many quality levels and keeps the sharpest version that is still under ${kb} KB. Starting with a well-lit, in-focus photo gives the best result.`,
        },
        {
          q: "Does this change the width and height of my image?",
          a: `Only if needed. The tool first keeps your original pixel size; if the file cannot get under ${kb} KB, it reduces the dimensions step by step. To set an exact pixel size, use the photo resizer.`,
        },
        {
          q: "Can I compress a PDF here?",
          a: "This tool works with images. If your form asks for a PDF, compress the image first and then convert it to PDF.",
        },
      ]}
    >
      <h2>Where a {kb} KB image is needed</h2>
      <ul>
        {d.uses.map((u) => (
          <li key={u}>{u}</li>
        ))}
      </ul>
      <p>{d.note}</p>
      {examDocs.length > 0 && (
        <>
          <h2>Exam uploads that need about {kb} KB</h2>
          <p>These uploads have a maximum close to {kb} KB. Each link opens a tool already set to that exam&apos;s exact pixel size and KB range.</p>
          <ul>
            {examDocs.map((p) => (
              <li key={p.path}>
                <Link href={p.path}>
                  {p.exam.name} {docNoun[p.doc.kind].toLowerCase()}
                </Link>{" "}
                — {p.doc.minKB}–{p.doc.maxKB} KB, {p.doc.width} × {p.doc.height} px
              </li>
            ))}
          </ul>
        </>
      )}
      <p>
        If your form gives an exact pixel size too (for example 200 × 230 px), use the{" "}
        <Link href="/tools/photo-resizer">photo resizer</Link> or the{" "}
        <Link href="/tools/signature-resizer">signature resizer</Link>, which handle both at once. Typical minimum for
        this size: about {d.min} KB.
      </p>
      <h2>Other sizes</h2>
      <p>
        {others.map((s, i) => (
          <span key={s}>
            <Link href={`/tools/${slugFor(s)}`}>compress to {s} KB</Link>
            {i < others.length - 1 ? " · " : ""}
          </span>
        ))}
      </p>
    </ToolPage>
  );
}
