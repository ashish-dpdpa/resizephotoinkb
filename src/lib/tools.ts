import { dimensionPages, maxPages, rangePages } from "./sizePages";
import { pdfSizePages } from "./pdfPages";

export type ToolGroup = "main" | "maker" | "pdf" | "compress" | "range" | "dimension" | "converter";

export interface ToolLink {
  href: string;
  title: string;
  description: string;
  group: ToolGroup;
}

export const compressSizes = maxPages.map((p) => p.kb);

export const tools: ToolLink[] = [
  {
    href: "/tools/photo-resizer",
    title: "Photo resizer for exam forms",
    description: "Resize and crop a photo to exact pixels or cm and a KB range, with presets for major exams.",
    group: "main",
  },
  {
    href: "/tools/signature-resizer",
    title: "Signature resizer",
    description: "Clean the background of a signature photo and export it at the size your form needs.",
    group: "main",
  },
  {
    href: "/tools/signature-maker",
    title: "Online signature maker",
    description: "Draw your signature with a finger or mouse and download it as a form-ready JPG.",
    group: "main",
  },
  {
    href: "/tools/age-calculator",
    title: "Exam age calculator",
    description: "Work out your exact age on an exam's cut-off date, with category relaxation.",
    group: "main",
  },
  {
    href: "/tools/resize-image-in-cm",
    title: "Resize image in cm",
    description: "Set width and height in cm, mm or inches with a DPI, and hit a KB range.",
    group: "main",
  },
  {
    href: "/tools/photo-with-name-and-date",
    title: "Photo with name and date",
    description: "Print your name and the date of photo below your photo, at your exam's size and KB.",
    group: "maker",
  },
  {
    href: "/tools/passport-size-photo-maker",
    title: "Passport size photo maker",
    description: "White background, 3.5 × 4.5 cm crop and a 4×6 print sheet, all made on your phone.",
    group: "maker",
  },
  {
    href: "/tools/join-photo-and-signature",
    title: "Join photo and signature",
    description: "Merge your photo and signature into one JPG at the KB size your form needs.",
    group: "maker",
  },
  {
    href: "/tools/image-to-pdf",
    title: "Image to PDF",
    description: "Turn photos or scanned pages into one A4 PDF, under a size limit if needed.",
    group: "pdf",
  },
  {
    href: "/tools/compress-pdf",
    title: "Compress PDF",
    description: "Shrink a PDF to 100 KB, 200 KB, 500 KB or 1 MB for upload.",
    group: "pdf",
  },
  {
    href: "/tools/pdf-to-jpg",
    title: "PDF to JPG",
    description: "Save each page of a PDF as a JPG, with an optional size limit.",
    group: "pdf",
  },
  {
    href: "/tools/merge-pdf",
    title: "Merge PDF",
    description: "Join several PDFs into one, in the order you choose.",
    group: "pdf",
  },
  ...pdfSizePages.map((p) => ({ href: `/tools/${p.slug}`, title: p.title, description: p.description, group: "pdf" as const })),
  ...rangePages.map((p) => ({ href: `/tools/${p.slug}`, title: p.title, description: p.description, group: "range" as const })),
  ...dimensionPages.map((p) => ({ href: `/tools/${p.slug}`, title: p.title, description: p.description, group: "dimension" as const })),
  ...maxPages.map((p) => ({ href: `/tools/${p.slug}`, title: `Compress image to ${p.kb} KB`, description: `Reduce a JPG or PNG to under ${p.kb} KB while keeping it sharp.`, group: "compress" as const })),
  {
    href: "/tools/dpi-converter",
    title: "DPI converter",
    description: "Change a JPG to 200 or 300 DPI without changing the picture, and keep it within a KB limit.",
    group: "converter",
  },
  {
    href: "/tools/pixel-to-cm",
    title: "Pixel to cm converter",
    description: "Convert pixels to cm, mm and inches (and back) at any DPI.",
    group: "converter",
  },
  {
    href: "/tools/kb-to-mb",
    title: "KB to MB converter",
    description: "Convert between bytes, KB and MB, in both 1024 and 1000 based units.",
    group: "converter",
  },
];

export const toolGroups: { id: ToolGroup; title: string }[] = [
  { id: "main", title: "Main tools" },
  { id: "maker", title: "Photo makers" },
  { id: "pdf", title: "PDF tools" },
  { id: "range", title: "Resize to a KB range" },
  { id: "dimension", title: "Resize to a size in cm" },
  { id: "compress", title: "Compress to a size" },
  { id: "converter", title: "Converters" },
];
