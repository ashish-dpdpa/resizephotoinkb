// Size-targeted PDF landing pages served by /tools/[slug].

export interface PdfSizePage {
  kind: "compress-pdf" | "image-to-pdf";
  slug: string;
  kb: number;
  title: string;
  metaTitle: string;
  description: string;
  intro: string;
  uses: string[];
  faqs: { q: string; a: string }[];
}

const label = (kb: number) => (kb >= 1024 ? `${kb / 1024} MB` : `${kb} KB`);

function compress(kb: number, uses: string[], extraFaq: { q: string; a: string }): PdfSizePage {
  const l = label(kb);
  return {
    kind: "compress-pdf",
    slug: `compress-pdf-to-${kb >= 1024 ? `${kb / 1024}mb` : `${kb}kb`}`,
    kb,
    title: `Compress PDF to ${l}`,
    metaTitle: `Compress PDF to ${l} Online — Free, No Upload`,
    description: `Reduce a PDF to under ${l} for government job, exam and admission forms. Works in your browser — your document is never uploaded.`,
    intro: `Many portals reject certificates and mark sheets above ${l}. Add your PDF and get a copy under ${l} that stays readable.`,
    uses,
    faqs: [
      { q: `How do I compress a PDF to ${l}?`, a: `Add the PDF above with ${l} selected and press Compress. The tool lowers the image resolution step by step until the file is under ${l}.` },
      { q: "Is my document uploaded?", a: "No. The PDF is opened and rebuilt inside your browser. Nothing is sent to a server." },
      extraFaq,
    ],
  };
}

function toPdf(kb: number, uses: string[]): PdfSizePage {
  const l = label(kb);
  return {
    kind: "image-to-pdf",
    slug: `jpg-to-pdf-under-${kb}kb`,
    kb,
    title: `JPG to PDF Under ${l}`,
    metaTitle: `JPG to PDF Under ${l} — Image to PDF ${l} Online`,
    description: `Convert photos or scanned pages (JPG, PNG) into one PDF under ${l}. A4 pages, any order, made in your browser without uploading.`,
    intro: `Turn one or more images into a single A4 PDF that stays under ${l} — the limit many forms set for certificates and documents.`,
    uses,
    faqs: [
      { q: `How do I make a PDF under ${l} from photos?`, a: `Add your images, keep ${l} selected and press Create PDF. The tool picks the best quality that keeps the whole PDF under ${l}.` },
      { q: "Can I put several images in one PDF?", a: "Yes. Each image becomes one page. Use the arrows to change the order before creating the PDF." },
      { q: "Will the PDF be A4?", a: "By default each image is placed on an A4 page with a small margin. Choose “Same as image” to keep the image’s own shape." },
    ],
  };
}

export const pdfSizePages: PdfSizePage[] = [
  compress(100, ["Caste, income and domicile certificates", "10th and 12th mark sheets", "Scholarship portal documents"], {
    q: "My PDF has many pages. Can it reach 100 KB?",
    a: "Usually 1–4 pages fit well. Longer documents may need to be split, or uploaded only with the pages the form asks for.",
  }),
  compress(200, ["Degree and diploma certificates", "Experience letters for job portals", "Admission and counselling documents"], {
    q: "Why can’t I select text in the compressed PDF?",
    a: "To reach small sizes the pages are saved as images. The text stays readable, which is what portals check.",
  }),
  compress(500, ["Multi-page certificates and mark sheets", "Bank and KYC documents", "University application packets"], {
    q: "Is 500 KB enough for a 10-page PDF?",
    a: "Generally yes, at a readable resolution. If not, try the 1 MB option or split the file.",
  }),
  compress(1024, ["Combined document sets", "Project reports and resumes", "Portals with a 1 MB limit"], {
    q: "Is 1 MB the same as 1000 KB?",
    a: "Most portals treat 1 MB as 1024 KB. The tool targets 1024 KB; if your portal is strict, choose 1000 KB in the custom box.",
  }),
  toPdf(100, ["Photo ID proof as PDF", "One- or two-page certificates", "Signature or thumb impression as PDF"]),
  toPdf(200, ["Mark sheets photographed on a phone", "Multi-page certificates", "Category and domicile certificates"]),
];

export function getPdfSizePage(slug: string) {
  return pdfSizePages.find((p) => p.slug === slug);
}
