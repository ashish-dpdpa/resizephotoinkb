// Image format conversion that runs entirely in the browser.
//
// Decoding: the browser opens JPG, PNG, WebP, GIF, BMP and AVIF itself (Safari also
// opens HEIC). If that fails and the file is HEIC/HEIF, the heic-to library
// (libheif compiled to WebAssembly, about 1 MB) is loaded on demand.
// Encoding: canvas.toBlob. Re-encoding drops all metadata, including GPS location.

export type OutFormat = "jpg" | "png" | "webp";

export const OUT_MIME: Record<OutFormat, string> = { jpg: "image/jpeg", png: "image/png", webp: "image/webp" };
export const OUT_LABEL: Record<OutFormat, string> = { jpg: "JPG", png: "PNG", webp: "WebP" };

/** Mobile Safari refuses canvases above ~16.7 MP, so very large images are scaled to fit. */
const MAX_PIXELS = 16_777_216;

/** Short format name from the file's first bytes (falls back to the extension). */
export function sniffFormat(head: Uint8Array, name: string): string {
  const ascii = (from: number, to: number) => String.fromCharCode(...head.slice(from, to));
  if (head[0] === 0xff && head[1] === 0xd8) return "JPG";
  if (head[0] === 0x89 && ascii(1, 4) === "PNG") return "PNG";
  if (ascii(0, 4) === "RIFF" && ascii(8, 12) === "WEBP") return "WebP";
  if (ascii(0, 3) === "GIF") return "GIF";
  if (ascii(0, 2) === "BM") return "BMP";
  if (ascii(4, 8) === "ftyp") {
    const brand = ascii(8, 12);
    if (brand === "avif" || brand === "avis") return "AVIF";
    if (["heic", "heix", "hevc", "hevx", "heim", "heis", "mif1", "msf1"].includes(brand)) return "HEIC";
  }
  return (name.split(".").pop() || "?").toUpperCase().slice(0, 5);
}

export interface DecodedImage {
  bitmap: ImageBitmap;
  sourceFormat: string;
}

/**
 * Open any image file as an ImageBitmap with EXIF rotation applied.
 * onStatus reports slow steps (loading the HEIC decoder) for the UI.
 */
export async function decodeImage(file: File, onStatus?: (msg: string) => void): Promise<DecodedImage> {
  const head = new Uint8Array(await file.slice(0, 32).arrayBuffer());
  const sourceFormat = sniffFormat(head, file.name);
  try {
    const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
    return { bitmap, sourceFormat };
  } catch {
    if (sourceFormat !== "HEIC" && !/\.(heic|heif)$/i.test(file.name)) {
      throw new Error("This file couldn't be opened as an image.");
    }
  }
  onStatus?.("Loading the HEIC decoder (about 1 MB, first time only)…");
  try {
    const { heicTo } = await import("heic-to");
    onStatus?.("Decoding HEIC…");
    const bitmap = await heicTo({ blob: file, type: "bitmap", options: { imageOrientation: "from-image" } });
    return { bitmap, sourceFormat: "HEIC" };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (/fetch|network|load|import/i.test(msg)) throw new Error("Couldn't download the HEIC decoder. Check your connection and try again.");
    throw new Error("This HEIC file couldn't be decoded. It may be damaged, or an unusual HEIC variant.");
  }
}

export interface ConvertOptions {
  format: OutFormat;
  /** 0–1, used for JPG and WebP. */
  quality: number;
  /** Optional size limit for JPG/WebP: quality is lowered until the file fits. */
  maxKB?: number | null;
  /** Fill for transparent areas when saving as JPG (JPG has no transparency). */
  jpgBackground?: string;
}

export interface ConvertResult {
  blob: Blob;
  width: number;
  height: number;
  /** True if the image was scaled down to fit the browser's canvas limit. */
  scaled: boolean;
  /** True if the pixel size was reduced to get under maxKB. */
  shrunk: boolean;
  /** Quality actually used (JPG/WebP). */
  quality?: number;
  /** True if even the lowest quality is above maxKB. */
  overLimit: boolean;
}

function toBlob(canvas: HTMLCanvasElement, mime: string, quality?: number): Promise<Blob> {
  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => {
      if (!b) return reject(new Error("The browser couldn't create the file."));
      // Browsers that can't encode a format silently fall back to PNG.
      if (b.type !== mime) {
        return reject(
          new Error(
            mime === "image/webp"
              ? "This browser can't create WebP files. Use Chrome, Edge or Firefox, or pick JPG or PNG."
              : `This browser can't create ${mime} files.`,
          ),
        );
      }
      resolve(b);
    }, mime, quality),
  );
}

/** Below this quality JPG/WebP turn blocky, so to hit a KB limit we shrink the pixels instead. */
const QUALITY_FLOOR = 0.4;

function draw(bitmap: ImageBitmap, w: number, h: number, background: string | null) {
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  if (background) {
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, w, h);
  }
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(bitmap, 0, 0, w, h);
  return canvas;
}

export async function convertBitmap(bitmap: ImageBitmap, o: ConvertOptions): Promise<ConvertResult> {
  const pixels = bitmap.width * bitmap.height;
  const s = pixels > MAX_PIXELS ? Math.sqrt(MAX_PIXELS / pixels) : 1;
  let w = Math.max(1, Math.floor(bitmap.width * s));
  let h = Math.max(1, Math.floor(bitmap.height * s));
  const background = o.format === "jpg" ? (o.jpgBackground ?? "#ffffff") : null;
  const mime = OUT_MIME[o.format];

  let canvas = draw(bitmap, w, h, background);
  if (o.format === "png") {
    return { blob: await toBlob(canvas, mime), width: w, height: h, scaled: s < 1, shrunk: false, overLimit: false };
  }

  const q = Math.min(1, Math.max(0.05, o.quality));
  const first = await toBlob(canvas, mime, q);
  const maxBytes = o.maxKB && o.maxKB > 0 ? o.maxKB * 1024 : null;
  if (!maxBytes || first.size <= maxBytes) {
    return { blob: first, width: w, height: h, scaled: s < 1, shrunk: false, quality: q, overLimit: false };
  }

  // Highest quality (not below the floor) that fits; if none, scale the image down and retry.
  let shrunk = false;
  for (let attempt = 0; attempt < 8; attempt++) {
    const atFloor = await toBlob(canvas, mime, Math.min(q, QUALITY_FLOOR));
    if (atFloor.size <= maxBytes) {
      let lo = Math.min(q, QUALITY_FLOOR);
      let hi = q;
      let best = { blob: atFloor, q: lo };
      for (let i = 0; i < 7 && hi - lo > 0.01; i++) {
        const mid = (lo + hi) / 2;
        const b = await toBlob(canvas, mime, mid);
        if (b.size <= maxBytes) {
          best = { blob: b, q: mid };
          lo = mid;
        } else {
          hi = mid;
        }
      }
      return { blob: best.blob, width: w, height: h, scaled: s < 1, shrunk, quality: best.q, overLimit: false };
    }
    if (w <= 32 || h <= 32) break;
    // File size scales roughly with pixel count, so shrink by the square root of the overshoot.
    const k = Math.min(0.9, Math.sqrt(maxBytes / atFloor.size) * 0.95);
    w = Math.max(16, Math.round(w * k));
    h = Math.max(16, Math.round(h * k));
    canvas = draw(bitmap, w, h, background);
    shrunk = true;
  }
  const last = await toBlob(canvas, mime, 0.05);
  return { blob: last, width: w, height: h, scaled: s < 1, shrunk, quality: 0.05, overLimit: last.size > maxBytes };
}

/** "IMG_2041.HEIC" → "IMG_2041.jpg" */
export function outputName(name: string, format: OutFormat) {
  const base = name.replace(/\.[^.]+$/, "").replace(/[\\/:*?"<>|]+/g, "-") || "image";
  return `${base}.${format}`;
}
