// Browser-only PDF helpers built on pdf.js (render) and pdf-lib (write).
// Files are read and written locally; nothing is uploaded.

import { canvasToJpeg } from "./image";

type PdfJs = typeof import("pdfjs-dist/legacy/build/pdf.mjs");
let pdfjsPromise: Promise<PdfJs> | null = null;

async function pdfjs(): Promise<PdfJs> {
  if (!pdfjsPromise) {
    pdfjsPromise = import("pdfjs-dist/legacy/build/pdf.mjs").then((m) => {
      m.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/legacy/build/pdf.worker.min.mjs", import.meta.url).toString();
      return m;
    });
  }
  return pdfjsPromise;
}

export interface PageSize {
  width: number; // PDF points (1/72 inch)
  height: number;
}

export const A4: PageSize = { width: 595.28, height: 841.89 };

/** Render every page of a PDF to a canvas at the given DPI (capped so phones don't run out of memory). */
export async function renderPdf(file: File, dpi = 150, onProgress?: (done: number, total: number) => void) {
  const lib = await pdfjs();
  const doc = await lib.getDocument({ data: new Uint8Array(await file.arrayBuffer()) }).promise;
  const pages: { canvas: HTMLCanvasElement; size: PageSize }[] = [];
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const base = page.getViewport({ scale: 1 });
    let scale = dpi / 72;
    const maxSide = 2400;
    if (Math.max(base.width, base.height) * scale > maxSide) scale = maxSide / Math.max(base.width, base.height);
    const viewport = page.getViewport({ scale });
    const canvas = document.createElement("canvas");
    canvas.width = Math.ceil(viewport.width);
    canvas.height = Math.ceil(viewport.height);
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    await page.render({ canvasContext: ctx, viewport }).promise;
    pages.push({ canvas, size: { width: base.width, height: base.height } });
    onProgress?.(i, doc.numPages);
  }
  await doc.destroy();
  return pages;
}

export async function countPdfPages(file: File) {
  const { PDFDocument } = await import("pdf-lib");
  const doc = await PDFDocument.load(await file.arrayBuffer(), { ignoreEncryption: true });
  return doc.getPageCount();
}

function scaled(canvas: HTMLCanvasElement, s: number) {
  if (s >= 0.999) return canvas;
  const c = document.createElement("canvas");
  c.width = Math.max(1, Math.round(canvas.width * s));
  c.height = Math.max(1, Math.round(canvas.height * s));
  const ctx = c.getContext("2d")!;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(canvas, 0, 0, c.width, c.height);
  return c;
}

export interface PdfPageInput {
  canvas: HTMLCanvasElement;
  /** Page size in points. The image is fitted inside with `margin` points of white space. */
  size: PageSize;
  margin?: number;
}

async function buildPdf(pages: PdfPageInput[], quality: number, scale: number) {
  const { PDFDocument } = await import("pdf-lib");
  const doc = await PDFDocument.create();
  for (const p of pages) {
    const c = scaled(p.canvas, scale);
    const jpg = await canvasToJpeg(c, quality);
    const img = await doc.embedJpg(new Uint8Array(await jpg.arrayBuffer()));
    const page = doc.addPage([p.size.width, p.size.height]);
    const m = p.margin ?? 0;
    const boxW = p.size.width - 2 * m;
    const boxH = p.size.height - 2 * m;
    const fit = Math.min(boxW / c.width, boxH / c.height);
    const w = c.width * fit;
    const h = c.height * fit;
    page.drawImage(img, { x: (p.size.width - w) / 2, y: (p.size.height - h) / 2, width: w, height: h });
  }
  doc.setProducer("FormReady");
  doc.setCreator("FormReady");
  return doc.save({ useObjectStreams: true });
}

export interface PdfResult {
  blob: Blob;
  url: string;
  bytes: number;
  quality: number;
  scale: number;
  warning?: string;
}

/**
 * Build a PDF from page images that fits under maxKB (if given). Keeps JPEG quality
 * at a readable level and lowers the resolution first, like the image compressor.
 */
export async function pagesToPdf(pages: PdfPageInput[], maxKB?: number, onTry?: () => void): Promise<PdfResult> {
  const done = (bytes: Uint8Array, quality: number, scale: number, warning?: string): PdfResult => {
    const blob = new Blob([bytes as BlobPart], { type: "application/pdf" });
    return { blob, url: URL.createObjectURL(blob), bytes: blob.size, quality, scale, warning };
  };
  if (!maxKB) return done(await buildPdf(pages, 0.85, 1), 0.85, 1);
  const max = maxKB * 1024;
  const allScales = [1, 0.85, 0.72, 0.6, 0.5, 0.42, 0.35, 0.3, 0.25, 0.2];
  // One probe tells us roughly how far to shrink, so we skip scales that can't fit.
  onTry?.();
  const probe = await buildPdf(pages, 0.7, 1);
  if (probe.length <= max) {
    const top = await buildPdf(pages, 0.9, 1);
    if (top.length <= max) return done(top, 0.9, 1);
  }
  // File size falls roughly with the square of the scale.
  const estimate = Math.sqrt(max / probe.length) * 1.25;
  const startAt = allScales.findIndex((s) => s <= Math.max(estimate, 0.2));
  const scales = allScales.slice(Math.max(0, startAt));
  for (const s of scales) {
    onTry?.();
    const top = await buildPdf(pages, 0.9, s);
    if (top.length <= max) return done(top, 0.9, s);
    let lo = 0.45;
    let hi = 0.9;
    let best: { bytes: Uint8Array; q: number } | null = null;
    for (let i = 0; i < 5; i++) {
      const q = (lo + hi) / 2;
      const b = await buildPdf(pages, q, s);
      if (b.length <= max) {
        best = { bytes: b, q };
        lo = q;
      } else hi = q;
    }
    if (!best) {
      const b = await buildPdf(pages, lo, s);
      if (b.length <= max) best = { bytes: b, q: lo };
    }
    if (best) return done(best.bytes, best.q, s);
  }
  const last = await buildPdf(pages, 0.3, scales[scales.length - 1]);
  return done(
    last,
    0.3,
    scales[scales.length - 1],
    last.length > max ? `This PDF could only be reduced to ${(last.length / 1024).toFixed(0)} KB. Try fewer pages or split it.` : undefined,
  );
}

/** Join several PDFs, in order, without re-compressing them. */
export async function mergePdfs(files: File[]): Promise<PdfResult> {
  const { PDFDocument } = await import("pdf-lib");
  const out = await PDFDocument.create();
  for (const f of files) {
    const src = await PDFDocument.load(await f.arrayBuffer(), { ignoreEncryption: true });
    const copied = await out.copyPages(src, src.getPageIndices());
    copied.forEach((p) => out.addPage(p));
  }
  const bytes = await out.save({ useObjectStreams: true });
  const blob = new Blob([bytes as BlobPart], { type: "application/pdf" });
  return { blob, url: URL.createObjectURL(blob), bytes: blob.size, quality: 1, scale: 1 };
}

/** Points for an image placed at a given DPI (used for "same size as image" pages). */
export function imagePageSize(canvas: HTMLCanvasElement, dpi = 150): PageSize {
  return { width: (canvas.width / dpi) * 72, height: (canvas.height / dpi) * 72 };
}
