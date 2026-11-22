"use client";

import { useEffect, useRef, useState } from "react";
import { drawFrame, encodeCanvas, formatKB, loadImage, type ProcessResult } from "@/lib/image";

type Layout = "stack" | "side";

const base = { zoom: 1, offsetX: 0, offsetY: 0, inkColor: "original" as const };

function Slot({ label, img, onFile }: { label: string; img: HTMLImageElement | null; onFile: (f: File) => void }) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <button
      type="button"
      onClick={() => ref.current?.click()}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) onFile(f); }}
      className="flex min-h-40 w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-line-2 bg-paper/60 p-4 text-center transition hover:border-ink"
    >
      {img ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={img.src} alt={label} className="max-h-32 rounded border border-line object-contain" />
      ) : (
        <span className="font-display text-lg font-bold text-ink">+ {label}</span>
      )}
      <span className="mt-2 font-mono text-[0.7rem] text-ink-3">{img ? "Tap to change" : "JPG · PNG · WebP"}</span>
      <input ref={ref} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f); e.target.value = ""; }} />
    </button>
  );
}

export default function JoinPhotoSignature() {
  const [photo, setPhoto] = useState<HTMLImageElement | null>(null);
  const [sign, setSign] = useState<HTMLImageElement | null>(null);
  const [layout, setLayout] = useState<Layout>("stack");
  const [width, setWidth] = useState(350);
  const [minKB, setMinKB] = useState(20);
  const [maxKB, setMaxKB] = useState(100);
  const [clean, setClean] = useState(true);
  const [result, setResult] = useState<ProcessResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const runId = useRef(0);

  const load = (set: (i: HTMLImageElement) => void) => async (f: File) => {
    try {
      set(await loadImage(f));
      setError(null);
    } catch (e) {
      setError((e as Error).message);
    }
  };

  useEffect(() => {
    if (!photo || !sign) return;
    const id = ++runId.current;
    const t = setTimeout(async () => {
      if (minKB >= maxKB) return setError("Maximum KB must be larger than minimum KB.");
      const W = Math.max(100, Math.round(width));
      const pad = Math.round(W * 0.04);
      let canvas: HTMLCanvasElement;
      if (layout === "stack") {
        const ph = Math.round((W * 4.5) / 3.5);
        const sh = Math.round(W / 3);
        canvas = document.createElement("canvas");
        canvas.width = W;
        canvas.height = ph + sh;
        const ctx = canvas.getContext("2d")!;
        ctx.fillStyle = "#fff";
        ctx.fillRect(0, 0, W, canvas.height);
        ctx.drawImage(drawFrame(photo, W, ph, { ...base, fit: "cover", cleanSignature: false, threshold: 150 }), 0, 0);
        ctx.drawImage(drawFrame(sign, W - 2 * pad, sh - 2 * pad, { ...base, fit: "contain", cleanSignature: clean, threshold: 150 }), pad, ph + pad);
        ctx.strokeStyle = "#d0d0d0";
        ctx.beginPath();
        ctx.moveTo(0, ph + 0.5);
        ctx.lineTo(W, ph + 0.5);
        ctx.stroke();
      } else {
        const ph = Math.round((W * 4.5) / 3.5);
        const sw = W;
        canvas = document.createElement("canvas");
        canvas.width = W + sw;
        canvas.height = ph;
        const ctx = canvas.getContext("2d")!;
        ctx.fillStyle = "#fff";
        ctx.fillRect(0, 0, canvas.width, ph);
        ctx.drawImage(drawFrame(photo, W, ph, { ...base, fit: "cover", cleanSignature: false, threshold: 150 }), 0, 0);
        const sh = Math.round(sw / 2.5);
        ctx.drawImage(drawFrame(sign, sw - 2 * pad, sh, { ...base, fit: "contain", cleanSignature: clean, threshold: 150 }), W + pad, Math.round((ph - sh) / 2));
      }
      const r = await encodeCanvas(canvas, { minKB, maxKB, dpi: 200 });
      if (id !== runId.current) return URL.revokeObjectURL(r.url);
      setError(null);
      setResult((old) => {
        if (old) URL.revokeObjectURL(old.url);
        return r;
      });
    }, 250);
    return () => clearTimeout(t);
  }, [photo, sign, layout, width, minKB, maxKB, clean]);

  const ok = result && result.bytes >= minKB * 1024 && result.bytes <= maxKB * 1024;

  return (
    <div className="card p-4 sm:p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <p className="label mb-2">01 · Photo</p>
          <Slot label="Add photo" img={photo} onFile={load(setPhoto)} />
        </div>
        <div>
          <p className="label mb-2">02 · Signature</p>
          <Slot label="Add signature" img={sign} onFile={load(setSign)} />
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-[auto_1fr_1fr_1fr] sm:items-end">
        <div>
          <p className="label">Layout</p>
          <div className="mt-1.5 flex gap-2">
            <button type="button" aria-pressed={layout === "stack"} onClick={() => setLayout("stack")} className="chip !py-1 !text-xs">Photo above sign</button>
            <button type="button" aria-pressed={layout === "side"} onClick={() => setLayout("side")} className="chip !py-1 !text-xs">Side by side</button>
          </div>
        </div>
        <label className="block">
          <span className="label">Photo width px</span>
          <input type="number" min={100} max={1200} value={width} onChange={(e) => setWidth(+e.target.value)} className="field mt-1" />
        </label>
        <label className="block">
          <span className="label">Min KB</span>
          <input type="number" min={0} value={minKB} onChange={(e) => setMinKB(+e.target.value)} className="field mt-1" />
        </label>
        <label className="block">
          <span className="label">Max KB</span>
          <input type="number" min={1} value={maxKB} onChange={(e) => setMaxKB(+e.target.value)} className="field mt-1" />
        </label>
      </div>
      <label className="mt-4 flex items-center gap-2 text-sm text-ink-2">
        <input type="checkbox" checked={clean} onChange={(e) => setClean(e.target.checked)} />
        Clean the signature’s paper background
      </label>

      {error && <p className="mt-4 rounded-lg bg-stamp-50 p-3 text-sm text-stamp" role="alert">{error}</p>}

      {result && (
        <div className="mt-6 grid gap-6 rounded-xl border border-line bg-paper/60 p-5 md:grid-cols-[auto_1fr] md:items-center" aria-live="polite">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={result.url} alt="Joined photo and signature" className="cropmarks mx-auto max-h-80 border border-line bg-white shadow-[var(--shadow-lift)]" />
          <div>
            <p className={`font-display text-4xl font-extrabold ${ok ? "text-ink" : "text-stamp"}`}>
              {(result.bytes / 1024).toFixed(1)}
              <span className="ml-1 text-lg text-ink-3">KB</span>
            </p>
            <p className="mt-1 font-mono text-xs text-ink-3">{result.width} × {result.height} px · JPG · 200 DPI</p>
            {result.padded && <p className="mt-1 text-xs text-ink-3">Raised to the {minKB} KB minimum without changing the picture.</p>}
            <a href={result.url} download={`photo-and-signature-${Math.round(result.bytes / 1024)}kb.jpg`} className="btn btn-pen mt-4">
              Download JPG · {formatKB(result.bytes)}
            </a>
          </div>
        </div>
      )}
      {!result && <p className="mt-6 text-sm text-ink-3">Add both images to see the joined result.</p>}
    </div>
  );
}
