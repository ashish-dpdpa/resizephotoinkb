// Menu data for the header (built on the server, passed to the client header).

import { exams } from "./exams";
import { pdfSizePages } from "./pdfPages";
import { rangePages } from "./sizePages";

export interface NavLink {
  href: string;
  label: string;
  note?: string;
}
export interface NavGroup {
  title: string;
  links: NavLink[];
}
export interface NavMenu {
  id: "exams" | "photo" | "pdf";
  label: string;
  /** Pathname test used to highlight the active menu. */
  match: string[];
  groups: NavGroup[];
  footer: NavLink;
}

export function buildNavMenus(): NavMenu[] {
  const byCategory = new Map<string, NavLink[]>();
  for (const e of exams) {
    const list = byCategory.get(e.category) ?? [];
    // No side note here: exam names are long and the column is narrow.
    list.push({ href: `/exams/${e.slug}`, label: e.name });
    byCategory.set(e.category, list);
  }

  const pdfTools = ["/tools/image-to-pdf", "/tools/compress-pdf", "/tools/pdf-to-jpg", "/tools/merge-pdf"];

  return [
    {
      id: "exams",
      label: "Exams",
      match: ["/exams"],
      groups: [...byCategory.entries()].map(([title, links]) => ({ title, links })),
      footer: { href: "/exams", label: `All ${exams.length} exams and their size rules` },
    },
    {
      id: "photo",
      label: "Photo & Signature",
      match: ["/tools/photo", "/tools/signature", "/tools/resize", "/tools/compress-image", "/tools/passport", "/tools/join", "/tools/age", "/tools/dpi", "/tools/pixel", "/tools/kb-to"],
      groups: [
        {
          title: "Resize",
          links: [
            { href: "/tools/photo-resizer", label: "Photo resizer", note: "Exam presets" },
            { href: "/tools/signature-resizer", label: "Signature resizer", note: "Cleans the paper" },
            { href: "/tools/resize-image-in-cm", label: "Resize in cm / inch", note: "With DPI" },
            { href: "/tools/resize-photo-3-5-x-4-5-cm", label: "3.5 × 4.5 cm photo" },
            { href: "/tools/resize-signature-6-x-2-cm", label: "6 × 2 cm signature" },
          ],
        },
        {
          title: "By file size",
          links: [
            ...rangePages.map((r) => ({ href: `/tools/${r.slug}`, label: r.title.replace("Resize ", "") })),
            { href: "/tools/compress-image-to-20kb", label: "Compress to 20 KB" },
            { href: "/tools/compress-image-to-50kb", label: "Compress to 50 KB" },
          ],
        },
        {
          title: "Photo makers",
          links: [
            { href: "/tools/photo-with-name-and-date", label: "Photo with name & date" },
            { href: "/tools/passport-size-photo-maker", label: "Passport photo maker", note: "White background" },
            { href: "/tools/background-remover", label: "Background remover", note: "Transparent PNG" },
            { href: "/tools/join-photo-and-signature", label: "Join photo & signature" },
            { href: "/tools/signature-maker", label: "Draw a signature" },
          ],
        },
        {
          title: "Converters",
          links: [
            { href: "/tools/image-converter", label: "Image converter", note: "HEIC, WebP, PNG ⇄ JPG" },
            { href: "/tools/heic-to-jpg", label: "HEIC to JPG", note: "iPhone photos" },
            { href: "/tools/webp-to-jpg", label: "WebP to JPG" },
            { href: "/tools/dpi-converter", label: "DPI converter" },
            { href: "/tools/pixel-to-cm", label: "Pixel ⇄ cm" },
            { href: "/tools/kb-to-mb", label: "KB ⇄ MB" },
            { href: "/tools/age-calculator", label: "Exam age calculator" },
          ],
        },
      ],
      footer: { href: "/tools", label: "All tools" },
    },
    {
      id: "pdf",
      label: "PDF",
      match: [...pdfTools, ...pdfSizePages.map((p) => `/tools/${p.slug}`)],
      groups: [
        {
          title: "PDF tools",
          links: [
            { href: "/tools/image-to-pdf", label: "Image to PDF", note: "Photos → one A4 PDF" },
            { href: "/tools/compress-pdf", label: "Compress PDF", note: "To 100 KB – 1 MB" },
            { href: "/tools/pdf-to-jpg", label: "PDF to JPG", note: "Each page as an image" },
            { href: "/tools/merge-pdf", label: "Merge PDF", note: "Join in any order" },
          ],
        },
        {
          title: "Exact sizes",
          links: pdfSizePages.map((p) => ({ href: `/tools/${p.slug}`, label: p.title })),
        },
      ],
      footer: { href: "/tools", label: "All tools" },
    },
  ];
}
