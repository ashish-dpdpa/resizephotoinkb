// On-device background replacement for portrait photos using MediaPipe's
// selfie multiclass segmenter (Apache-2.0). The photo never leaves the browser:
// only the WebAssembly runtime and the model file are downloaded, once.

import type { ImageSegmenter } from "@mediapipe/tasks-vision";

const WASM_BASE = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.2.3/wasm";
const MODEL_URL =
  "https://storage.googleapis.com/mediapipe-models/image_segmenter/selfie_multiclass_256x256/float32/latest/selfie_multiclass_256x256.tflite";

let segmenter: Promise<ImageSegmenter> | null = null;

function getSegmenter() {
  if (!segmenter) {
    segmenter = (async () => {
      const { FilesetResolver, ImageSegmenter } = await import("@mediapipe/tasks-vision");
      const fileset = await FilesetResolver.forVisionTasks(WASM_BASE);
      return ImageSegmenter.createFromOptions(fileset, {
        baseOptions: { modelAssetPath: MODEL_URL, delegate: "CPU" },
        runningMode: "IMAGE",
        outputConfidenceMasks: true,
        outputCategoryMask: false,
      });
    })().catch((e) => {
      segmenter = null;
      throw e;
    });
  }
  return segmenter;
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

/** Replace everything except the person with a flat colour (white by default). */
export async function replaceBackground(img: HTMLImageElement, color = "#ffffff"): Promise<HTMLImageElement> {
  const seg = await getSegmenter();

  // Work at a sensible size: big phone photos are slow and gain nothing here.
  const maxSide = 1600;
  const s = Math.min(1, maxSide / Math.max(img.naturalWidth, img.naturalHeight));
  const w = Math.round(img.naturalWidth * s);
  const h = Math.round(img.naturalHeight * s);
  const src = document.createElement("canvas");
  src.width = w;
  src.height = h;
  src.getContext("2d")!.drawImage(img, 0, 0, w, h);

  const result = seg.segment(src);
  const bg = result.confidenceMasks?.[0]; // class 0 = background
  if (!bg) {
    result.close();
    throw new Error("Could not find a person in this photo.");
  }
  const conf = bg.getAsFloat32Array();
  const mw = bg.width;
  const mh = bg.height;

  // Person alpha = 1 − background confidence, with a soft edge so hair looks natural.
  const alpha = new ImageData(mw, mh);
  let personPixels = 0;
  for (let i = 0; i < conf.length; i++) {
    const a = Math.min(1, Math.max(0, (1 - conf[i] - 0.3) / 0.4));
    if (a > 0.5) personPixels++;
    alpha.data[i * 4 + 3] = Math.round(a * 255);
  }
  result.close();
  if (personPixels < conf.length * 0.03) throw new Error("Could not find a person in this photo.");

  const maskCanvas = document.createElement("canvas");
  maskCanvas.width = mw;
  maskCanvas.height = mh;
  maskCanvas.getContext("2d")!.putImageData(alpha, 0, 0);

  const person = document.createElement("canvas");
  person.width = w;
  person.height = h;
  const pctx = person.getContext("2d")!;
  pctx.drawImage(src, 0, 0);
  pctx.globalCompositeOperation = "destination-in";
  pctx.imageSmoothingEnabled = true;
  pctx.imageSmoothingQuality = "high";
  pctx.drawImage(maskCanvas, 0, 0, w, h);

  const out = document.createElement("canvas");
  out.width = w;
  out.height = h;
  const octx = out.getContext("2d")!;
  octx.fillStyle = color;
  octx.fillRect(0, 0, w, h);
  octx.drawImage(person, 0, 0);
  return canvasToImage(out);
}
