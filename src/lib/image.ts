// Browser-only image helpers. Nothing here sends data anywhere: images are
// decoded, drawn on a canvas and re-encoded locally.

export interface ProcessOptions {
  width: number;
  height: number;
  minKB: number;
  maxKB: number;
  /** "cover" crops to fill the frame, "contain" fits the whole image with white bars. */
  fit: "cover" | "contain";
  zoom: number; // 1 = no zoom
  offsetX: number; // -1..1, horizontal crop position
  offsetY: number; // -1..1, vertical crop position
  /** Turn a photographed signature into clean ink on white. */
  cleanSignature: boolean;
  threshold: number; // 0-255, used when cleanSignature is on
  inkColor: "original" | "black" | "blue";
  /** Allow shrinking the pixel size if the file can't get under maxKB at the requested size. */
  allowShrink: boolean;
  dpi?: number;
  /** Text printed in a white strip under the photo (e.g. name and date of photograph). */
  caption?: string[];
}

export interface ProcessResult {
  blob: Blob;
  url: string;
  width: number;
  height: number;
  bytes: number;
  quality: number;
  padded: boolean;
  shrunk: boolean;
  warning?: string;
}

export async function loadImage(file: File): Promise<HTMLImageElement> {
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.decoding = "async";
    img.src = url;
    await img.decode();
    return img;
  } catch {
    URL.revokeObjectURL(url);
    throw new Error("This file could not be opened as an image. Try a JPG or PNG.");
  }
}

/** How the source image sits inside a w × h frame. spareX/Y is how far it can be panned. */
export function frameGeometry(
  img: HTMLImageElement,
  w: number,
  h: number,
  o: Pick<ProcessOptions, "fit" | "zoom" | "offsetX" | "offsetY">,
) {
  const iw = img.naturalWidth;
  const ih = img.naturalHeight;
  const base = o.fit === "cover" ? Math.max(w / iw, h / ih) : Math.min(w / iw, h / ih);
  const scale = base * Math.max(1, o.zoom);
  const dw = iw * scale;
  const dh = ih * scale;
  const spareX = dw - w;
  const spareY = dh - h;
  const dx = -spareX / 2 + (spareX > 0 ? (o.offsetX * spareX) / 2 : 0);
  const dy = -spareY / 2 + (spareY > 0 ? (o.offsetY * spareY) / 2 : 0);
  return { dw, dh, dx, dy, spareX, spareY };
}

/** Height of the white caption strip for a frame of height h (0 when there is no caption). */
export function captionHeight(h: number, caption?: string[]) {
  const lines = (caption ?? []).filter((l) => l.trim()).length;
  return lines ? Math.round(h * Math.min(0.3, 0.085 * lines + 0.05)) : 0;
}

/** Draw the framed (and optionally cleaned) image onto a canvas — also used for the live preview. */
export function drawFrame(
  img: HTMLImageElement,
  w: number,
  h: number,
  o: Omit<ProcessOptions, "width" | "height" | "minKB" | "maxKB" | "allowShrink" | "dpi">,
  target?: HTMLCanvasElement,
): HTMLCanvasElement {
  const canvas = target ?? document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d", { willReadFrequently: o.cleanSignature })!;
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, w, h);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  const stripH = captionHeight(h, o.caption);
  const imgH = h - stripH;
  const { dw, dh, dx, dy } = frameGeometry(img, w, imgH, o);
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, 0, w, imgH);
  ctx.clip();
  ctx.drawImage(img, dx, dy, dw, dh);
  ctx.restore();

  if (o.cleanSignature) {
    const data = ctx.getImageData(0, 0, w, imgH);
    const px = data.data;
    const ink =
      o.inkColor === "black" ? [0, 0, 0] : o.inkColor === "blue" ? [16, 42, 140] : null;
    for (let i = 0; i < px.length; i += 4) {
      const lum = 0.299 * px[i] + 0.587 * px[i + 1] + 0.114 * px[i + 2];
      if (lum >= o.threshold) {
        px[i] = px[i + 1] = px[i + 2] = 255;
      } else if (ink) {
        px[i] = ink[0];
        px[i + 1] = ink[1];
        px[i + 2] = ink[2];
      }
      px[i + 3] = 255;
    }
    ctx.putImageData(data, 0, 0);
  }

  if (stripH) {
    const lines = (o.caption ?? []).filter((l) => l.trim());
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, imgH, w, stripH);
    ctx.fillStyle = "#000000";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const lineH = stripH / lines.length;
    lines.forEach((line, i) => {
      // shrink the font until the line fits the width
      let size = Math.floor(lineH * 0.62);
      do {
        ctx.font = `bold ${size}px Arial, Helvetica, sans-serif`;
        size--;
      } while (ctx.measureText(line).width > w * 0.94 && size > 6);
      ctx.fillText(line, w / 2, imgH + lineH * (i + 0.5));
    });
  }
  return canvas;
}

function toJpeg(canvas: HTMLCanvasElement, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Encoding failed"))), "image/jpeg", quality),
  );
}

/** Find the highest JPEG quality whose size is <= maxBytes. */
async function bestUnder(canvas: HTMLCanvasElement, maxBytes: number, minQuality = 0.05) {
  let lo = minQuality;
  let hi = 0.98;
  let best: { blob: Blob; q: number } | null = null;
  const top = await toJpeg(canvas, hi);
  if (top.size <= maxBytes) return { blob: top, q: hi };
  for (let i = 0; i < 8; i++) {
    const mid = (lo + hi) / 2;
    const b = await toJpeg(canvas, mid);
    if (b.size <= maxBytes) {
      best = { blob: b, q: mid };
      lo = mid;
    } else {
      hi = mid;
    }
  }
  if (!best) {
    const b = await toJpeg(canvas, minQuality);
    if (b.size <= maxBytes) best = { blob: b, q: minQuality };
  }
  return best;
}

/** Below this JPEG quality images look blocky, so we shrink the pixels instead (when allowed). */
const GOOD_QUALITY = 0.5;

/** Write the DPI into the JFIF header so portals that read it see the right value. */
function setJfifDpi(bytes: Uint8Array, dpi: number) {
  // SOI (FFD8) then APP0 (FFE0) with "JFIF\0"
  if (bytes[0] !== 0xff || bytes[1] !== 0xd8 || bytes[2] !== 0xff || bytes[3] !== 0xe0) return bytes;
  if (String.fromCharCode(bytes[6], bytes[7], bytes[8], bytes[9]) !== "JFIF") return bytes;
  bytes[13] = 1; // units: dots per inch
  bytes[14] = (dpi >> 8) & 0xff;
  bytes[15] = dpi & 0xff;
  bytes[16] = (dpi >> 8) & 0xff;
  bytes[17] = dpi & 0xff;
  return bytes;
}

/**
 * Raise a JPEG to at least `minBytes` by inserting comment (COM) segments right
 * after the header. Image pixels are untouched; viewers ignore comments.
 */
function padJpeg(bytes: Uint8Array, minBytes: number): Uint8Array {
  const missing = minBytes - bytes.length;
  if (missing <= 0) return bytes;
  // Insert after SOI + APP0 if present, otherwise right after SOI.
  let insertAt = 2;
  if (bytes[2] === 0xff && bytes[3] === 0xe0) insertAt = 4 + ((bytes[4] << 8) | bytes[5]);
  const segments: Uint8Array[] = [];
  let remaining = missing + 600; // ~0.6 KB margin so portals that round sizes still see the minimum
  while (remaining > 0) {
    const payload = Math.min(65533, Math.max(1, remaining - 4));
    const seg = new Uint8Array(payload + 4);
    seg[0] = 0xff;
    seg[1] = 0xfe;
    seg[2] = ((payload + 2) >> 8) & 0xff;
    seg[3] = (payload + 2) & 0xff;
    seg.fill(0x20, 4); // spaces
    segments.push(seg);
    remaining -= seg.length;
  }
  const extra = segments.reduce((n, s) => n + s.length, 0);
  const out = new Uint8Array(bytes.length + extra);
  out.set(bytes.subarray(0, insertAt), 0);
  let pos = insertAt;
  for (const s of segments) {
    out.set(s, pos);
    pos += s.length;
  }
  out.set(bytes.subarray(insertAt), pos);
  return out;
}

export async function processImage(img: HTMLImageElement, o: ProcessOptions): Promise<ProcessResult> {
  const minBytes = Math.round(o.minKB * 1024);
  const maxBytes = Math.round(o.maxKB * 1024);
  let w = Math.max(1, Math.round(o.width));
  let h = Math.max(1, Math.round(o.height));
  let shrunk = false;
  let found: { blob: Blob; q: number } | null = null;

  if (o.allowShrink) {
    // Keep quality decent and reduce pixels instead — a smaller sharp image beats a big blocky one.
    // One cheap probe per step tells us how far to shrink, so a 12 MP photo needs a few steps, not twenty.
    for (let attempt = 0; attempt < 12; attempt++) {
      const canvas = drawFrame(img, w, h, o);
      const probe = await toJpeg(canvas, GOOD_QUALITY);
      if (probe.size <= maxBytes) {
        found = await bestUnder(canvas, maxBytes, GOOD_QUALITY);
        break;
      }
      if (w < 120 || h < 120) break;
      // JPEG size scales roughly with pixel count, i.e. with the square of the side length.
      const f = Math.min(0.9, Math.max(0.25, Math.sqrt(maxBytes / probe.size) * 0.95));
      w = Math.max(1, Math.round(w * f));
      h = Math.max(1, Math.round(h * f));
      shrunk = true;
    }
  }
  if (!found) {
    // Fixed pixel size (exam presets) or a very small target: allow lower quality.
    found = await bestUnder(drawFrame(img, w, h, o), maxBytes, 0.05);
  }

  let warning: string | undefined;
  if (!found) {
    const canvas = drawFrame(img, w, h, o);
    found = { blob: await toJpeg(canvas, 0.05), q: 0.05 };
    warning = `Even at the lowest quality this image is ${(found.blob.size / 1024).toFixed(1)} KB, above the ${o.maxKB} KB limit. Try a smaller pixel size.`;
  }

  let bytes: Uint8Array = new Uint8Array(await found.blob.arrayBuffer());
  if (o.dpi) bytes = setJfifDpi(bytes, o.dpi);
  let padded = false;
  if (bytes.length < minBytes) {
    bytes = padJpeg(bytes, minBytes);
    padded = true;
  }
  const blob = new Blob([bytes as BlobPart], { type: "image/jpeg" });
  return {
    blob,
    url: URL.createObjectURL(blob),
    width: w,
    height: h,
    bytes: blob.size,
    quality: found.q,
    padded,
    shrunk,
    warning,
  };
}

/** Encode an already-composed canvas (fixed pixel size) into a JPG inside a KB range. */
export async function encodeCanvas(
  canvas: HTMLCanvasElement,
  o: { minKB: number; maxKB: number; dpi?: number },
): Promise<ProcessResult> {
  const minBytes = Math.round(o.minKB * 1024);
  const maxBytes = Math.round(o.maxKB * 1024);
  let found = await bestUnder(canvas, maxBytes, 0.05);
  let warning: string | undefined;
  if (!found) {
    found = { blob: await toJpeg(canvas, 0.05), q: 0.05 };
    warning = `Even at the lowest quality this image is ${(found.blob.size / 1024).toFixed(1)} KB, above the ${o.maxKB} KB limit.`;
  }
  let bytes: Uint8Array = new Uint8Array(await found.blob.arrayBuffer());
  if (o.dpi) bytes = setJfifDpi(bytes, o.dpi);
  let padded = false;
  if (bytes.length < minBytes) {
    bytes = padJpeg(bytes, minBytes);
    padded = true;
  }
  const blob = new Blob([bytes as BlobPart], { type: "image/jpeg" });
  return { blob, url: URL.createObjectURL(blob), width: canvas.width, height: canvas.height, bytes: blob.size, quality: found.q, padded, shrunk: false, warning };
}

/** JPEG-encode a canvas at a given quality (exported for the PDF tools). */
export function canvasToJpeg(canvas: HTMLCanvasElement, quality: number) {
  return toJpeg(canvas, quality);
}

export function formatKB(bytes: number) {
  return `${(bytes / 1024).toFixed(1)} KB`;
}
