// On-device background removal. Nothing is uploaded: models and runtimes are
// downloaded once and run in the browser.
//
// Three methods, each producing the same SubjectMask:
//  - "color":  plain background (logos, products, cartoons, studio shots). No AI:
//              the background colour is flood-filled in from the image edges.
//  - "person": MediaPipe selfie multiclass segmenter (Apache-2.0), for people.
//  - "object": U²-Net-p (Apache-2.0, /public/models/u2netp.onnx) via onnxruntime-web,
//              general "main subject" detection for anything on a busy background.

import type { ImageSegmenter } from "@mediapipe/tasks-vision";

export type Method = "color" | "person" | "object";

export interface SubjectMask {
  /** The image to cut out, at working size (for "color", edge pixels are cleaned of the old background). */
  source: HTMLCanvasElement;
  /** Subject alpha (exact) or probability (soft) per mask pixel, 0–1. */
  alpha: Float32Array;
  maskWidth: number;
  maskHeight: number;
  /** exact: alpha is final. soft: a probability, turned into alpha with the softness ramp. */
  kind: "exact" | "soft";
  method: Method;
  /** What was found, for the "Detected: …" label. */
  detected: Detected;
}

export type Detected = "transparent" | "plain" | "person-plain" | "person" | "object";

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

/** Draw the image at a working size (big phone photos are slow and gain nothing). */
export function prepareSource(img: HTMLImageElement, maxSide = 2000): HTMLCanvasElement {
  const s = Math.min(1, maxSide / Math.max(img.naturalWidth, img.naturalHeight));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(img.naturalWidth * s));
  canvas.height = Math.max(1, Math.round(img.naturalHeight * s));
  canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
  return canvas;
}

function canvasToImage(canvas: HTMLCanvasElement): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(async (b) => {
      if (!b) return reject(new Error("Could not create image"));
      const img = new Image();
      img.src = URL.createObjectURL(b);
      try {
        await img.decode();
        resolve(img);
      } catch (e) {
        reject(e);
      }
    }, "image/png");
  });
}

// ---------------------------------------------------------------------------
// 1. Plain-colour background (no AI)
// ---------------------------------------------------------------------------

export interface BorderInfo {
  /** Most of the border is one colour (or already transparent). */
  uniform: boolean;
  /** The image already has a transparent background. */
  transparent: boolean;
  color: [number, number, number];
  /** Share of border pixels close to that colour. */
  share: number;
}

/** Look at a 2-px band around the edge to find the background colour. */
export function analyzeBorder(source: HTMLCanvasElement): BorderInfo {
  const { width: w, height: h } = source;
  const d = source.getContext("2d")!.getImageData(0, 0, w, h).data;
  const idx: number[] = [];
  const band = Math.min(2, Math.floor(Math.min(w, h) / 4)) || 1;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (x < band || y < band || x >= w - band || y >= h - band) idx.push((y * w + x) * 4);
    }
  }
  const transparentCount = idx.filter((i) => d[i + 3] < 16).length;
  if (transparentCount > idx.length * 0.6) {
    return { uniform: true, transparent: true, color: [255, 255, 255], share: transparentCount / idx.length };
  }
  // Most common colour (5 bits per channel), then the average of the pixels in that bin.
  const bins = new Map<number, number>();
  for (const i of idx) {
    const k = ((d[i] >> 3) << 10) | ((d[i + 1] >> 3) << 5) | (d[i + 2] >> 3);
    bins.set(k, (bins.get(k) ?? 0) + 1);
  }
  let best = 0;
  let bestN = -1;
  for (const [k, n] of bins) if (n > bestN) [best, bestN] = [k, n];
  let r = 0, g = 0, b = 0, n = 0;
  for (const i of idx) {
    const k = ((d[i] >> 3) << 10) | ((d[i + 1] >> 3) << 5) | (d[i + 2] >> 3);
    if (k === best) { r += d[i]; g += d[i + 1]; b += d[i + 2]; n++; }
  }
  const color: [number, number, number] = [r / n, g / n, b / n];
  let close = 0;
  for (const i of idx) {
    const dr = d[i] - color[0], dg = d[i + 1] - color[1], db = d[i + 2] - color[2];
    if (dr * dr + dg * dg + db * db <= 40 * 40) close++;
  }
  const share = close / idx.length;
  return { uniform: share >= 0.8, transparent: false, color, share };
}

export interface ColorKeyOptions {
  /** 0–100: how different from the background colour a pixel may be and still count as background. */
  tolerance: number;
  /** Also remove the colour inside the subject (holes in letters, gaps), not just from the edges in. */
  everywhere?: boolean;
}

export function colorKeyMask(original: HTMLCanvasElement, border: BorderInfo, o: ColorKeyOptions): SubjectMask {
  const { width: w, height: h } = original;
  const n = w * h;
  const img = original.getContext("2d")!.getImageData(0, 0, w, h);
  const d = img.data;
  const alpha = new Float32Array(n);

  if (border.transparent) {
    for (let i = 0; i < n; i++) alpha[i] = d[i * 4 + 3] / 255;
    return { source: original, alpha, maskWidth: w, maskHeight: h, kind: "exact", method: "color", detected: "transparent" };
  }

  const [br, bg, bb] = border.color;
  // Map 0–100 to an RGB distance: core = surely background, edge = partly background.
  const lo = 8 + o.tolerance * 1.2;
  const hi = lo * 1.6 + 14;
  const dist = new Float32Array(n);
  for (let i = 0, p = 0; i < n; i++, p += 4) {
    const dr = d[p] - br, dg = d[p + 1] - bg, db = d[p + 2] - bb;
    dist[i] = Math.sqrt(dr * dr + dg * dg + db * db);
  }

  // Core background: flood-fill from the border through pixels within `lo` (or every such pixel).
  const core = new Uint8Array(n);
  if (o.everywhere) {
    for (let i = 0; i < n; i++) if (dist[i] <= lo) core[i] = 1;
  } else {
    const stack: number[] = [];
    const seed = (i: number) => { if (!core[i] && dist[i] <= lo) { core[i] = 1; stack.push(i); } };
    for (let x = 0; x < w; x++) { seed(x); seed((h - 1) * w + x); }
    for (let y = 0; y < h; y++) { seed(y * w); seed(y * w + w - 1); }
    while (stack.length) {
      const i = stack.pop()!;
      const x = i % w;
      if (x > 0) seed(i - 1);
      if (x < w - 1) seed(i + 1);
      if (i >= w) seed(i - w);
      if (i < n - w) seed(i + w);
    }
  }

  // Edge ring: pixels within 2 px of the core get partial alpha from their colour distance.
  const near = new Uint8Array(core);
  for (let pass = 0; pass < 2; pass++) {
    const prev = new Uint8Array(near);
    for (let i = 0; i < n; i++) {
      if (prev[i]) continue;
      const x = i % w;
      if ((x > 0 && prev[i - 1]) || (x < w - 1 && prev[i + 1]) || (i >= w && prev[i - w]) || (i < n - w && prev[i + w])) near[i] = 1;
    }
  }

  const out = new ImageData(new Uint8ClampedArray(d), w, h);
  const od = out.data;
  for (let i = 0, p = 0; i < n; i++, p += 4) {
    let a = 1;
    if (core[i]) a = 0;
    else if (near[i]) a = Math.min(1, Math.max(0, (dist[i] - lo) / (hi - lo)));
    a *= d[p + 3] / 255;
    alpha[i] = a;
    // Remove the old background colour blended into edge pixels (no white halo on dark colours).
    if (a > 0.02 && a < 0.98) {
      od[p] = (d[p] - (1 - a) * br) / a;
      od[p + 1] = (d[p + 1] - (1 - a) * bg) / a;
      od[p + 2] = (d[p + 2] - (1 - a) * bb) / a;
    }
  }
  const source = document.createElement("canvas");
  source.width = w;
  source.height = h;
  source.getContext("2d")!.putImageData(out, 0, 0);
  return { source, alpha, maskWidth: w, maskHeight: h, kind: "exact", method: "color", detected: "plain" };
}

// ---------------------------------------------------------------------------
// 2. Person (MediaPipe)
// ---------------------------------------------------------------------------

const MP_WASM = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.2.3/wasm";
const MP_MODEL =
  "https://storage.googleapis.com/mediapipe-models/image_segmenter/selfie_multiclass_256x256/float32/latest/selfie_multiclass_256x256.tflite";

let segmenter: Promise<ImageSegmenter> | null = null;

/**
 * MediaPipe's WASM prints routine "INFO: ..." lines through console.error, which
 * shows up as an error in the Next dev overlay and in error monitoring. Drop
 * only those lines while MediaPipe is running.
 */
async function quietMediaPipe<T>(fn: () => T | Promise<T>): Promise<T> {
  const original = console.error;
  console.error = (...args: unknown[]) => {
    if (typeof args[0] === "string" && /^(INFO|I\d{4}|W\d{4}):?\s/.test(args[0])) return;
    original(...args);
  };
  try {
    return await fn();
  } finally {
    console.error = original;
  }
}

function getSegmenter() {
  if (!segmenter) {
    segmenter = (async () => {
      const { FilesetResolver, ImageSegmenter } = await import("@mediapipe/tasks-vision");
      const fileset = await FilesetResolver.forVisionTasks(MP_WASM);
      return quietMediaPipe(() =>
        ImageSegmenter.createFromOptions(fileset, {
          baseOptions: { modelAssetPath: MP_MODEL, delegate: "CPU" },
          runningMode: "IMAGE",
          outputConfidenceMasks: true,
          outputCategoryMask: false,
        }),
      );
    })().catch((e) => {
      segmenter = null;
      throw e;
    });
  }
  return segmenter;
}

export interface PersonMask extends SubjectMask {
  /** Share of the image the model thinks is a person, and is face skin (class 3). */
  personShare: number;
  faceShare: number;
  /** Share that is hair or clothes: a real person nearly always has some; a skin-coloured object doesn't. */
  hairClothesShare: number;
}

export async function personMask(source: HTMLCanvasElement): Promise<PersonMask> {
  const seg = await getSegmenter();
  const result = await quietMediaPipe(() => seg.segment(source));
  const masks = result.confidenceMasks;
  if (!masks?.[0]) {
    result.close();
    throw new Error("Could not find a person in this photo.");
  }
  const bg = masks[0].getAsFloat32Array();
  // Classes: 1 hair, 2 body skin, 3 face skin, 4 clothes, 5 accessories.
  const hair = masks[1]?.getAsFloat32Array();
  const face = masks[3]?.getAsFloat32Array();
  const clothes = masks[4]?.getAsFloat32Array();
  const alpha = new Float32Array(bg.length);
  let person = 0;
  let faceN = 0;
  let hairClothesN = 0;
  for (let i = 0; i < bg.length; i++) {
    alpha[i] = 1 - bg[i];
    if (bg[i] < 0.5) person++;
    if (face && face[i] > 0.5) faceN++;
    if ((hair && hair[i] > 0.5) || (clothes && clothes[i] > 0.5)) hairClothesN++;
  }
  const mask: PersonMask = {
    source,
    alpha,
    maskWidth: masks[0].width,
    maskHeight: masks[0].height,
    kind: "soft",
    method: "person",
    detected: "person",
    personShare: person / bg.length,
    faceShare: faceN / bg.length,
    hairClothesShare: hairClothesN / bg.length,
  };
  result.close();
  if (mask.personShare < 0.03) throw new Error("Could not find a person in this photo.");
  return mask;
}

// ---------------------------------------------------------------------------
// 3. Any object (U²-Net-p via onnxruntime-web)
// ---------------------------------------------------------------------------

const ORT_BASE = "https://cdn.jsdelivr.net/npm/onnxruntime-web@1.20.1/dist/";
const U2NET_URL = "/models/u2netp.onnx";
const U2NET_SIZE = 320;

// Minimal typings for the parts of onnxruntime-web we use (loaded from the CDN at runtime).
interface OrtTensor { data: Float32Array; dims: readonly number[] }
interface OrtSession {
  inputNames: readonly string[];
  outputNames: readonly string[];
  run(feeds: Record<string, OrtTensor>): Promise<Record<string, OrtTensor>>;
}
interface Ort {
  env: { wasm: { wasmPaths: string; numThreads: number } };
  Tensor: new (type: "float32", data: Float32Array, dims: number[]) => OrtTensor;
  InferenceSession: { create(url: string, opts: object): Promise<OrtSession> };
}

let u2net: Promise<{ ort: Ort; session: OrtSession }> | null = null;

function loadScript(src: string) {
  return new Promise<void>((resolve, reject) => {
    const s = document.createElement("script");
    s.src = src;
    s.async = true;
    s.crossOrigin = "anonymous";
    s.onload = () => resolve();
    s.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.head.appendChild(s);
  });
}

function getU2Net() {
  if (!u2net) {
    u2net = (async () => {
      const w = window as unknown as { ort?: Ort };
      if (!w.ort) await loadScript(`${ORT_BASE}ort.min.js`);
      const ort = w.ort!;
      ort.env.wasm.wasmPaths = ORT_BASE;
      ort.env.wasm.numThreads = 1; // threads need cross-origin isolation, which the site doesn't use
      const session = await ort.InferenceSession.create(U2NET_URL, { executionProviders: ["wasm"], graphOptimizationLevel: "all" });
      return { ort, session };
    })().catch((e) => {
      u2net = null;
      throw e;
    });
  }
  return u2net;
}

export async function objectMask(source: HTMLCanvasElement): Promise<SubjectMask> {
  const { ort, session } = await getU2Net();
  const S = U2NET_SIZE;
  const small = document.createElement("canvas");
  small.width = S;
  small.height = S;
  const sctx = small.getContext("2d")!;
  sctx.imageSmoothingQuality = "high";
  sctx.drawImage(source, 0, 0, S, S);
  const px = sctx.getImageData(0, 0, S, S).data;

  // Same preprocessing as the reference implementation: scale by the max, then ImageNet mean/std, NCHW.
  let max = 1;
  for (let i = 0; i < px.length; i += 4) max = Math.max(max, px[i], px[i + 1], px[i + 2]);
  const mean = [0.485, 0.456, 0.406];
  const std = [0.229, 0.224, 0.225];
  const input = new Float32Array(3 * S * S);
  for (let i = 0; i < S * S; i++) {
    for (let c = 0; c < 3; c++) input[c * S * S + i] = (px[i * 4 + c] / max - mean[c]) / std[c];
  }
  const out = await session.run({ [session.inputNames[0]]: new ort.Tensor("float32", input, [1, 3, S, S]) });
  const pred = out[session.outputNames[0]].data;
  let lo = Infinity;
  let hi = -Infinity;
  for (let i = 0; i < S * S; i++) {
    if (pred[i] < lo) lo = pred[i];
    if (pred[i] > hi) hi = pred[i];
  }
  const alpha = new Float32Array(S * S);
  const range = hi - lo || 1;
  for (let i = 0; i < S * S; i++) alpha[i] = (pred[i] - lo) / range;
  return { source, alpha, maskWidth: S, maskHeight: S, kind: "soft", method: "object", detected: "object" };
}

// ---------------------------------------------------------------------------
// Auto choice and compositing
// ---------------------------------------------------------------------------

/**
 * Pick a method: a plain border means a plain background (fast and exact, no download).
 * Otherwise use the person model if it finds a face, else the general object model.
 */
export async function autoMask(
  source: HTMLCanvasElement,
  color: ColorKeyOptions,
  onStatus?: (msg: string) => void,
): Promise<SubjectMask> {
  const border = analyzeBorder(source);
  if (border.transparent) return colorKeyMask(source, border, color);
  if (border.uniform) {
    const keyed = colorKeyMask(source, border, color);
    const { kept, fill } = keptShape(keyed);
    // Removing almost nothing, almost everything (subject in the background colour), or just a
    // frame around a rectangular picture means the plain-colour guess was wrong: use the AI.
    if (kept > 0.005 && kept < 0.97 && fill < 0.97) {
      // A subject cut off by the frame (shoulders in a passport photo) may be a person whose
      // clothes match the background (white shirt, white wall). Keep what the person model sees.
      if (!touchesEdge(keyed)) return keyed;
      onStatus?.("Checking for a person…");
      try {
        const p = await personMask(source);
        if (looksLikePerson(p)) return withPerson(keyed, p);
      } catch {
        // no person: the colour key alone is right
      }
      return keyed;
    }
  }
  onStatus?.("Looking for a person…");
  try {
    const p = await personMask(source);
    if (looksLikePerson(p) && p.personShare > 0.05) return p;
  } catch {
    // no person: fall through to the object model
  }
  onStatus?.("Finding the main subject…");
  return objectMask(source);
}

/**
 * The person model also fires on skin-coloured objects (a pink ball scored 8% "face").
 * Real people come with hair or clothes: 27–42% of the person area in tests, ~0% on the ball.
 */
function looksLikePerson(p: PersonMask) {
  return p.faceShare > 0.002 && p.hairClothesShare >= 0.15 * p.personShare;
}

/** Share of the image kept as subject, and how fully it fills its bounding box (1 = a rectangle). */
function keptShape(m: SubjectMask) {
  const { maskWidth: w, maskHeight: h, alpha } = m;
  let k = 0;
  let x0 = w, y0 = h, x1 = -1, y1 = -1;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (alpha[y * w + x] <= 0.5) continue;
      k++;
      if (x < x0) x0 = x;
      if (x > x1) x1 = x;
      if (y < y0) y0 = y;
      if (y > y1) y1 = y;
    }
  }
  const box = k ? (x1 - x0 + 1) * (y1 - y0 + 1) : 1;
  return { kept: k / (w * h), fill: k / box };
}

/** True if the kept subject covers at least 5% of any side of the frame. */
function touchesEdge(m: SubjectMask) {
  const { maskWidth: w, maskHeight: h, alpha } = m;
  const count = (get: (k: number) => number, len: number) => {
    let c = 0;
    for (let k = 0; k < len; k++) if (get(k) > 0.5) c++;
    return c / len;
  };
  return (
    count((x) => alpha[x], w) >= 0.05 ||
    count((x) => alpha[(h - 1) * w + x], w) >= 0.05 ||
    count((y) => alpha[y * w], h) >= 0.05 ||
    count((y) => alpha[y * w + w - 1], h) >= 0.05
  );
}

/** Colour-key mask plus everything the person model is confident is the person. */
function withPerson(keyed: SubjectMask, person: PersonMask): SubjectMask {
  const { maskWidth: w, maskHeight: h } = keyed;
  const small = new ImageData(person.maskWidth, person.maskHeight);
  for (let i = 0; i < person.alpha.length; i++) {
    // Same 0.3–0.7 ramp the compositor uses for soft masks at the default softness.
    small.data[i * 4 + 3] = Math.round(Math.min(1, Math.max(0, (person.alpha[i] - 0.3) / 0.4)) * 255);
  }
  const sc = document.createElement("canvas");
  sc.width = person.maskWidth;
  sc.height = person.maskHeight;
  sc.getContext("2d")!.putImageData(small, 0, 0);
  const big = document.createElement("canvas");
  big.width = w;
  big.height = h;
  const bctx = big.getContext("2d")!;
  bctx.imageSmoothingQuality = "high";
  bctx.drawImage(sc, 0, 0, w, h);
  const pa = bctx.getImageData(0, 0, w, h).data;
  const alpha = new Float32Array(keyed.alpha);
  for (let i = 0; i < alpha.length; i++) alpha[i] = Math.max(alpha[i], pa[i * 4 + 3] / 255);
  // Pixels the person model adds back must use the original colours, not the de-haloed ones.
  const src = keyed.source.getContext("2d")!.getImageData(0, 0, w, h);
  const orig = person.source.getContext("2d")!.getImageData(0, 0, w, h).data;
  for (let i = 0; i < alpha.length; i++) {
    if (alpha[i] > keyed.alpha[i]) {
      const p = i * 4;
      src.data[p] = orig[p];
      src.data[p + 1] = orig[p + 1];
      src.data[p + 2] = orig[p + 2];
    }
  }
  const source = document.createElement("canvas");
  source.width = w;
  source.height = h;
  source.getContext("2d")!.putImageData(src, 0, 0);
  return { ...keyed, source, alpha, detected: "person-plain" };
}

export interface CompositeOptions {
  /** CSS colour for the new background, or null for transparent. */
  background: string | null;
  /** Edge softness 0–1 for AI masks: low = crisp cut-out, high = feathered (better for hair). Default 0.4. */
  softness?: number;
}

/** Draw the subject over a new background (or none) at the source's working size. */
export function compositeSubject(mask: SubjectMask, { background, softness = 0.4 }: CompositeOptions): HTMLCanvasElement {
  const { source, maskWidth: mw, maskHeight: mh } = mask;
  const w = source.width;
  const h = source.height;

  const band = Math.min(0.9, Math.max(0.05, softness));
  const lo = 0.5 - band / 2;
  const alpha = new ImageData(mw, mh);
  for (let i = 0; i < mask.alpha.length; i++) {
    const a = mask.kind === "exact" ? mask.alpha[i] : Math.min(1, Math.max(0, (mask.alpha[i] - lo) / band));
    alpha.data[i * 4 + 3] = Math.round(a * 255);
  }
  const maskCanvas = document.createElement("canvas");
  maskCanvas.width = mw;
  maskCanvas.height = mh;
  maskCanvas.getContext("2d")!.putImageData(alpha, 0, 0);

  const subject = document.createElement("canvas");
  subject.width = w;
  subject.height = h;
  const sctx = subject.getContext("2d")!;
  sctx.drawImage(source, 0, 0);
  sctx.globalCompositeOperation = "destination-in";
  sctx.imageSmoothingEnabled = true;
  sctx.imageSmoothingQuality = "high";
  sctx.drawImage(maskCanvas, 0, 0, w, h);
  if (!background) return subject;

  const out = document.createElement("canvas");
  out.width = w;
  out.height = h;
  const octx = out.getContext("2d")!;
  octx.fillStyle = background;
  octx.fillRect(0, 0, w, h);
  octx.drawImage(subject, 0, 0);
  return out;
}

/** Replace everything except the person with a flat colour (used by the photo tools' White background switch). */
export async function replaceBackground(img: HTMLImageElement, color = "#ffffff"): Promise<HTMLImageElement> {
  return canvasToImage(compositeSubject(await personMask(prepareSource(img, 1600)), { background: color }));
}
